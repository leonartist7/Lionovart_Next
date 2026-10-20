import fs from 'node:fs/promises';
import path from 'node:path';

const directory = process.argv[2];
if (!directory) throw new Error('Usage: node summarize.mjs <run-directory>');
const reports = path.join(directory, '.lighthouseci');
const files = (await fs.readdir(reports)).filter(file => /^lhr-.*\.json$/.test(file));
const runs = [];
for (const file of files) {
  const report = JSON.parse(await fs.readFile(path.join(reports, file), 'utf8'));
  const audits = report.audits;
  const requests = audits['network-requests']?.details?.items || [];
  const number = key => audits[key]?.numericValue ?? null;
  const bytesFor = prefix => requests.filter(request => request.mimeType?.startsWith(prefix))
    .reduce((sum, request) => sum + (request.transferSize || 0), 0);
  runs.push({
    file, url: report.finalDisplayedUrl || report.finalUrl, fetchTime: report.fetchTime,
    lighthouseVersion: report.lighthouseVersion, browser: report.environment?.hostUserAgent,
    runtimeError: report.runtimeError || null, warnings: report.runWarnings,
    performance: report.categories.performance.score,
    fcpMs: number('first-contentful-paint'), lcpMs: number('largest-contentful-paint'),
    cls: number('cumulative-layout-shift'), tbtMs: number('total-blocking-time'),
    speedIndexMs: number('speed-index'), totalTransferBytes: number('total-byte-weight'),
    imageTransferBytes: bytesFor('image/'), videoTransferBytes: bytesFor('video/'),
    scriptTransferBytes: bytesFor('application/javascript') + bytesFor('text/javascript'),
    requestCount: requests.length,
    settings: { formFactor: report.configSettings.formFactor, screenEmulation: report.configSettings.screenEmulation,
      throttlingMethod: report.configSettings.throttlingMethod, throttling: report.configSettings.throttling },
    largestRequests: [...requests].sort((a,b) => (b.transferSize || 0) - (a.transferSize || 0)).slice(0,10)
      .map(request => ({ url: request.url, mimeType: request.mimeType, bytes: request.transferSize, type: request.resourceType })),
  });
}
const median = values => {
  const sorted = values.filter(value => typeof value === 'number').sort((a,b)=>a-b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length ? sorted.length % 2 ? sorted[middle] : (sorted[middle-1]+sorted[middle])/2 : null;
};
const keys = ['performance','fcpMs','lcpMs','cls','tbtMs','speedIndexMs','totalTransferBytes','imageTransferBytes','videoTransferBytes','scriptTransferBytes','requestCount'];
const summaries = [...new Set(runs.map(run=>run.url))].map(url => {
  const group = runs.filter(run=>run.url===url && !run.runtimeError);
  return { url, validRuns: group.length, median: Object.fromEntries(keys.map(key=>[key,median(group.map(run=>run[key]))])),
    range: Object.fromEntries(keys.map(key=>[key,{min:Math.min(...group.map(run=>run[key]).filter(v=>typeof v==='number')),max:Math.max(...group.map(run=>run[key]).filter(v=>typeof v==='number'))}])) };
});
const summary = { note:'Emulated mobile lab measurements. Network and CPU values are simulated; graphics use software rendering. Not real-phone evidence.', runs, summaries };
await fs.writeFile(path.join(directory, 'summary.json'), JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summaries,null,2));
