export const toCSV = (rows, headers) => {
  const esc = s => `"${String(s ?? '').replace(/"/g,'""')}"`;
  const head = headers.map(esc).join(',');
  const body = rows.map(r => headers.map(h => esc(r[h])).join(',')).join('\n');
  return head + '\n' + body + '\n';
};
