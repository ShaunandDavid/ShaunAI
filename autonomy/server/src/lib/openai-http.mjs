import dotenv from 'dotenv-safe';
import fs from 'node:fs';
import path from 'node:path';
dotenv.config({ allowEmptyValues: true });

function loadKey() {
  let k = (process.env.OPENAI_API_KEY || '').trim();
  const looksBroken = !k || k.includes('...') || k.length < 40;
  if (looksBroken) {
    try {
      const rootEnv = path.resolve(process.cwd(), '..', '.env');
      if (fs.existsSync(rootEnv)) {
        const txt = fs.readFileSync(rootEnv, 'utf8');
        const m = txt.match(/^[ \t]*OPENAI_API_KEY\s*=\s*([^\s#]+)/m);
        if (m) {
          const candidate = m[1].trim();
          if (candidate && !candidate.includes('...') && candidate.length >= 40) {
            k = candidate;
          }
        }
      }
    } catch { /* ignore */ }
  }
  return k;
}

const KEY = loadKey();
if (!KEY) throw new Error("OPENAI_API_KEY missing");

const PROJECT = process.env.OPENAI_PROJECT_ID; // e.g., prj_xxxxx
// const ORG = process.env.OPENAI_ORG_ID;      // optional

export async function chat(messages, model = process.env.OPENAI_MODEL || "gpt-4o-mini") {
  const headers = {
    "Authorization": `Bearer ${KEY}`,
    "Content-Type": "application/json",
  };
  if (PROJECT) headers["OpenAI-Project"] = PROJECT;
  // if (ORG) headers["OpenAI-Organization"] = ORG;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      // temperature: 0.2,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    // surface context errors clearly
    throw new Error(`OpenAI ${res.status}: ${text.slice(0,400)}`);
  }
  return JSON.parse(text);
}
