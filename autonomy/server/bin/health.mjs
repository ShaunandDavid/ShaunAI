#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tasksDir = path.join(__dirname, '../tasks');
const logsDir = path.join(__dirname, '../logs');
const artsDir = path.join(__dirname, '../artifacts');
const inbox = path.join(tasksDir, 'inbox.md');
const done = path.join(tasksDir, 'done.md');
const opLog = path.join(logsDir, 'operator.log');

const exists = p => fs.pathExists(p);
const read = async p => (await exists(p)) ? (await fs.readFile(p,'utf-8')) : '';

function countTasks(md) {
  return (md.match(/^\s*\-\s*\[(High|Med|Low)\]/gim) || []).length;
}
function lastLines(s, n=10){ return s.trim().split(/\r?\n/).slice(-n).join('\n'); }
function todayDir(){ return new Date().toISOString().slice(0,10); }

(async ()=>{
  const [inboxMd, doneMd, logMd] = await Promise.all([read(inbox), read(done), read(opLog)]);

  const tInbox = countTasks(inboxMd);
  const tDone = countTasks(doneMd);

  const today = path.join(artsDir, todayDir());
  const hasArts = await exists(today);
  const subdirs = hasArts ? (await fs.readdir(today)) : [];
  const artCounts = {};
  for (const d of subdirs) {
    const p = path.join(today, d);
    const files = (await fs.readdir(p).catch(()=>[]));
    artCounts[d] = files.length;
  }

  console.log('=== ShaunAI Health ===');
  console.log('Queue (inbox.md):', tInbox);
  console.log('Done (count):', tDone);
  console.log('Artifacts today:', hasArts ? todayDir() : 'none');
  for (const [k,v] of Object.entries(artCounts)) console.log(` - ${k}: ${v}`);
  console.log('\nLast log lines:');
  console.log(lastLines(logMd || 'No logs yet.', 12));
})();
