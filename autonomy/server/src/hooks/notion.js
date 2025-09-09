import { Client } from '@notionhq/client';

export async function pushNotion({ title, content, priority = 'Med', status = 'Logged', url = '', attachments = [] }) {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  const pageId = process.env.NOTION_PAGE_ID;

  if (!token) return { ok: false, reason: 'notion_missing_token' };
  const notion = new Client({ auth: token });

  const fileBlocks = attachments
    .filter(a => a && a.url)
    .slice(0, 10)
    .map(a => toFileBlock(a.url, a.caption || a.title || 'Attachment'));

  try {
    if (databaseId) {
      const resp = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ type: 'text', text: { content: title || 'ShaunAI Log' } }] },
          Status: { select: { name: status } },
          Priority: { select: { name: priority } },
          URL: url ? { url } : undefined,
          Created: { date: { start: new Date().toISOString() } },
          Notes: { rich_text: [{ type: 'text', text: { content: (content || '').slice(0, 1900) } }] }
        },
        children: [...blocksFromText(content), ...fileBlocks]
      });
      return { ok: true, mode: 'database', id: resp.id, files: attachments.length };
    }
    if (pageId) {
      await notion.blocks.children.append({
        block_id: pageId,
        children: [...blocksFromText(`## ${title}\n\n${content}\n\nPriority: ${priority} | Status: ${status}${url ? ` | URL: ${url}` : ''}`), ...fileBlocks]
      });
      return { ok: true, mode: 'append', id: pageId, files: attachments.length };
    }
    return { ok: false, reason: 'notion_no_parent' };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

function blocksFromText(text) {
  return String(text || '').split(/\n{2,}/).slice(0, 20).map(par => ({
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content: par.slice(0, 1900) } }] }
  }));
}

function toFileBlock(url, caption) {
  // Notion API supports external files/images only (no binary upload).
  const isImage = /\.(png|jpe?g|gif|webp)$/i.test(url);
  return isImage ? {
    object: 'block',
    type: 'image',
    image: {
      type: 'external',
      external: { url },
      caption: [{ type: 'text', text: { content: caption.slice(0, 250) } }]
    }
  } : {
    object: 'block',
    type: 'file',
    file: {
      type: 'external',
      external: { url }
    }
  };
}
