import { promises as fs } from 'fs';
import * as path from 'path';

export async function scanAndRegister(baseDir: string) {
  const files: string[] = [];
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (/\.(t|j)s$/.test(e.name) && !e.name.endsWith('.d.ts')) files.push(full);
    }
  }
  await walk(baseDir);
  for (const f of files) require(path.resolve(f));
}
