const fs = require('fs');

const pProcess = '.claude/worktrees/crazy-taussig/src/components/sections/Process.tsx';
let cProcess = fs.readFileSync(pProcess, 'utf-8');

// 1. Center the timeline header column
cProcess = cProcess.replace(
  'className="flex-shrink-0 relative flex flex-col items-start"',
  'className="flex-shrink-0 relative flex flex-col items-center"'
);

// 2. Update the connecting line starting position
cProcess = cProcess.replace(
  'className="absolute top-[23px] left-[48px] h-[2px] bg-[#e5192a]/20 w-[calc(100%-48px+2rem)] md:w-[calc(100%-48px+3.5rem)] overflow-hidden"',
  'className="absolute top-[23px] left-[calc(50%+24px)] h-[2px] bg-[#e5192a]/20 w-[calc(100%-48px+2rem)] md:w-[calc(100%-48px+3.5rem)] overflow-hidden"'
);

// 3. Center the tag text under the circle
cProcess = cProcess.replace(
  '<div className="mt-6 flex flex-col gap-2">',
  '<div className="mt-6 flex flex-col items-center gap-2">'
);

fs.writeFileSync(pProcess, cProcess);
console.log("Timeline items perfectly centered above pillars.");
