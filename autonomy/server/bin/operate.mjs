#!/usr/bin/env node
import 'dotenv/config';
import pino from 'pino';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { startOnce } from '../src/core/loop-once.js';
import { seedDaily } from '../src/core/seed.js';
import { loadPersona } from '../src/core/persona.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../logs');
await fs.ensureDir(logDir);

const log = pino(pino.destination({ dest: path.join(logDir, 'operator.log'), sync: true }));
console.info('[operate] start'); // smoke to terminal

const cmd = process.argv[2] || 'run';
if (cmd === 'seed') {
  const injected = await seedDaily();
  log.info({ msg: 'seed_manual', injected });
  process.exit(0);
}

const persona = await loadPersona({
  memoryFile: path.join(__dirname, '../tasks/persona.md'),
  fallbackVoice: 'Gritty, no-BS, hopeful, faith-aware; Jocko+RDJ+Paul.',
});

const result = await startOnce({ log, persona, maxTasks: Number(process.argv[3] || 10) });
log.info({ msg: 'run_once_complete', processed: result.processed });
console.info('[operate] done', result.processed); // smoke to terminal
process.exit(0);
