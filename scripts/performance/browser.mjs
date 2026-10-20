import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliDecompressSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const cache = process.env.PERF_BROWSER_CACHE || path.resolve(here, '../../../browser-cache-153');
export async function prepareBrowser() {
  const executablePath = process.env.CHROME_PATH || path.join(cache, 'chromium');
  if (!process.env.CHROME_PATH) {
    await fs.mkdir(cache, { recursive: true });
    const bin = path.join(here, 'node_modules/@sparticuz/chromium/bin');
    if (!(await fs.stat(executablePath).catch(() => null))?.size) {
      await fs.writeFile(executablePath, brotliDecompressSync(await fs.readFile(path.join(bin, 'chromium.br'))), { mode: 0o700 });
    }
    // Native tar avoids restoring archive ownership in restricted containers.
    for (const name of ['fonts', 'swiftshader']) {
      const marker = path.join(cache, `.${name}-ready`);
      if (await fs.stat(marker).catch(() => null)) continue;
      const archive = path.join(cache, `${name}.tar`);
      await fs.writeFile(archive, brotliDecompressSync(await fs.readFile(path.join(bin, `${name}.tar.br`))));
      execFileSync('tar', ['--no-same-owner', '--no-same-permissions', '-xf', archive, '-C', cache]);
      await fs.unlink(archive);
      await fs.writeFile(marker, '153.0.0\n');
    }
    process.env.FONTCONFIG_PATH = path.join(cache, 'fonts');
    process.env.LD_LIBRARY_PATH = [cache, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':');
  }
  const args = ['--no-sandbox', '--disable-dev-shm-usage', '--no-zygote',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  // Optional: match a managed container's existing CA trust in an isolated NSS
  // database. Never disable TLS validation or modify the user's certificate DB.
  if (process.env.PERF_CA_FILE) {
    const dataRoot = path.join(cache, 'managed-ca-data');
    const db = path.join(dataRoot, 'pki/nssdb');
    await fs.mkdir(db, { recursive: true });
    const certutil = process.env.PERF_CERTUTIL || 'certutil';
    if (!(await fs.stat(path.join(db, 'cert9.db')).catch(() => null))) {
      execFileSync(certutil, ['-N', '--empty-password', '-d', `sql:${db}`]);
    }
    execFileSync(certutil, ['-A', '-d', `sql:${db}`, '-n', 'managed-environment-root', '-t', 'C,,', '-i', process.env.PERF_CA_FILE]);
    process.env.XDG_DATA_HOME = dataRoot;
  }
  const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (proxy) {
    const url = new URL(proxy);
    if (url.username || url.password) throw new Error('Use an externally configured authenticated proxy; do not put credentials in browser arguments.');
    args.push(`--proxy-server=${url.origin}`);
  }
  return { executablePath, args };
}
