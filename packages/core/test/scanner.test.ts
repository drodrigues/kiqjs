import 'reflect-metadata';

import { promises as fs } from 'fs';
import * as path from 'path';

import { scanAndRegister } from '../src/scanner';

describe('scanAndRegister', () => {
  const tmpDir = path.join(__dirname, '__tmp_scan__');

  beforeAll(async () => {
    await fs.mkdir(tmpDir, { recursive: true });
    await fs.mkdir(path.join(tmpDir, 'sub'), { recursive: true });

    const file1 = path.join(tmpDir, 'touch1.js');
    const file2 = path.join(tmpDir, 'sub', 'touch2.js');

    const content = `
      global.__KIQ_SCAN_HITS = (global.__KIQ_SCAN_HITS || 0) + 1;
      module.exports = {};
    `;
    await fs.writeFile(file1, content, 'utf8');
    await fs.writeFile(file2, content, 'utf8');
  });

  afterAll(async () => {
    try {
      const entries = await fs.readdir(tmpDir, { withFileTypes: true });
      for (const e of entries) {
        const fp = path.join(tmpDir, e.name);
        if (e.isDirectory()) {
          const subs = await fs.readdir(fp);
          await Promise.all(subs.map((s) => fs.unlink(path.join(fp, s))));
          await fs.rmdir(fp);
        } else {
          await fs.unlink(fp);
        }
      }
      await fs.rmdir(tmpDir);
    } catch {
      /* ignore */
    }
  });

  it('imports all .js/.ts files under baseDir', async () => {
    (global as any).__KIQ_SCAN_HITS = 0;
    await scanAndRegister(tmpDir);
    expect((global as any).__KIQ_SCAN_HITS).toBe(2);
  });
});
