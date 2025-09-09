export async function sendToMake(url, payload) {
  if (!url) return { ok:false, msg:'No webhook URL' };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  });
  return { ok: res.ok, status: res.status, text: await res.text() };
}
