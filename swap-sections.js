const fs = require('fs');

const pPage = '.claude/worktrees/crazy-taussig/src/app/page.tsx';
let cPage = fs.readFileSync(pPage, 'utf-8');

const oldLayout = `<Portfolio />\r?\n\s*<ProblemsSolvedSection />`;
const newLayout = `<ProblemsSolvedSection />\n      <Portfolio />`;

// Use a regex to catch different newline styles
cPage = cPage.replace(new RegExp('<Portfolio />\\r?\\n\\s*<ProblemsSolvedSection />', 'g'), newLayout);

fs.writeFileSync(pPage, cPage);
console.log("Sections swapped successfully.");
