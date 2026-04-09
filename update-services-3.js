const fs = require('fs');

const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

// 1. Shrink Image Container
const oldImageWrapper = /\{\/\* ── Right: Sticky Image ── \*\/\}\r?\n\s*<div className="hidden md:block h-full relative">\r?\n\s*<div className="sticky top-28">\r?\n\s*<div className="relative overflow-hidden rounded-\[24px\] aspect-\[3\/4\] bg-\[#e8e3de\] shadow-\[0_8px_40px_rgba\(0,0,0,0\.10\)\]">/g;

const newImageWrapper = `{/* ── Right: Sticky Image ── */}
            <div className="hidden md:block h-full relative">
              <div className="sticky top-28 flex flex-col items-center">
                <div className="w-[85%] lg:w-[70%]">
                  <div className="relative overflow-hidden rounded-[24px] aspect-[3/4] bg-[#e8e3de] shadow-[0_8px_40px_rgba(0,0,0,0.10)]">`;

cServices = cServices.replace(oldImageWrapper, newImageWrapper);

// 2. Close Image Container
const oldClosing = /aria-label=\{s\.title\}\r?\n\s*\/>\r?\n\s*\)\)\}\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>/g;

const newClosing = `aria-label={s.title}
                  />
                ))}
              </div>
              </div>{/* /w-[70%] wrapper */}
            </div>
            </div>`;

cServices = cServices.replace(oldClosing, newClosing);

// 3. Add useLenis import
cServices = cServices.replace(
  'import { motion, AnimatePresence, useInView } from "framer-motion";\nimport {\n  Accordion,',
  'import { motion, AnimatePresence, useInView } from "framer-motion";\nimport { useLenis } from "@studio-freight/react-lenis";\nimport {\n  Accordion,'
);
// Handle windows CRLF as well just in case
cServices = cServices.replace(
  'import { motion, AnimatePresence, useInView } from "framer-motion";\r\nimport {\r\n  Accordion,',
  'import { motion, AnimatePresence, useInView } from "framer-motion";\r\nimport { useLenis } from "@studio-freight/react-lenis";\r\nimport {\r\n  Accordion,'
);

// 4. Initialize useLenis inside Services
cServices = cServices.replace(
  'export default function Services() {\n  const [activeId, setActiveId] = useState<string>(SERVICES[0].id);',
  'export default function Services() {\n  const lenis = useLenis();\n  const [activeId, setActiveId] = useState<string>(SERVICES[0].id);'
);
cServices = cServices.replace(
  'export default function Services() {\r\n  const [activeId, setActiveId] = useState<string>(SERVICES[0].id);',
  'export default function Services() {\r\n  const lenis = useLenis();\r\n  const [activeId, setActiveId] = useState<string>(SERVICES[0].id);'
);

// 5. Update onClick handler for smooth scrolling
const oldTrigger = /<AccordionTrigger\r?\n\s*className="group flex w-full items-center justify-between py-6 md:py-7 text-left hover:no-underline"\r?\n\s*onClick=\{\(e\) => \{\r?\n\s*setActiveId\(service\.id\);\r?\n\s*const target = e\.currentTarget;\r?\n\s*setTimeout\(\(\) => \{\r?\n\s*target\.scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\);\r?\n\s*\}, 250\);\r?\n\s*\}\}\r?\n\s*>/g;

const newTrigger = `<AccordionTrigger
                      className="group flex w-full items-center justify-between py-6 md:py-7 text-left hover:no-underline"
                      onClick={(e) => {
                        setActiveId(service.id);
                        const target = e.currentTarget.parentElement;
                        setTimeout(() => {
                          if (lenis) {
                            lenis.scrollTo(target, { offset: -120, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                          } else {
                            target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }
                        }, 250);
                      }}
                    >`;

cServices = cServices.replace(oldTrigger, newTrigger);

fs.writeFileSync(pServices, cServices);
console.log("Services.tsx perfectly updated with smooth scroll and smaller image.");
