import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '../../artifacts');

const today = () => new Date().toISOString().slice(0, 10);
const slug = s => String(s || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  .slice(0, 80);

async function ensureDir(dateDir, subdir) {
  const dir = subdir ? path.join(ROOT, dateDir, subdir) : path.join(ROOT, dateDir);
  await fs.ensureDir(dir);
  return dir;
}

export async function writeJSON({ title, data, subdir = '' }) {
  const dateDir = today();
  const base = await ensureDir(dateDir, subdir);
  const name = `${slug(title)}-${Date.now()}.json`;
  const file = path.join(base, name);
  await fs.writeJson(file, data, { spaces: 2 });
  return file;
}

export async function writeText({ title, text, subdir = '' }) {
  const dateDir = today();
  const base = await ensureDir(dateDir, subdir);
  const name = `${slug(title)}-${Date.now()}.txt`;
  const file = path.join(base, name);
  await fs.writeFile(file, text, 'utf-8');
  return file;
}

export async function nextFilePath({ title, ext = '.bin', subdir = '' }) {
  const dateDir = today();
  const base = await ensureDir(dateDir, subdir);
  const name = `${slug(title)}-${Date.now()}${ext.startsWith('.') ? ext : `.${ext}`}`;
  return path.join(base, name);
}
