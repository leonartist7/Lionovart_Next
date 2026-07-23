const fs = require('fs');
const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

cServices = cServices.replace(
  '<div className="hidden md:block h-full relative">',
  '<div className="hidden md:block relative">'
);

fs.writeFileSync(pServices, cServices);
console.log("Removed h-full from grid item.");
