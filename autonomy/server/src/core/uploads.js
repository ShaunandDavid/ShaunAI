import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';

export async function toPublicUrl(localPath) {
  const base = process.env.NOTION_FILE_BASEURL?.replace(/\/+$/, '');
  if (base) {
    // Map .../artifacts/YYYY-MM-DD/... -> ${BASE}/YYYY-MM-DD/...
    const idx = localPath.lastIndexOf(path.sep + 'artifacts' + path.sep);
    if (idx !== -1) {
      const rel = localPath.slice(idx + ('/artifacts/').length + (path.sep === '\\' ? 1 : 0)).replaceAll('\\','/');
      return `${base}/${rel}`;
    }
  }
  const webhook = process.env.MAKE_UPLOAD_WEBHOOK;
  if (webhook) {
    const bin = await fs.readFile(localPath);
    const b64 = bin.toString('base64');
    const mime = guessMime(localPath);
    const filename = path.basename(localPath);
    const resp = await axios.post(webhook, { filename, mime, base64: b64 }, { timeout: 20000 }).catch(e => ({ data: null }));
    const url = resp?.data?.url;
    if (url && /^https?:\/\//i.test(url)) return url;
  }
  return null; // no public URL available
}

function guessMime(p) {
  const ext = path.extname(p).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.json') return 'application/json';
  if (ext === '.txt') return 'text/plain';
  return 'application/octet-stream';
}
