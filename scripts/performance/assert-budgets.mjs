import fs from 'node:fs/promises';
import { assessSummary } from './budgets.mjs';
if (!process.argv[2]) throw new Error('Provide the generated summary.json path.');
const result = assessSummary(JSON.parse(await fs.readFile(process.argv[2], 'utf8')));
console.log(JSON.stringify(result, null, 2));
if (result.failures.length) process.exitCode = 1;
