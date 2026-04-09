const fs = require('fs');

const pPortfolio = '.claude/worktrees/crazy-taussig/src/components/sections/Portfolio.tsx';
let cPortfolio = fs.readFileSync(pPortfolio, 'utf-8');

// 1. Symmetrical Gradient replacement
const oldGradient = /conic-gradient\(from 0deg at 50% 50%, transparent 0%, rgba\(229,25,42,0\.8\) 20%, transparent 40%, rgba\(229,25,42,0\.8\) 60%, transparent 80%\)/g;
const newGradient = "conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(229,25,42,0.8) 25%, transparent 50%, rgba(229,25,42,0.8) 75%, transparent 100%)";

cPortfolio = cPortfolio.replace(oldGradient, newGradient);

// 2. Layout Replacement in BentoCard
const oldContentBlock = /\{\/\* Content \*\/\}\r?\n\s*<div className="relative z-10 flex flex-col justify-end px-6 pt-6 pb-\[15px\] md:px-8 md:pt-8 md:pb-\[19px\]">\r?\n\s*<span\r?\n\s*className="mb-1 text-\[2\.5rem\] font-\[800\] leading-none text-\[#e5192a\]"\r?\n\s*style=\{\{ textShadow: "0 2px 8px rgba\(0,0,0,0\.15\)" \}\}\r?\n\s*>\r?\n\s*\{project\.metric\}\r?\n\s*<\/span>\r?\n\s*<h3 className="mb-0 text-\[1\.1rem\] font-bold text-\[#0d0d0d\]">\r?\n\s*\{project\.title\}\r?\n\s*<\/h3>\r?\n\s*<\/div>/g;

const newContentBlock = `{/* Content */}
          <div className="relative z-10 flex flex-row items-end justify-between px-6 pt-6 pb-[15px] md:px-8 md:pt-8 md:pb-[19px]">
            <span
              className="text-[2.5rem] font-[800] leading-none text-[#e5192a] mb-0"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
            >
              {project.metric}
            </span>
            <h3 className="mb-1 text-[1.1rem] font-bold text-[#111] text-right max-w-[55%]">
              {project.title}
            </h3>
          </div>`;

cPortfolio = cPortfolio.replace(oldContentBlock, newContentBlock);

fs.writeFileSync(pPortfolio, cPortfolio);
console.log("Applied symmetrical gradient and bottom-left/right flex-row layout.");
