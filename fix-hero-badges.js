const fs = require('fs');

const pHeroTop = '.claude/worktrees/crazy-taussig/src/components/sections/HeroTop.tsx';
let cHeroTop = fs.readFileSync(pHeroTop, 'utf-8');

// Update image paths from /laurel.webp to /images/laurel.webp
cHeroTop = cHeroTop.replace(
  'src="/laurel.webp"',
  'src="/images/laurel.webp"'
);

// Force visibility by removing `inView` dependency on `animate`
cHeroTop = cHeroTop.replace(
  /initial=\{\{ opacity: 0, scale: 0\.8 \}\}\r?\n\s*animate=\{\{ opacity: 1, scale: 1 \}\}\r?\n\s*transition=\{\{ duration: 0\.6, delay, ease: \[0\.16, 1, 0\.3, 1\] \}\}/g,
  'initial={{ opacity: 1, scale: 1 }}'
);

cHeroTop = cHeroTop.replace(
  /animate=\{inView \? \{ opacity: 1, scale: 1 \} : \{\}\}/g,
  'animate={{ opacity: 1, scale: 1 }}'
);

cHeroTop = cHeroTop.replace(
  /animate=\{inView \? \{ opacity: 1, x: 0 \} : \{\}\}/g,
  'animate={{ opacity: 1, x: 0 }}'
);

cHeroTop = cHeroTop.replace(
  /animate=\{inView \? \{ opacity: 1, y: 0 \} : \{\}\}/g,
  'animate={{ opacity: 1, y: 0 }}'
);

fs.writeFileSync(pHeroTop, cHeroTop);
console.log("Updated image paths and forced visibility.");
