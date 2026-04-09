const fs = require('fs');

const pProcess = '.claude/worktrees/crazy-taussig/src/components/sections/Process.tsx';
let cProcess = fs.readFileSync(pProcess, 'utf-8');

// 1. Text Replacements
cProcess = cProcess.replace(
  /"We learn your business, your audience, and your standards. We ask the questions most agencies skip [\s\S]*? because the best creative work starts with clarity, not assumptions\."/,
  '"We learn your business, your audience, and your standards. We ask the questions most agencies skip because the best creative work starts with clarity."'
);

cProcess = cProcess.replace(
  /"We bring the concepts to life [\s\S]*? websites, video, social, print [\s\S]*? all built to the same standard and reviewed with you at every stage\."/,
  '"We bring the concepts to life including websites, video, social and print. All built to the same standard and reviewed with you at every stage."'
);

cProcess = cProcess.replace(
  /"Your brand goes live\. We don't just hand over the keys [\s\S]*? we set up the systems, track the results, and stay available for what comes next\."/,
  '"Your brand goes live. We don\'t just hand over the keys. We set up the systems, track the results, and stay available for what comes next."'
);


// 2. Remove old scroll progress bar under title
const oldProgressBar = /\s*\{\/\* Scroll progress bar \*\/\}\r?\n\s*<div\r?\n\s*className="h-\[2px\] rounded-full overflow-hidden"\r?\n\s*style=\{\{ background: "rgba\(229,25,42,0\.12\)" \}\}\r?\n\s*>\r?\n\s*<motion\.div\r?\n\s*className="h-full rounded-full origin-left"\r?\n\s*style=\{\{ scaleX: scrollYProgress, background: "#e5192a" \}\}\r?\n\s*\/>\r?\n\s*<\/div>/g;

cProcess = cProcess.replace(oldProgressBar, '');

// 3. Create the lines array below scrollYProgress
const scrollProgressTarget = /const \{ scrollYProgress \} = useScroll\(\{\r?\n\s*target: sectionRef,\r?\n\s*offset: \["start start", "end end"\],\r?\n\s*\}\);\r?\n/;

const newScrollProgress = `const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const line1 = useTransform(scrollYProgress, [0, 0.33], [0, 1]);
  const line2 = useTransform(scrollYProgress, [0.33, 0.66], [0, 1]);
  const line3 = useTransform(scrollYProgress, [0.66, 1], [0, 1]);
  const lines = [line1, line2, line3];
`;

cProcess = cProcess.replace(scrollProgressTarget, newScrollProgress);

// 4. Update Timeline Header Row
const oldTimelineRow = /\{\/\* Timeline Header Row \*\/\}\r?\n\s*<div className="flex items-start gap-8 md:gap-14 px-6 md:px-14 relative z-20">[\s\S]*?\{\/\* Pillars Row \*\/\}/;

const newTimelineRow = `{/* Timeline Header Row */}
            <div className="flex items-start gap-8 md:gap-14 px-6 md:px-14 relative z-20">
              {STEPS.map((step, i) => (
                <div
                  key={\`tl-\${step.num}\`}
                  style={{ width: "clamp(240px, 32vw, 420px)" }}
                  className="flex-shrink-0 relative flex flex-col items-start"
                >
                  {/* Connecting red line */}
                  {i < STEPS.length - 1 && (
                    <div
                      className="absolute top-[23px] left-[48px] h-[2px] bg-[#e5192a]/20 w-[calc(100%-48px+2rem)] md:w-[calc(100%-48px+3.5rem)] overflow-hidden"
                    >
                      <motion.div 
                        className="h-full bg-[#e5192a] origin-left" 
                        style={{ scaleX: lines[i] }} 
                      />
                    </div>
                  )}

                  {/* Number Circle */}
                  <div
                    className="relative z-10 flex items-center justify-center w-[48px] h-[48px] rounded-full bg-[#e5192a] text-white font-black text-[16px] shadow-[0_4px_12px_rgba(229,25,42,0.30)]"
                  >
                    {step.num}
                  </div>

                  {/* Tag Only */}
                  <div className="mt-6 flex flex-col gap-2">
                    <div className="text-[#e5192a] text-[12px] font-bold uppercase tracking-[0.18em]">
                      {step.tag}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pillars Row */}`;

cProcess = cProcess.replace(oldTimelineRow, newTimelineRow);

// 5. Add Title into Pillar Row
const oldPillarContent = /\{\/\* Description \*\/\}\r?\n\s*<p\r?\n\s*style=\{\{/g;
const newPillarContent = `{/* Title & Description */}
                  <div className="flex flex-col gap-5 relative z-10">
                    <h3 className="text-[#111] text-[clamp(20px,2.8vw,32px)] font-bold uppercase tracking-[-0.01em] leading-[1.1] m-0 pr-4">
                      {step.title}
                    </h3>
                    <p
                      style={{`;

cProcess = cProcess.replace(oldPillarContent, newPillarContent);

// Also close the new title/description div.
const oldDescClosing = /\{step\.description\}\r?\n\s*<\/p>\r?\n\r?\n\s*\{\/\* Ghost number watermark \*\/\}/g;
const newDescClosing = `{step.description}
                    </p>
                  </div>

                  {/* Ghost number watermark */}`;

cProcess = cProcess.replace(oldDescClosing, newDescClosing);


fs.writeFileSync(pProcess, cProcess);
console.log("Timeline line animated and text updated!");
