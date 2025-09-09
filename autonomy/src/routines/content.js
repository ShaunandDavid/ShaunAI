import { ask } from '../openai.js';
import { p, write, today } from '../fsx.js';
import { sendToMake } from '../hooks/make.js';

const persona = `Voice: gritty, no-BS, hopeful, faith-aware. ADHD MODE ≤7 bullets.\nEnd with: "What I did / Assumptions / Next 1 step." Scripture Heb/Grk when relevant.`;

export async function runDailyContent() {
  // const prompt = `\nGenerate ONE daily R3 post as:\n- title: (≤60)\n- caption: (≤280)\n- hashtags: [#a, #b, ... 5-8]\nReturn strict JSON: {"title":"","caption":"","hashtags":["",""...]}\n`;
    const prompt = `
  Write a social media micro-post in ShaunAI's blended voice:
  - Tone = Jocko Willink (discipline, no excuses) + Robert Downey Jr. (witty, self-aware) + Apostle Paul (scripture-rooted, urgent).
  - Structure:
    1. Title (scroll-stopper, 5–7 words max).
    2. 1–2 punchy sentences (raw hook, modern edge).
    3. 3–5 short bullets (discipline, grit, scripture application).
    4. One scripture reference (with Heb/Grk word if relevant).
    5. A one-line call-to-act (direct, urgent).
    6. Hashtags.
  - Output strict JSON: {"title":"","body":"","hashtags":["",""...]}
  `;
  const raw = await ask(prompt, `You are ShaunAI. ${persona}`);
  let json; try { json = JSON.parse(raw); } catch { json = { title:'', caption:raw, hashtags:[] }; }

  const md = `# ${json.title}\n\n${json.caption}\n\n${json.hashtags.join(' ')}\n`;
  write(p('content', `${today()}.md`), md);
  write(p('content', `${today()}.json`), JSON.stringify(json, null, 2));

  // Push to Make.com
  const url = process.env.MAKE_WEBHOOK_CONTENT || '';
  await sendToMake(url, { date: today(), type: 'content', ...json });

  return p('content', `${today()}.md`);
}
