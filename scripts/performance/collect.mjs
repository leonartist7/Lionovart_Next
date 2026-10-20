import path from 'node:path';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prepareBrowser } from './browser.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const output = path.resolve(process.env.PERF_OUTPUT || path.join(root, 'reports/performance', new Date().toISOString().replaceAll(':', '-')));
const options = await prepareBrowser();
await fs.mkdir(output, { recursive: true });
const environment = { ...process.env, CHROME_PATH: options.executablePath, PERF_CHROME_FLAGS: options.args.join(' ') };
await fs.writeFile(path.join(output, 'runner.json'), JSON.stringify({
  created: new Date().toISOString(), node: process.version,
  urls: (process.env.PERF_URLS || '').split(',').filter(Boolean),
  runsPerUrl: Number(process.env.PERF_RUNS || 3),
  browserPackage: '153.0.0', lhci: '0.15.1',
  note: 'Emulated mobile, simulated throttling, software graphics; not a real phone.',
}, null, 2) + '\n');
const child = spawn(process.execPath, [path.join(here, 'node_modules/@lhci/cli/src/cli.js'), 'collect', `--config=${path.join(here, 'lighthouserc.cjs')}`], {
  cwd: output, env: environment, stdio: 'inherit',
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; console.log(`Reports: ${output}`); });
