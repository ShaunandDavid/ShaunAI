import fs from 'fs'; import { dirname } from 'path'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const logFile = `${here}/../shaunai.log`;
export const log = (...xs) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${xs.join(' ')}\n`);
