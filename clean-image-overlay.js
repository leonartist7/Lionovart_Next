const fs = require('fs');

const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

// 1. Make the image container 20% smaller (from 70% to 50%)
cServices = cServices.replace(
  'className="w-[85%] lg:w-[70%]"',
  'className="w-[65%] lg:w-[50%]"'
);

// 2. Remove the Label overlay and Red accent line
// We will use a regex that matches the exact block from {/* Label overlay */} down to the red accent line.
const overlaysRegex = /\s*\{\/\* Label overlay \*\/\}\r?\n\s*<AnimatePresence mode="sync">[\s\S]*?<\/AnimatePresence>\r?\n\r?\n\s*\{\/\* Red accent line \*\/\}\r?\n\s*<div className="absolute top-5 right-5 w-8 h-\[3px\] rounded-full bg-brand-red" \/>/g;

cServices = cServices.replace(overlaysRegex, '');

fs.writeFileSync(pServices, cServices);
console.log("Services image resized and overlays removed.");
