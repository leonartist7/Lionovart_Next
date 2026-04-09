const fs = require('fs');
const pProcess = '.claude/worktrees/crazy-taussig/src/components/sections/Process.tsx';
let cProcess = fs.readFileSync(pProcess, 'utf-8');

// Replace width animation with scaleX animation
const oldProgress = /<motion\.div\r?\n\s*className="h-full rounded-full"\r?\n\s*style=\{\{ width: barWidth, background: "#e5192a" \}\}\r?\n\s*\/>/;

const newProgress = `<motion.div
              className="h-full rounded-full origin-left"
              style={{ scaleX: scrollYProgress, background: "#e5192a" }}
            />`;

cProcess = cProcess.replace(oldProgress, newProgress);

// Remove barWidth definition
cProcess = cProcess.replace(/const barWidth = useTransform\(scrollYProgress, \[0, 1\], \["0%", "100%"\]\);\r?\n/, '');

fs.writeFileSync(pProcess, cProcess);
console.log("Optimized Process.tsx progress bar");
