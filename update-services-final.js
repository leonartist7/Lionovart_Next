const fs = require('fs');
const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

// 1. Fix grid
cServices = cServices.replace(
  '<div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:gap-20 lg:items-start">',
  '<div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:gap-20">'
);

// 2. Fix sticky wrapper (opening)
cServices = cServices.replace(
  '<div className="hidden md:block md:sticky md:top-28 lg:sticky lg:top-28">',
  '<div className="hidden md:block h-full relative">\n              <div className="sticky top-28">'
);

// 2. Fix sticky wrapper (closing)
// We need to add one more </div> at the very end of the right column block.
cServices = cServices.replace(
  /aria-label=\{s\.title\}\r?\n\s*\/>\r?\n\s*\)\)\}\r?\n\s*<\/div>\r?\n\s*<\/div>/,
  'aria-label={s.title}\n                  />\n                ))}\n              </div>\n            </div>\n            </div>'
);

// 3. Fix AccordionItem Neumorphism
const oldAccordionItem = /<AccordionItem[\s\S]*?className=\{`transition-all duration-500 ease-out border-b border-black\/\[0\.07\] last:border-b-0 \$\{activeId === service\.id \? 'bg-\[#fcfdff\] shadow-\[0_4px_16px_rgba\(0,0,0,0\.03\),0_-4px_16px_rgba\(255,255,255,0\.8\)\] relative z-10 px-4 -mx-4' : 'px-4 -mx-4'\}`\}/;

const newAccordionItem = `<AccordionItem
                    key={service.id}
                    value={service.id}
                    className={\`transition-all duration-500 ease-out border-b border-black/[0.07] last:border-b-0 \${activeId === service.id ? 'bg-[#fcfdff] shadow-[0_6px_20px_rgba(0,0,0,0.04),0_-6px_20px_rgba(255,255,255,0.9)] relative z-10 -mx-4 px-4 md:-mx-6 md:px-6' : '-mx-4 px-4 md:-mx-6 md:px-6'}\`}`;

cServices = cServices.replace(oldAccordionItem, newAccordionItem);

// 4. Fix Auto-Center
const oldTrigger = /onClick=\{\(\) => setActiveId\(service\.id\)\}/g;
const newTrigger = `onClick={(e) => {
                      setActiveId(service.id);
                      const target = e.currentTarget;
                      setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 250);
                    }}`;
cServices = cServices.replace(oldTrigger, newTrigger);

fs.writeFileSync(pServices, cServices);
console.log("Services.tsx successfully patched.");
