const fs = require('fs');
const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

cServices = cServices.replace(
  /className="relative bg-white pt-\[100px\] pb-\[100px\] md:pt-\[120px\] md:pb-\[140px\] overflow-hidden"/,
  'className="relative bg-white pt-[100px] pb-[100px] md:pt-[120px] md:pb-[140px]"'
);

fs.writeFileSync(pServices, cServices);
console.log("Removed overflow-hidden from section.");
