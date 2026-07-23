const fs = require('fs');

const pPortfolio = '.claude/worktrees/crazy-taussig/src/components/sections/Portfolio.tsx';
let cPortfolio = fs.readFileSync(pPortfolio, 'utf-8');

// 1. ProjectCard Outer Shell Background
cPortfolio = cPortfolio.replace(
  'className="relative flex h-full w-full min-h-[220px] md:min-h-0 bg-[#161616]"',
  'className="relative flex h-full w-full min-h-[220px] md:min-h-0 bg-[#e2e8f0]"'
);

// 2. ProjectCard Inner Layer Background
cPortfolio = cPortfolio.replace(
  /background: "#0d0d0d",\r?\n\s*overflow: "hidden",/g,
  'background: "#ffffff",\n            overflow: "hidden",'
);

// 3. ProjectCard Orbit Stage text and rings
cPortfolio = cPortfolio.replace(
  'border: "1px solid rgba(255,255,255,0.05)",',
  'border: "1px solid rgba(0,0,0,0.05)",'
);

cPortfolio = cPortfolio.replace(
  'background: "rgba(255,255,255,0.04)",',
  'background: "rgba(0,0,0,0.02)",'
);

cPortfolio = cPortfolio.replace(
  'filter: "drop-shadow(0 0 10px rgba(255,255,255,0.6))",',
  'filter: "drop-shadow(0 0 10px rgba(0,0,0,0.1))",'
);

// 4. ProjectCard Bottom Label Background and Text
cPortfolio = cPortfolio.replace(
  '"linear-gradient(to top, rgba(13,13,13,0.95) 70%, transparent)",',
  '"linear-gradient(to top, rgba(255,255,255,0.98) 70%, transparent)",'
);

cPortfolio = cPortfolio.replace(
  '<h3 className="text-[1rem] font-bold leading-tight text-white">',
  '<h3 className="text-[1rem] font-bold leading-tight text-[#111]">'
);

cPortfolio = cPortfolio.replace(
  'style={{ color: "rgba(255,255,255,0.4)" }}',
  'style={{ color: "#666" }}'
);

// 5. BentoCard Outer Shell Background
cPortfolio = cPortfolio.replace(
  'className="relative flex h-full w-full cursor-default min-h-[220px] md:min-h-0 bg-[#161616]"',
  'className="relative flex h-full w-full cursor-default min-h-[220px] md:min-h-0 bg-[#e2e8f0]"'
);

// 6. BentoCard Inner Content Wrapper Background
cPortfolio = cPortfolio.replace(
  /background: "#161616",\r?\n\s*overflow: "hidden",/g,
  'background: "#ffffff",\n            overflow: "hidden",'
);

fs.writeFileSync(pPortfolio, cPortfolio);
console.log("Portfolio changed to light mode.");
