import fs from 'node:fs/promises';
const data = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
const sample = s => ({ checkpoint: s.checkpoint, overflow: s.overflow, broken: s.broken?.length, pending: s.visiblePending?.length,
  counts: s.counts, filmRequested: s.filmRequested, reducedMotion: s.reducedMotion, videos: s.videos,
  offscreenRunning: s.animations?.filter(a => a.state === 'running' && !a.visible).length, owners: s.owners });
for (const result of data.results) {
  const { snapshots, visits, before, afterIdle, cycles, ...rest } = result;
  console.log('PHASE3_CASE_JSON ' + JSON.stringify({ engine: data.engine, browser: data.browser, deployment: data.deployment, ...rest,
    snapshots: snapshots?.map(sample), visits: visits?.map(v => ({ ...v, snapshot: sample(v.snapshot) })),
    before: before && sample(before), afterIdle: afterIdle && sample(afterIdle),
    cycles: cycles?.map(c => ({ cycle: c.cycle, sameDocument: c.sameDocument, snapshot: sample(c.snapshot) })) }));
}
