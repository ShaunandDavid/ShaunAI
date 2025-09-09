import dotenv from 'dotenv-safe';
import fs from 'node:fs';
import path from 'node:path';
dotenv.config({ allowEmptyValues: true });
import OpenAI from 'openai';

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

// Trim + fallback to root env if server/.env is broken
const KEY = loadKey();
if (!KEY) throw new Error("OPENAI_API_KEY missing");

const PROJECT = process.env.OPENAI_PROJECT_ID;
// const ORG = process.env.OPENAI_ORG_ID;

const openai = new OpenAI({
  apiKey: KEY,
  defaultHeaders: PROJECT ? { 'OpenAI-Project': PROJECT } : undefined,
  // organization: ORG,
});

export async function chat(messages, model = process.env.OPENAI_MODEL || "gpt-4o-mini") {
  return await openai.chat.completions.create({
    model,
    messages,
    // temperature: 0.2,
  });
}
