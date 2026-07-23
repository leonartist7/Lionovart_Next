const fs = require('fs');

const pProcess = '.claude/worktrees/crazy-taussig/src/components/sections/Process.tsx';
let cProcess = fs.readFileSync(pProcess, 'utf-8');

// 1. Change "01" to "1", etc.
cProcess = cProcess.replace(/num: "01"/g, 'num: "1"');
cProcess = cProcess.replace(/num: "02"/g, 'num: "2"');
cProcess = cProcess.replace(/num: "03"/g, 'num: "3"');
cProcess = cProcess.replace(/num: "04"/g, 'num: "4"');

// 2. Add color transforms
const oldLinesArray = 'const lines = [line1, line2, line3];';
const newColorTransforms = `const lines = [line1, line2, line3];

  const c2Bg = useTransform(scrollYProgress, [0.3, 0.33], ["rgba(229,25,42,0)", "rgba(229,25,42,1)"]);
  const c3Bg = useTransform(scrollYProgress, [0.63, 0.66], ["rgba(229,25,42,0)", "rgba(229,25,42,1)"]);
  const c4Bg = useTransform(scrollYProgress, [0.96, 1], ["rgba(229,25,42,0)", "rgba(229,25,42,1)"]);
  
  const c2Text = useTransform(scrollYProgress, [0.3, 0.33], ["#e5192a", "#ffffff"]);
  const c3Text = useTransform(scrollYProgress, [0.63, 0.66], ["#e5192a", "#ffffff"]);
  const c4Text = useTransform(scrollYProgress, [0.96, 1], ["#e5192a", "#ffffff"]);`;
cProcess = cProcess.replace(oldLinesArray, newColorTransforms);

// 3. Remove background track of connecting line
cProcess = cProcess.replace(
  'className="absolute top-[23px] left-[calc(50%+24px)] h-[2px] bg-[#e5192a]/20 w-[calc(100%-48px+2rem)] md:w-[calc(100%-48px+3.5rem)] overflow-hidden"',
  'className="absolute top-[23px] left-[calc(50%+24px)] h-[2px] w-[calc(100%-48px+2rem)] md:w-[calc(100%-48px+3.5rem)] overflow-hidden"'
);

// 4. Update Number Circle
const oldCircle = /\{\/\* Number Circle \*\/\}\r?\n\s*<div\r?\n\s*className="relative z-10 flex items-center justify-center w-\[48px\] h-\[48px\] rounded-full bg-\[#e5192a\] text-white font-black text-\[16px\] shadow-\[0_4px_12px_rgba\(229,25,42,0\.30\)\]"\r?\n\s*>\r?\n\s*\{step\.num\}\r?\n\s*<\/div>/;

const newCircle = `{/* Number Circle */}
                  <motion.div
                    className="relative z-10 flex items-center justify-center w-[48px] h-[48px] rounded-full border-2 border-[#e5192a] font-black text-[16px] shadow-[0_4px_12px_rgba(229,25,42,0.30)]"
                    style={{
                      backgroundColor: i === 0 ? "#e5192a" : (i === 1 ? c2Bg : (i === 2 ? c3Bg : c4Bg)),
                      color: i === 0 ? "#ffffff" : (i === 1 ? c2Text : (i === 2 ? c3Text : c4Text))
                    }}
                  >
                    {step.num}
                  </motion.div>`;

cProcess = cProcess.replace(oldCircle, newCircle);

// 5. Change Ghost Numbers Watermark Color
cProcess = cProcess.replace(
  'color: "rgba(0,0,0,0.02)",',
  'color: "rgba(229,25,42,0.06)",' // Faint red
);


fs.writeFileSync(pProcess, cProcess);
console.log("Updated Process animations and numbers.");
