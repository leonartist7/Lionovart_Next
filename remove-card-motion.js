const fs = require('fs');

const pPortfolio = '.claude/worktrees/crazy-taussig/src/components/sections/Portfolio.tsx';
let cPortfolio = fs.readFileSync(pPortfolio, 'utf-8');

const regex = /<motion\.div\r?\n\s*className=\{\`relative \$\{project\.gridClasses\}\`\}\r?\n\s*initial=\{\{ opacity: 0, y: 150 \}\}\r?\n\s*whileInView=\{\{ opacity: 1, y: 0 \}\}\r?\n\s*viewport=\{\{ once: true, margin: "-100px" \}\}\r?\n\s*transition=\{\{[\s\S]*?\}\}\r?\n\s*>/;

const replacement = `<div
      className={\`relative \${project.gridClasses}\`}
    >`;

cPortfolio = cPortfolio.replace(regex, replacement);

// Don't forget to close with </div> instead of </motion.div>
// Let's find the matching </motion.div> for this card.
// We can just regex replace `</motion.div>` if it's the only one, but there might be others.
// Let's check how many `</motion.div>` are in Portfolio.tsx.
