const fs = require('fs');

const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

cServices = cServices.replace(
  /if \(lenis\) \{\r?\n\s*lenis\.scrollTo\(target, \{ offset: -120, duration: 1\.2, easing: \(t\) => Math\.min\(1, 1\.001 - Math\.pow\(2, -10 \* t\)\) \}\);\r?\n\s*\}/,
  `if (lenis && target) {
                              lenis.scrollTo(target, { offset: -120, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                            }`
);

fs.writeFileSync(pServices, cServices);
console.log("Fixed target type error.");
