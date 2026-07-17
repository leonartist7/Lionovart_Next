const fs = require('fs');

const pPortfolio = '.claude/worktrees/crazy-taussig/src/components/sections/Portfolio.tsx';
let cPortfolio = fs.readFileSync(pPortfolio, 'utf-8');

// The regex will find `initial={{ opacity: 0, y: 150 }}` and the following 3 lines up to the transition object.
const regex = /\s*initial=\{\{ opacity: 0, y: 150 \}\}\r?\n\s*whileInView=\{\{ opacity: 1, y: 0 \}\}\r?\n\s*viewport=\{\{ once: true, margin: "-100px" \}\}\r?\n\s*transition=\{\{\r?\n\s*type: "spring",\r?\n\s*stiffness: 100,\r?\n\s*damping: 20,\r?\n\s*delay: \(index % 3\) \* 0\.1,\r?\n\s*\}\}/g;

cPortfolio = cPortfolio.replace(regex, '');

fs.writeFileSync(pPortfolio, cPortfolio);
console.log("Removed entrance animations from Portfolio cards.");
