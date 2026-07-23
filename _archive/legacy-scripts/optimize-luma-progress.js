const fs = require('fs');
const pLuma = '.claude/worktrees/crazy-taussig/src/components/sections/LumaShowcase.tsx';
let cLuma = fs.readFileSync(pLuma, 'utf-8');

cLuma = cLuma.replace(
  /style=\{\{\s*width:\s*`\$\{autoPlayProgress\}%`,\s*backgroundColor:\s*"var\(--luma-accent\)"\s*\}\}/g,
  'style={{ transform: `scaleX(${autoPlayProgress / 100})`, transformOrigin: "left", backgroundColor: "var(--luma-accent)" }}'
);

fs.writeFileSync(pLuma, cLuma);
console.log("Optimized LumaShowcase.tsx progress bar");
