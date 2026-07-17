const fs = require('fs');

const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

// 1. Change the padding from p-3 md:p-4 to p-[2px]
const oldBezel = 'className="relative rounded-[24px] aspect-[3/4] p-3 md:p-4 bg-[#f2f4f7] border border-white/80 shadow-[16px_16px_36px_rgba(0,0,0,0.12),-16px_-16px_36px_rgba(255,255,255,1)]"';
const newBezel = 'className="relative rounded-[24px] aspect-[3/4] p-[2px] bg-[#f2f4f7] border border-white/80 shadow-[16px_16px_36px_rgba(0,0,0,0.12),-16px_-16px_36px_rgba(255,255,255,1)]"';

cServices = cServices.replace(oldBezel, newBezel);

// 2. Adjust inner border-radius to match the tight 2px padding (24px outer - 2px padding = 22px inner)
const oldInner = '<div className="relative w-full h-full overflow-hidden rounded-[16px] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.12),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]">';
const newInner = '<div className="relative w-full h-full overflow-hidden rounded-[22px] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.12),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]">';

cServices = cServices.replace(oldInner, newInner);

fs.writeFileSync(pServices, cServices);
console.log("Reduced image neumorphic bezel padding to 2px.");
