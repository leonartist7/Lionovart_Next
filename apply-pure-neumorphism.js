const fs = require('fs');

const pProcess = '.claude/worktrees/crazy-taussig/src/components/sections/Process.tsx';
let cProcess = fs.readFileSync(pProcess, 'utf-8');

const oldStylesRegex = /background: "#eceff3",\r?\n\s*borderRadius: "24px 24px 0 0",\r?\n\s*borderTop: "4px solid rgba\(255,255,255,0\.8\)",\r?\n\s*borderLeft: "4px solid rgba\(255,255,255,0\.8\)",\r?\n\s*borderRight: "4px solid rgba\(255,255,255,0\.4\)",\r?\n\s*boxShadow: "16px -16px 36px rgba\(0,0,0,0\.12\), -16px -16px 36px rgba\(255,255,255,1\)",/g;

const newStyles = `background: "#eceff3",
                  borderRadius: "24px 24px 0 0",
                  boxShadow: "-16px 16px 36px rgba(0,0,0,0.18), 16px -16px 36px rgba(255,255,255,1)",`;

cProcess = cProcess.replace(oldStylesRegex, newStyles);

fs.writeFileSync(pProcess, cProcess);
console.log("Applied pure Neumorphism with top-right light source.");
