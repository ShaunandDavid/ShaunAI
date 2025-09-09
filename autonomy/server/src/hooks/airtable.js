import Airtable from 'airtable';

export async function pushAirtable({ rows }) {
  const key = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!key || !baseId) return { ok: false, reason: 'airtable_missing' };

  const base = new Airtable({ apiKey: key }).base(baseId);
  const table = base('Outreach');

  const chunks = chunk(rows, 10); // Airtable batch limit
  for (const batch of chunks) {
    await table.create(
      batch.map(r => ({
        fields: { Subject: r.subject, Body: r.body, Tier: r.tier || 'A', To: r.to || '' }
      }))
    );
  }
  return { ok: true };
}

function chunk(arr, n){ const out=[]; for(let i=0;i<arr.length;i+=n) out.push(arr.slice(i,i+n)); return out; }
