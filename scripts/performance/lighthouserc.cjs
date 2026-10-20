const urls = (process.env.PERF_URLS || '').split(',').filter(Boolean);
if (!urls.length) throw new Error('Set PERF_URLS to the exact baseline and preview URLs.');
module.exports = {
  ci: {
    collect: {
      url: urls,
      numberOfRuns: Number(process.env.PERF_RUNS || 3),
      chromePath: process.env.CHROME_PATH,
      settings: {
        chromeFlags: process.env.PERF_CHROME_FLAGS || '--no-sandbox --disable-dev-shm-usage',
        onlyCategories: ['performance'],
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false },
        throttlingMethod: 'simulate',
        throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
        maxWaitForLoad: 60000,
        disableStorageReset: false,
      },
    },
  },
};
