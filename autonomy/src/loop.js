import { read, write, p } from "./fsx.js";
import { ask } from "./openai.js";
import { runDailyContent } from "./routines/content.js";
import { runOutreach } from "./routines/outreach.js";
import fs from "fs";
const donePath  = p("tasks", "done.md");
const inboxPath = p("tasks", "inbox.md");
const memoryPath= p("persona", "shaunai.memory.md");
const opLogPath = p("operator.log");
const log = (m) => fs.appendFileSync(opLogPath, `[${new Date().toISOString()}] ${m}\n`);

function parseTasks(txt) {
  return txt.split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .map((line, i) => ({ i, line, pri: line.startsWith("[High]") ? 1 : line.startsWith("[Med]") ? 2 : 3 }));
}
function sortByPriority(tasks){ return tasks.sort((a,b)=>a.pri-b.pri); }
function saveInbox(tasks){ write(inboxPath, tasks.map(t=>t.line).join("\n") + (tasks.length? "\n": "")); }

async function executeTask(t) {
  log(`EXEC ${t.line}`);
  const memory = read(memoryPath);
  const plan = await ask(
    `Memory:\n${memory}\n\nTask:\n${t.line}\n\nRespond in ≤7 bullets: KPIs first, 3-step plan, smallest shippable chunk.`,
    "You are ShaunAI. Deliverables first."
  );

  let artifact = "";
  if (/daily.*post/i.test(t.line)) artifact = await runDailyContent();
  else if (/outreach/i.test(t.line)) artifact = await runOutreach();
  else if (/check site (https?:\/\/\S+)/i.test(t.line)) {
    const url = t.line.match(/check site (https?:\/\/\S+)/i)[1];
    const { runBrowserTask } = await import("./hooks/browser.js");
    await runBrowserTask(url, "screenshot");
    artifact = p("artifacts", "screenshot.png");
  } else {
    // generic “smallest chunk” execution
    const exec = await ask(`Implement smallest chunk for: ${t.line}\nReturn concrete steps.`,
      "You are ShaunAI. Give exact commands and file paths.");
    artifact = p("artifacts", "step.txt");
    write(artifact, exec + "\n");
  }

  const report = await ask(
    `Summarize in exactly 3 bullets:\n- What I did\n- Assumptions\n- Next 1 step\nArtifact: ${artifact}`,
    "You are ShaunAI. Ultra-concise."
  );

  const prevDone = read(donePath);
  write(donePath, (prevDone || "") + `\n${new Date().toISOString()}\n${t.line}\n${report}\n---\n`);
  log(`DONE ${t.line} -> ${artifact}`);
}

export async function runLoop() {
  const tasks = parseTasks(read(inboxPath));
  if (!tasks.length) { console.log("No tasks."); return false; }
  const top = sortByPriority(tasks)[0];
  console.log("Selected:", top.line);
  await executeTask(top);
  const remaining = sortByPriority(tasks).slice(1);
  saveInbox(remaining);
  return true;
}

export async function runUntilEmpty() {
  let progressed = false;
  while (true) {
    const tasks = parseTasks(read(inboxPath));
    if (!tasks.length) break;
    sortByPriority(tasks);
    await executeTask(tasks[0]);
    saveInbox(tasks.slice(1));
    progressed = true;
  }
  if (!progressed) console.log("Queue empty.");
}
