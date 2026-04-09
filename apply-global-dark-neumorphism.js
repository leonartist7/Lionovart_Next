const fs = require('fs');

// 1. Update globals.css
const pGlobals = '.claude/worktrees/crazy-taussig/src/app/globals.css';
let cGlobals = fs.readFileSync(pGlobals, 'utf-8');

cGlobals = cGlobals.replace(
  /--color-bg-dark: #0d0d0d;/,
  '--color-bg-dark: #181818;'
);
cGlobals = cGlobals.replace(
  /--color-bg-brand-black: #0a0a0a;/,
  '--color-bg-brand-black: #181818;'
);

fs.writeFileSync(pGlobals, cGlobals);
console.log("Updated globals.css with unified dark mode.");

// 2. Update Testimonials.tsx
const pTestimonials = '.claude/worktrees/crazy-taussig/src/components/sections/Testimonials.tsx';
let cTestimonials = fs.readFileSync(pTestimonials, 'utf-8');

cTestimonials = cTestimonials.replace(
  /className="flex flex-col gap-4 rounded-\[20px\] border border-white\/8 bg-\[#111111\] p-6 md:p-7"/,
  'className="flex flex-col gap-4 rounded-[20px] bg-[#181818] p-6 md:p-7 shadow-[6px_6px_16px_rgba(0,0,0,0.6),-3px_-3px_12px_rgba(255,255,255,0.03)] ring-1 ring-white/[0.02]"'
);

fs.writeFileSync(pTestimonials, cTestimonials);
console.log("Updated Testimonials.tsx with dark neumorphism.");

// 3. Update FAQ.tsx
const pFAQ = '.claude/worktrees/crazy-taussig/src/components/sections/FAQ.tsx';
let cFAQ = fs.readFileSync(pFAQ, 'utf-8');

cFAQ = cFAQ.replace(
  /className="border border-border-dark bg-\[#111111\] rounded-\[20px\] px-6 py-2 overflow-hidden data-\[state=open\]:border-brand-red\/30 transition-colors"/,
  'className="bg-[#181818] rounded-[20px] px-6 py-2 overflow-hidden shadow-[8px_8px_20px_rgba(0,0,0,0.5),-4px_-4px_16px_rgba(255,255,255,0.03)] ring-1 ring-white/[0.02] data-[state=open]:ring-brand-red/30 transition-all duration-300"'
);

fs.writeFileSync(pFAQ, cFAQ);
console.log("Updated FAQ.tsx with dark neumorphism.");
