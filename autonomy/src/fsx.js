import fs from 'fs';
import path from 'path';

export const root = process.cwd();
export const p = (...xs) => path.join(root, ...xs);

export function read(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}
export function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
export function exists(file) { return fs.existsSync(file); }
export function today() { return new Date().toISOString().slice(0,10); }
