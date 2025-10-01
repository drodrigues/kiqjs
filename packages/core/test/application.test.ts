import 'reflect-metadata';

import { promises as fs } from 'fs';
import * as path from 'path';

import { KiqApplication, runApplication } from '../src/application';
import { Container } from '../src/container';

describe('KiqApplication + runApplication', () => {
  const tmpDir = path.join(__dirname, '__tmp_appscan__');

  beforeAll(async () => {
    await fs.mkdir(tmpDir, { recursive: true });
    const touch = path.join(tmpDir, 'boot.js');
    await fs.writeFile(
      touch,
      `global.__KIQ_APP_SCAN = (global.__KIQ_APP_SCAN || 0) + 1; module.exports = {};`,
      'utf8'
    );
  });

  afterAll(async () => {
    try {
      const entries = await fs.readdir(tmpDir);
      await Promise.all(entries.map((e) => fs.unlink(path.join(tmpDir, e))));
      await fs.rmdir(tmpDir);
    } catch {
      /* ignore */
    }
  });

  it('runs scan when @KiqApplication has scan option and returns a Container', async () => {
    (global as any).__KIQ_APP_SCAN = 0;

    @KiqApplication({ scan: tmpDir })
    class MyApp {}

    const ctx = await runApplication(MyApp);
    expect(ctx).toBeInstanceOf(Container);
    expect((global as any).__KIQ_APP_SCAN).toBe(1);
  });

  it('returns a Container even without scan option', async () => {
    @KiqApplication()
    class BareApp {}
    const ctx = await runApplication(BareApp);
    expect(ctx).toBeInstanceOf(Container);
  });
});
