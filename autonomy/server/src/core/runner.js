import { r3Post } from '../hooks/writing.js';
import { pushAirtable } from '../hooks/airtable.js';
import { pushNotion } from '../hooks/notion.js';
import { browser } from '../hooks/browser.js';
import { writeJSON, writeText } from '../core/artifacts.js';

export async function executeTask({ task, persona, log }) {
  try {
    switch (task.type) {
      case 'content_r3': {
        const out = await r3Post({ persona });
        // artifact: txt + json
        const txtPath = await writeText({ title: task.title, text: out.body, subdir: 'r3' });
        const jsonPath = await writeJSON({ title: task.title, data: { preview: out.preview, body: out.body, txtPath }, subdir: 'r3' });
        return { ok: true, msg: `r3_post ${txtPath}`, artifact: jsonPath };
      }

      case 'marketing_emails': {
        const emails = await generateOutreach({ n: task.payload.count || 10, persona });
        const artifact = await writeJSON({ title: 'outreach-emails', data: emails, subdir: 'outreach' });
        const pushed = await pushAirtable({ rows: emails }).catch(() => ({ ok: false, reason: 'airtable_missing' }));
        return { ok: true, msg: `generated=${emails.length}, airtable=${pushed.ok ? 'OK' : pushed.reason}`, artifact };
      }

      case 'push_airtable': {
        const pushed = await pushAirtable({ rows: [] });
        const artifact = await writeJSON({ title: 'airtable-push', data: pushed, subdir: 'integrations' });
        return { ok: pushed.ok, msg: pushed.ok ? 'pushed' : pushed.reason, artifact };
      }

      case 'push_notion': {
        const payload = {
          title: task.title,
          content: `Task: ${task.title}\nWhen: ${new Date().toISOString()}\nActor: ShaunAI`,
        };
        const pushed = await pushNotion(payload);
        const artifact = await writeJSON({ title: 'notion-push', data: pushed, subdir: 'integrations' });
        return { ok: pushed.ok, msg: pushed.ok ? 'pushed' : pushed.reason, artifact };
      }

      case 'browser_visit': {
        const res = await browser.visit(task.payload, { title: task.title });
        return { ok: res.ok, msg: res.msg, artifact: res.artifact };
      }

      case 'browser_screenshot': {
        const res = await browser.screenshot(task.payload, { title: task.title });
        // If we got a public URL, send to Notion as attachment
        if (res.publicUrl && process.env.NOTION_TOKEN && (process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID)) {
          await pushNotion({
            title: 'Browser Screenshot',
            content: `Screenshot for: ${task.payload}`,
            priority: task.priority,
            status: 'Artifact',
            attachments: [{ url: res.publicUrl, title: task.title }]
          });
        }
        return { ok: res.ok, msg: res.msg, artifact: res.path };
      }

      case 'browser_scrape': {
        const res = await browser.scrape(task.payload, { title: task.title });
        return { ok: res.ok, msg: res.data ? `items=${res.data.length}` : res.msg, artifact: res.artifact };
      }

      default: {
        const artifact = await writeJSON({ title: task.title, data: { note: 'noop_generic' }, subdir: 'generic' });
        return { ok: true, msg: 'noop_generic', artifact };
      }
    }
  } catch (e) {
    log.error({ msg: 'execute_error', task: task.title, err: e.stack || e.message });
    const artifact = await writeJSON({ title: `${task.title}-error`, data: { error: e.message }, subdir: 'errors' });
    return { ok: false, msg: e.message, artifact };
  }
}

async function generateOutreach({ n, persona }) {
  const base = (i) =>
    ({
      subject: `Quick win for LevEL 7 Recovery #${i + 1}`,
      body: `Yo — straight shot: we help sober homes fill beds and pass audits.\nProof beats promises.\n- Ops dashboard\n- Compliance snapshots\n- “One resident pays for it” ROI\n— ${persona?.signature || 'ShaunAI'}`,
      to: '',
      tier: 'A',
    });
  return Array.from({ length: n }, (_, i) => base(i));
}
