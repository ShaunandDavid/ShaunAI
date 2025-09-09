import { ask } from '../openai.js';
import { p, write, today } from '../fsx.js';
import { sendToMake } from '../hooks/make.js';
import { toCSV } from '../csv.js';

export async function runOutreach() {
  const prompt = `\nReturn JSON array of 10 messages (≤120 chars), keys: messages:[{"text":""},...].\nTone: direct, respectful, ROI-driven. Use {{NAME}} as the only placeholder.\n`;
  const raw = await ask(prompt, 'You are ShaunAI. ROI-first.');
  let json; try { json = JSON.parse(raw); } catch { json = { messages: raw.split('\n').filter(Boolean).map(t=>({text:t})) }; }

  const lines = json.messages.map(m => `- ${m.text}`).join('\n');
  write(p('outreach', `${today()}.md`), lines + '\n');
  write(p('outreach', `${today()}.json`), JSON.stringify(json, null, 2));

  // Optional CSV export
  const csv = toCSV(json.messages.map(m=>({text:m.text})), ['text']);
  write(p('outreach', `${today()}.csv`), csv);

  const url = process.env.MAKE_WEBHOOK_OUTREACH || '';
  await sendToMake(url, { date: today(), type: 'outreach', ...json });

  return p('outreach', `${today()}.md`);
}
