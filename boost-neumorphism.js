const fs = require('fs');

const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

const oldClasses = 'className="relative overflow-hidden rounded-[24px] aspect-[3/4] bg-[#e8e3de] border-[4px] border-white shadow-[12px_12px_32px_rgba(0,0,0,0.08),-12px_-12px_32px_rgba(255,255,255,0.9)]"';
const newClasses = 'className="relative overflow-hidden rounded-[24px] aspect-[3/4] bg-[#e8e3de] border-[8px] border-white shadow-[24px_24px_64px_rgba(0,0,0,0.16),-20px_-20px_60px_rgba(255,255,255,1)] ring-1 ring-black/5"';

cServices = cServices.replace(oldClasses, newClasses);

fs.writeFileSync(pServices, cServices);
console.log("Boosted neumorphic style.");
