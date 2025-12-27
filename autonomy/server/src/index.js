import dotenv from "dotenv-safe";
dotenv.config({ allowEmptyValues: true });
// --- crash guards (never die silently) ---
process.on("uncaughtException", (e) => console.error("[uncaughtException]", e));
process.on("unhandledRejection", (e) => console.error("[unhandledRejection]", e));

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import requestId from "express-request-id";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { canCallOpenAI } from "./lib/rateLimit.js";
import { isBrowserTask, doBrowserTask, doScreenshot, closeBrowser } from "./lib/operator-integration.js";

// --- config ---
const app  = express();
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "127.0.0.1"; // IPv4 avoids Windows localhost quirks

app.listen(PORT, HOST, () => {
  console.log(`ShaunAI server running at http://${HOST}:${PORT}`);
});

// Prefer installed Chrome on Windows to dodge sandbox issues
const CHROME_WIN = "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe";

// --- middleware ---
// security, logging, perf
app.use(helmet());
app.use(compression());
app.use(requestId());
app.use(pinoHttp({ autoLogging: true }));
// global basic per-IP limiter
app.use(rateLimit({ windowMs: 60_000, max: 300 }));
// body + cors
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// --- artifacts static ---
const artifactsDir = path.resolve(process.cwd(), "artifacts");
fs.mkdirSync(artifactsDir, { recursive: true });
app.use("/artifacts", express.static(artifactsDir, { maxAge: "1h" }));

// --- console UI static (unify UI to one server)
const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const TASKS = path.join(ROOT, "tasks");
const INBOX = path.join(TASKS, "inbox.md");
const LOGS  = path.join(ROOT, "logs", "operator.log");
fs.mkdirSync(PUBLIC, { recursive: true });
fs.mkdirSync(path.join(ROOT, "logs"), { recursive: true });
fs.mkdirSync(TASKS, { recursive: true });
if (!fs.existsSync(INBOX)) fs.writeFileSync(INBOX, "");
if (!fs.existsSync(LOGS)) fs.writeFileSync(LOGS, "");
app.use(express.static(PUBLIC));

// --- SSE hub ---
/** @type {Set<import('http').ServerResponse>} */
const clients = new Set();
function broadcast(obj) {
  const line = `data: ${JSON.stringify(obj)}\n\n`;
  for (const res of clients) res.write(line);
}

// --- state ---
/** @type {Array<{id:string,text:string,priority:'HIGH'|'MED'|'LOW',meta?:any,at:string}>} */
const queue = [];
const model = process.env.MODEL || "shaunai-agent";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
function loadOpenAIKey() {
  let k = (process.env.OPENAI_API_KEY || "").trim();
  const looksBroken = !k || k.includes("...") || k.length < 40;
  if (looksBroken) {
    try {
      const rootEnv = path.resolve(process.cwd(), "..", ".env");
      if (fs.existsSync(rootEnv)) {
        const txt = fs.readFileSync(rootEnv, "utf-8");
        const m = txt.match(/^[ \t]*OPENAI_API_KEY\s*=\s*([^\s#]+)/m);
        if (m) {
          const candidate = m[1].trim();
          if (candidate && !candidate.includes("...") && candidate.length >= 40) {
            k = candidate;
          }
        }
      }
    } catch {}
  }
  return k;
}
const OPENAI_API_KEY = loadOpenAIKey();
const ARTIFACTS_BASE = process.env.NOTION_FILE_BASEURL || `http://${HOST}:${PORT}/artifacts`;

// --- utils ---

const nowISO  = () => new Date().toISOString();
const say     = (content, tags) => broadcast({ type: "log", id: nanoid(), at: nowISO(), content, tags });

// Production-grade site audit
async function auditPage(url) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    const status = resp?.status() ?? null;

    const data = await page.evaluate(() => {
      const text = (sel) => document.querySelector(sel)?.textContent?.trim() || null;
      const attr = (sel, a) => document.querySelector(sel)?.getAttribute(a) || null;
      return {
        title: document.title || null,
        description: attr('meta[name="description"]', 'content'),
        h1: text('h1'),
        canonical: attr('link[rel="canonical"]', 'href'),
        robots: attr('meta[name="robots"]', 'content'),
        ogTitle: attr('meta[property="og:title"]', 'content'),
        ogImage: attr('meta[property="og:image"]', 'content'),
        links: document.querySelectorAll('a').length,
        images: document.querySelectorAll('img').length
      };
    });

    // quick screenshot for context
    const file = await captureScreenshot(url);

    return { status, ...data, screenshot: file };
  } finally {
    await browser.close().catch(() => {});
  }
}

async function launchBrowser() {
  const { default: puppeteer } = await import("puppeteer");
  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    (process.platform === "win32" ? CHROME_WIN : undefined);

  return puppeteer.launch({
    headless: "new",
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--hide-scrollbars",
    ],
  });
}

async function captureScreenshot(url) {
  const { default: puppeteer } = await import("puppeteer");
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const today = new Date().toISOString().slice(0, 10);
    const bucket = nanoid(6);
    const dir = path.join(artifactsDir, today, bucket);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, "screenshot.png");
    await page.screenshot({ path: filePath, fullPage: true });

    const publicUrl = `/artifacts/${today}/${bucket}/screenshot.png`;
    return publicUrl;
  } finally {
    await browser.close().catch(() => {});
  }
}

// ===== LLM: crisp Q&A answers =====

const LLM_MODEL = process.env.LLM_MODEL || "gpt-4o";

async function llmAnswer(userText, mode = "qa") {
  if (!OPENAI_API_KEY) {
    return { ok: false, text: "LLM not configured. Set OPENAI_API_KEY on the server." };
  }
  const sys = [
    "You are ShaunAI, Shaun’s digital twin.",
    "Voice: gritty, no-BS, hopeful, faith-aware.",
    "Default to a single, precise sentence; expand only when asked.",
    mode === "define"
      ? "When asked to define: 1) a crisp definition; 2) 2-3 senses if ambiguous; 3) 3–5 synonyms. Keep it tight."
      : "Answer directly with the most useful, actionable line. No fluff."
  ].join(" ");

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: userText }
      ]
    })
  });

  if (!resp.ok) {
    const err = await resp.text().catch(() => resp.statusText);
    return { ok: false, text: `LLM error: ${err}` };
  }
  const json = await resp.json();
  const text = json?.choices?.[0]?.message?.content?.trim() || "No answer.";
  return { ok: true, text };
}


// --- core worker ---
async function runOne() {
  const job = queue.shift();
  if (!job) return null;

  broadcast({ type: "status", id: job.id, status: "started", at: nowISO(), meta: { text: job.text, priority: job.priority } });
  broadcast({ type: "message", id: nanoid(), role: "agent", content: `Starting ${job.priority} task: “${job.text}”.`, at: nowISO() });
  say("What I did: parsed the request and set execution plan.", ["WHAT_I_DID"]);

  try {
    // Slash override: /define TERM  → definitional answer
    if (job.meta?.action === "define" && job.meta?.term) {
      say(`Defining “${job.meta.term}”…`, ["WHAT_I_DID"]);
      const ans = await llmAnswer(`Define the term: ${job.meta.term}`, "define");
      broadcast({ type: "message", id: nanoid(), role: "agent", content: ans.text, at: nowISO() });
      broadcast({ type: "status", id: job.id, status: "completed", at: nowISO() });
      return job.id;
    }

    // Q&A fallback when no explicit action detected and no URL yet
    if (!job.meta?.action) {
      // If the text looks like a question or a definition ask, answer it directly.
      const looksQA = /^(what|who|why|how|when|where|define|meaning|explain)\b/i.test(job.text);
      if (looksQA) {
        say("No URL detected; answering directly via LLM.", ["WHAT_I_DID"]);
        const ans = await llmAnswer(job.text, /define|meaning/i.test(job.text) ? "define" : "qa");
        broadcast({ type: "message", id: nanoid(), role: "agent", content: ans.text, at: nowISO() });
        broadcast({ type: "status", id: job.id, status: "completed", at: nowISO() });
        return job.id;
      }
    }

    // Slash override: /audit URL
    if (job.meta?.action === "audit" && job.meta?.url) {
      const target = job.meta.url;
      say(`Auditing ${target}…`, ["WHAT_I_DID"]);
      const report = await auditPage(target);

      // concise, clean English summary
      const lines = [
        `Status: ${report.status ?? "n/a"}`,
        `Title: ${report.title ?? "—"}`,
        `Description: ${report.description ?? "—"}`,
        `H1: ${report.h1 ?? "—"}`,
        `Canonical: ${report.canonical ?? "—"}`,
        `Robots: ${report.robots ?? "—"}`,
        `OG Title: ${report.ogTitle ?? "—"}`,
        `OG Image: ${report.ogImage ?? "—"}`,
        `Counts: ${report.links} links · ${report.images} images`
      ];
      say(lines.join("\n"), ["WHAT_I_DID"]);

      if (report.screenshot) {
        broadcast({ type: "screenshot", id: nanoid(), url: report.screenshot, at: nowISO(), title: `Screenshot: ${target}` });
      }

      say("Next step: prioritize fixes (metadata, headings, canonical, robots).", ["NEXT_STEP"]);
      broadcast({ type: "status", id: job.id, status: "completed", at: nowISO() });
      return job.id;
    }

    // Slash override: /shot URL
    if (job.meta?.action === "shot" && job.meta?.url) {
      say(`Capturing a screenshot of ${job.meta.url}…`, ["WHAT_I_DID"]);
      const shotUrl = await captureScreenshot(job.meta.url);
      broadcast({ type: "screenshot", id: nanoid(), url: shotUrl, at: nowISO(), title: `Screenshot: ${job.meta.url}` });
      say("Next step: annotate and extract key issues if required.", ["NEXT_STEP"]);
      broadcast({ type: "status", id: job.id, status: "completed", at: nowISO() });
      return job.id;
    }

    // Free-text URL detection
    const m = job.text.match(/https?:\/\/[^\s]+/);
    if (m) {
      const target = m[0];
      say(`Detected URL: ${target}. Navigating and capturing…`, ["WHAT_I_DID"]);
      const shotUrl = await captureScreenshot(target);
      broadcast({ type: "screenshot", id: nanoid(), url: shotUrl, at: nowISO(), title: `Screenshot: ${target}` });
    } else {
      say("No URL provided; performed a dry run.", ["ASSUMPTIONS"]);
    }

    say("Next step: wire form-fill or audit steps as needed.", ["NEXT_STEP"]);
    broadcast({ type: "status", id: job.id, status: "completed", at: nowISO() });
  } catch (err) {
    say(`Error: ${String(err)}`, ["ASSUMPTIONS"]);
    broadcast({ type: "status", id: job.id, status: "error", at: nowISO(), meta: { error: String(err) } });
  }
  return job.id;
}
// Health (handled later with richer data at /api/status)

// Plain-text list for the read-only UI card
app.get("/api/tasks", (req, res) => {
  const lines = queue.map(q => `[${q.priority}] ${q.text} @ ${q.at}`).join("\n");
  res.type("text/plain").send(lines || "(empty)");
});

// Optional JSON list for tooling
app.get("/api/tasks.json", (_req, res) => res.json(queue));

// Queue a task
app.post("/api/tasks", (req, res) => {
  const { text, priority = "HIGH", meta = {} } = req.body || {};
  if (!text || typeof text !== "string") return res.status(400).send("Missing task text");

  const job = { id: nanoid(), text: text.trim(), priority, meta, at: nowISO() };
  queue.push(job);

  // notify feed
  broadcast({ type: "message", id: job.id, role: "operator", content: `[${priority}] ${job.text}`, at: job.at });

  // kick the worker once (auto-drain also runs)
  runOne().catch((err) => broadcast({ type: "status", id: job.id, status: "error", at: nowISO(), meta: { error: String(err) } }));

  res.status(201).json({ id: job.id });
});

// Manual single-step run
app.post("/api/run-one", async (req, res) => {
  try {
    const id = await runOne();
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});


// --- Chat API with Browser Operator Integration ---
app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Missing message" });
  }

  // Check if this is a browser task
  if (isBrowserTask(message)) {
    broadcast({ type: "message", id: nanoid(), role: "user", content: message, at: nowISO() });
    broadcast({ type: "message", id: nanoid(), role: "agent", content: "Starting browser task...", at: nowISO() });

    try {
      const result = await doBrowserTask(message, broadcast);
      broadcast({ type: "message", id: nanoid(), role: "agent", content: result.summary || "Browser task completed.", at: nowISO() });
      if (result.screenshot) {
        broadcast({ type: "screenshot", id: nanoid(), url: result.screenshot, at: nowISO(), title: "Browser result" });
      }
      return res.json({ reply: result.summary, screenshot: result.screenshot, browserTask: true });
    } catch (err) {
      const errMsg = `Browser task failed: ${String(err)}`;
      broadcast({ type: "message", id: nanoid(), role: "agent", content: errMsg, at: nowISO() });
      return res.status(500).json({ error: errMsg });
    }
  }

  // Not a browser task - use OpenAI LLM
  if (!canCallOpenAI()) {
    return res.status(429).json({ error: "Rate limited. Try again in a moment." });
  }
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "LLM not configured. Set OPENAI_API_KEY." });
  }

  broadcast({ type: "message", id: nanoid(), role: "user", content: message, at: nowISO() });

  try {
    const messages = [
      { role: "system", content: "You are ShaunAI, Shaun's digital twin. Voice: gritty, no-BS, hopeful, faith-aware. Answer directly and concisely." },
      ...history.slice(-10),
      { role: "user", content: message }
    ];

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.3,
        messages
      })
    });

    if (!resp.ok) {
      const err = await resp.text().catch(() => resp.statusText);
      return res.status(500).json({ error: `LLM error: ${err}` });
    }

    const json = await resp.json();
    const reply = json?.choices?.[0]?.message?.content?.trim() || "No response.";

    broadcast({ type: "message", id: nanoid(), role: "agent", content: reply, at: nowISO() });
    return res.json({ reply });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// --- unified console APIs ---

// Health/status used by console footer
app.get("/api/status", async (_req, res) => {
  try {
    const inboxMd = fs.existsSync(INBOX) ? fs.readFileSync(INBOX, "utf-8") : "";
    const inboxCount = (inboxMd.match(/^\s*\-\s*\[(High|Med|Low)\]/gim) || []).length;
    res.json({ ok: true, model: OPENAI_MODEL || model, keyLoaded: Boolean(OPENAI_API_KEY), inboxCount, ar