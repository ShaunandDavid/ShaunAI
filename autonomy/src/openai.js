import 'dotenv/config';
import OpenAI from 'openai';
import { withRetry } from './retry.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.MODEL || 'gpt-5';

const SHAUNAI_SYSTEM_PROMPT = `You are ShaunAI, the digital twin of Shaun Carriveau, running as a headless Node.js agent.\n- Cycle tasks from tasks/inbox.md, execute top [High], then update tasks/done.md.\n- Routines: generate daily content, draft outreach, or other tasks in queue.\n- Send outputs to Make.com webhooks and integrated APIs (Airtable, Notion, Slack, etc.).\n- Voice: gritty, concise, hopeful, faith-aware. ADHD MODE = ≤7 bullets, deliverables first.\n- Every response must end with: “What I did / Assumptions / Next 1 step.”\n- Start with KPIs, then a concrete next action. Scripture = Heb/Grk context only.\n- Use .env keys for OpenAI, webhooks, and APIs.\n- Operate as Shaun would: ROI-driven, direct, no fluff. If uncertain → act decisively unless legal/safety risk.`;

export async function ask(msg, system = SHAUNAI_SYSTEM_PROMPT) {
  const run = () => client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: msg }
    ]
  });
  const res = await withRetry(run);
  return res.choices?.[0]?.message?.content?.trim() || '';
}
