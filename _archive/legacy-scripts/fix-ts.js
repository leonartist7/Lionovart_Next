const fs = require('fs');

const files = [
  '.claude/worktrees/crazy-taussig/src/components/ui/liquid-metal-button.tsx',
  '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx',
  '.claude/worktrees/crazy-taussig/src/components/sections/Portfolio.tsx',
  '.claude/worktrees/crazy-taussig/src/components/sections/Reality.tsx'
];

files.forEach(p => {
  let c = fs.readFileSync(p, 'utf-8');
  c = c.replace(/const gl = canvas\.getContext\("webgl"\) \|\| canvas\.getContext\("experimental-webgl"\);/g, 'const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;');
  fs.writeFileSync(p, c);
  console.log("Fixed TS in", p);
});
