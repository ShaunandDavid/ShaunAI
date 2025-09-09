import axios from 'axios';

export async function notify({ level = 'info', event, data = {} }) {
  const url = process.env.MAKE_WEBHOOK_URL;
  if (!url) return { ok: false, reason: 'webhook_missing' };
  try {
    await axios.post(url, {
      level,
      event,
      at: new Date().toISOString(),
      host: process.env.COMPUTERNAME || process.env.HOSTNAME || 'unknown',
      data
    }, { timeout: 8000 });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}
