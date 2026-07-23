const fs = require('fs');

// 1. Process.tsx shadow optimization
const pProcess = '.claude/worktrees/crazy-taussig/src/components/sections/Process.tsx';
let cProcess = fs.readFileSync(pProcess, 'utf-8');

cProcess = cProcess.replace(
  '"0 -6px 28px rgba(229,25,42,0.07), inset 0 0 0 1px rgba(229,25,42,0.09)"',
  '"0 -2px 8px rgba(229,25,42,0.05), inset 0 0 0 1px rgba(229,25,42,0.09)"'
);
fs.writeFileSync(pProcess, cProcess);
console.log("Optimized Process.tsx shadows");

// 2. Services.tsx blur optimization
const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

cServices = cServices.replace(
  /\bbackdrop-blur-xl\b/g,
  '' // Simply remove it
);
fs.writeFileSync(pServices, cServices);
console.log("Optimized Services.tsx blur");
