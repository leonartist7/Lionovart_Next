const fs = require('fs');

const pProcess = '.claude/worktrees/crazy-taussig/src/components/sections/Process.tsx';
let cProcess = fs.readFileSync(pProcess, 'utf-8');

// 1. Increase the gap in the flex container to prevent shadow overlap
cProcess = cProcess.replace(
  'className="flex items-end gap-4 md:gap-6 px-6 md:px-14 will-change-transform"',
  'className="flex items-end gap-8 md:gap-14 px-6 md:px-14 will-change-transform"'
);

// 2. Make the cards slightly smaller
cProcess = cProcess.replace(
  'width: "clamp(260px, 36vw, 460px)",',
  'width: "clamp(240px, 32vw, 420px)",'
);

// 3. Tighten the shadow spread and offset
cProcess = cProcess.replace(
  'boxShadow: "-16px 16px 36px rgba(0,0,0,0.18), 16px -16px 36px rgba(255,255,255,1)",',
  'boxShadow: "-8px 8px 24px rgba(0,0,0,0.15), 8px -8px 24px rgba(255,255,255,1)",'
);

fs.writeFileSync(pProcess, cProcess);
console.log("Process cards resized, gap increased, and shadow tightened.");
