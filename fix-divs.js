const fs = require('fs');

const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

// The file currently has:
/*
            {/* ── Right: Sticky Image ── * /}
            <div className="hidden md:block relative">
              <div className="sticky top-28">
              <div className="relative overflow-hidden rounded-[24px] aspect-[3/4] bg-[#e8e3de] shadow-[0_8px_40px_rgba(0,0,0,0.10)]">
*/

const targetRegex = /\{\/\* ── Right: Sticky Image ── \*\/\}\r?\n\s*<div className="hidden md:block relative">\r?\n\s*<div className="sticky top-28">\r?\n\s*<div className="relative overflow-hidden rounded-\[24px\] aspect-\[3\/4\] bg-\[#e8e3de\] shadow-\[0_8px_40px_rgba\(0,0,0,0\.10\)\]">/;

const newWrapper = `{/* ── Right: Sticky Image ── */}
            <div className="hidden md:block relative">
              <div className="sticky top-28 flex flex-col items-center">
                <div className="w-[85%] lg:w-[70%]">
                  <div className="relative overflow-hidden rounded-[24px] aspect-[3/4] bg-[#e8e3de] shadow-[0_8px_40px_rgba(0,0,0,0.10)]">`;

cServices = cServices.replace(targetRegex, newWrapper);

fs.writeFileSync(pServices, cServices);
console.log("Services layout perfectly fixed.");
