import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseTasks } from './parser.js';
import { executeTask } from './runner.js';
import { notify } from '../core/alerts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TASKS_DIR = path.join(__dirname, '../../tasks');
const INBOX = path.join(TASKS_DIR, 'inbox.md');
const DONE = path.join(TASKS_DIR, 'done.md');

function priorityRank(p) { return p === 'High' ? 0 : p === 'Med' ? 1 : 2; }
const safeOneLine = s => String(s || '').replace(/\s+/g, ' ').slice(0, 2000);

export async function startOnce({ log, persona, maxTasks = 10 }) {
  log.info({ msg: 'loop_once_start', maxTasks });
  await fs.ensureFile(INBOX);
  await fs.ensureFile(DONE);

  const inboxText = await fs.readFile(INBOX, 'utf-8');
  let tasks = parseTasks(inboxText);
  tasks.sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority)||a.index-b.index);

  let processed = 0;
  for (const task of tasks.slice(0, maxTasks)) {
    log.info({ msg: 'task_start', title: task.title, priority: task.priority, type: task.type });
    const result = await executeTask({ task, persona, log });
    const stamp = new Date().toISOString();
    const block = `\n- [${task.priority}] ${task.title}\n  - when: ${stamp}\n  - result: ${result.ok ? 'OK' : 'FAIL'}\n  - details: ${safeOneLine(result.msg)}\n`;
    await fs.appendFile(DONE, block);

    // Alert on failures or important events
    if (!result.ok) {
      await notify({ level: 'error', event: 'task_fail', data: { title: task.title, type: task.type, details: String(result.msg).slice(0, 500) } });
    } else if (['browser_buy'].includes(task.type)) {
      await notify({ level: 'warn', event: 'buy_event', data: { title: task.title, details: result.msg } });
    }

    // remove task line
    const current = await fs.readFile(INBOX, 'utf-8');
    await fs.writeFile(INBOX, current.replace(task.raw, ''));
    log.info({ msg: 'task_done', title: task.title, ok: result.ok });
    processed++;
  }
  if (processed === 0) log.info({ msg: 'queue_empty' });
  return { processed };
}
