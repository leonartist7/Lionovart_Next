const fs = require('fs');

const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

const oldImageBlock = /<div className="relative overflow-hidden rounded-\[24px\] aspect-\[3\/4\] bg-\[#e8e3de\] border-\[8px\] border-white shadow-\[24px_24px_64px_rgba\(0,0,0,0\.16\),-20px_-20px_60px_rgba\(255,255,255,1\)\] ring-1 ring-black\/5">\r?\n\r?\n\s*<AnimatePresence mode="sync">\r?\n\s*<motion\.img[\s\S]*?transition=\{\{ duration: 0\.6, ease: \[0\.16, 1, 0\.3, 1\] \}\}\r?\n\s*\/>\r?\n\s*<\/AnimatePresence>\r?\n\s*<\/div>/g;

const newImageBlock = `                  {/* Neumorphic Extruded Bezel (Based on CodePen) */}
                  <div className="relative rounded-[24px] aspect-[3/4] p-3 md:p-4 bg-[#f0f3f8] shadow-[12px_12px_24px_rgba(0,0,0,0.12),-12px_-12px_24px_rgba(255,255,255,1)]">
                    {/* Inner Embedded Image Container */}
                    <div className="relative w-full h-full overflow-hidden rounded-[16px] shadow-[inset_4px_4px_10px_rgba(0,0,0,0.06),inset_-4px_-4px_10px_rgba(255,255,255,0.7)]">
                      <AnimatePresence mode="sync">
                        <motion.img
                          key={activeService.id}
                          src={activeService.media.url}
                          alt={activeService.media.alt}
                          className="absolute inset-0 h-full w-full object-cover"
                          initial={{ opacity: 0, scale: 1.06 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </AnimatePresence>
                    </div>
                  </div>`;

cServices = cServices.replace(oldImageBlock, newImageBlock);

fs.writeFileSync(pServices, cServices);
console.log("Neumorphic CodePen style applied successfully.");