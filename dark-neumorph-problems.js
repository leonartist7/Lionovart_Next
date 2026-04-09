const fs = require('fs');

const pProblems = '.claude/worktrees/crazy-taussig/src/components/sections/ProblemsSolvedSection.tsx';
let cProblems = fs.readFileSync(pProblems, 'utf-8');

// 1. Change section background
cProblems = cProblems.replace(
  'className="relative bg-bg-dark py-12 lg:py-24 overflow-hidden"',
  'className="relative bg-[#181818] py-12 lg:py-24 overflow-hidden"'
);

// 2. Change gap
cProblems = cProblems.replace(
  'className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 items-stretch"',
  'className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch"'
);

// 3. Change Card Wrapper Neumorphic styles
// Replace the outer wrapper classes
const oldCardWrapper = /className="\r?\n\s*relative w-full overflow-hidden\r?\n\s*rounded-\[16px\] md:rounded-\[20px\]\r?\n\s*border border-white\/10 group-hover:border-brand-gold\/30 transition-colors duration-300\r?\n\s*h-\[110px\] sm:h-\[120px\] md:h-\[130px\] lg:h-\[140px\]\r?\n\s*"/;

const newCardWrapper = `className="
          relative w-full overflow-hidden
          rounded-[16px] md:rounded-[20px]
          bg-[#181818]
          shadow-[8px_8px_20px_rgba(0,0,0,0.6),-4px_-4px_16px_rgba(255,255,255,0.03)]
          ring-1 ring-white/[0.02]
          transition-colors duration-300
          h-[110px] sm:h-[120px] md:h-[130px] lg:h-[140px]
        "`;
cProblems = cProblems.replace(oldCardWrapper, newCardWrapper);

// 4. Change Overlay (Problem) background to match the neomorph canvas
// Because it must be exactly #181818 so the shadow looks like an extrusion of the floor
cProblems = cProblems.replace(
  /className="absolute inset-0 z-10 bg-bg-brand-black p-5 md:p-8 flex flex-col items-start"/,
  'className="absolute inset-0 z-10 bg-[#181818] p-5 md:p-8 flex flex-col items-start"'
);

fs.writeFileSync(pProblems, cProblems);
console.log("ProblemsSolvedSection.tsx customized to dark neumorphism.");
