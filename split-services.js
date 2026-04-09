const fs = require('fs');

const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

// 1. Fix useState
cServices = cServices.replace(
  'const [activeId, setActiveId] = useState<string>(SERVICES[0].id);',
  'const [activeId, setActiveId] = useState<string>(SERVICES[3].id);'
);

cServices = cServices.replace(
  'const activeService = SERVICES.find((s) => s.id === activeId) ?? SERVICES[0];',
  'const activeService = SERVICES.find((s) => s.id === activeId) ?? SERVICES[3];'
);

// 2. Replace the layout inside the glass panel
const oldLayoutRegex = /<div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:gap-20">[\s\S]*?<\/div>\{\/\* \/inner glass panel \*\/\}/;

const newLayout = `          <div className="flex flex-col w-full">

            {/* ── PART 1: HORIZONTAL SERVICES (1-3) ── */}
            <div className="flex flex-col gap-8 md:gap-16 w-full mb-16 md:mb-24">
              {SERVICES.slice(0, 3).map((service, idx) => (
                <div
                  key={service.id}
                  className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full bg-[#f2f4f7] rounded-[32px] p-6 md:p-12 shadow-[12px_12px_36px_rgba(0,0,0,0.08),-12px_-12px_36px_rgba(255,255,255,1)] border-t border-l border-white/60"
                >
                  {/* Left Text */}
                  <div className="flex-1 flex flex-col items-start text-left w-full">
                    <p className="text-brand-red text-[13px] md:text-[16px] font-black tracking-widest mb-4 opacity-80">
                      {service.number}
                    </p>
                    <h3 className="text-[#111] text-[28px] sm:text-[36px] md:text-[42px] font-bold uppercase tracking-tight mb-6 leading-none">
                      {service.title}
                    </h3>
                    <p className="text-[#555] text-[14px] md:text-[16px] leading-[1.8] mb-8 max-w-[90%]">
                      {service.description}
                    </p>

                    <ul className="flex flex-wrap gap-x-5 gap-y-3 mb-2">
                      {service.deliverables.map((item) => (
                        <li key={item} className="text-[11px] font-bold uppercase tracking-wider text-brand-red">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Image */}
                  <div className="w-full md:w-[45%] flex-shrink-0">
                    <div className="relative rounded-[24px] aspect-[4/3] p-[2px] bg-[#f2f4f7] border border-white/80 shadow-[16px_16px_36px_rgba(0,0,0,0.12),-16px_-16px_36px_rgba(255,255,255,1)]">
                      <div className="relative w-full h-full overflow-hidden rounded-[22px] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.12),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]">
                        <img src={service.media.url} alt={service.media.alt} className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── DIVIDER ── */}
            <div className="w-full h-[1px] bg-black/5 mb-16 md:mb-24" />

            {/* ── PART 2: ACCORDION SERVICES (4-7) ── */}
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] lg:grid-cols-[1.5fr_1fr] gap-10 md:gap-16 lg:gap-24">
              
              {/* ── Left: Accordion ── */}
              <div>
                <Accordion className="flex flex-col" defaultValue={[SERVICES[3].id]}>
                  {SERVICES.slice(3).map((service) => (
                    <AccordionItem
                      key={service.id}
                      value={service.id}
                      className={\`transition-all duration-500 ease-out border-b border-black/[0.07] last:border-b-0 \${activeId === service.id ? 'bg-[#f2f4f7] shadow-[8px_8px_20px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,1)] border-t border-l border-white/60 relative z-10 -mx-4 px-4 md:-mx-6 md:px-6' : '-mx-4 px-4 md:-mx-6 md:px-6'}\`}
                    >
                      <AccordionTrigger
                        className="group flex w-full items-center justify-between py-6 md:py-7 text-left hover:no-underline"
                        onClick={(e) => {
                          setActiveId(service.id);
                          const target = e.currentTarget.parentElement;
                          setTimeout(() => {
                            if (lenis) {
                              lenis.scrollTo(target, { offset: -120, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                            } else {
                              if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }
                          }, 250);
                        }}
                      >
                        <div className="flex items-center gap-5 md:gap-7">
                          <span className="text-[#e5192a] font-black text-[14px] md:text-[16px] tracking-widest opacity-80">
                            {service.number}
                          </span>
                          <span className="text-[#111] font-bold text-[18px] md:text-[24px] uppercase tracking-tight group-hover:text-[#e5192a] transition-colors">
                            {service.title}
                          </span>
                        </div>
                        <div
                          className={
                            activeId === service.id
                              ? "w-2.5 h-2.5 bg-[#e5192a]"
                              : "w-2.5 h-2.5 bg-black/20 group-hover:bg-black/40"
                          }
                          style={{ borderRadius: "50%", transition: "background 0.3s" }}
                        />
                      </AccordionTrigger>

                      <AccordionContent className="pb-6 md:pb-8">
                        <div className="pl-[44px] md:pl-[52px]">
                          <p className="text-[#555] text-[13px] md:text-[15px] leading-[1.8] mb-0 max-w-[90%]">
                            {service.description}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* ── Right: Sticky Image & Tags ── */}
              <div className="hidden md:block relative">
                <div className="sticky top-28 flex flex-col items-center">
                  <div className="w-[100%] lg:w-[90%]">
                    
                    {/* Neumorphic Image Frame */}
                    <div className="relative rounded-[24px] aspect-[3/4] p-[2px] bg-[#f2f4f7] border border-white/80 shadow-[16px_16px_36px_rgba(0,0,0,0.12),-16px_-16px_36px_rgba(255,255,255,1)]">
                      <div className="relative w-full h-full overflow-hidden rounded-[22px] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.12),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]">
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
                    </div>

                    {/* Dynamic Tags Underneath */}
                    <div className="mt-8 flex justify-center w-full">
                      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-3">
                        <AnimatePresence mode="popLayout">
                          {activeService.deliverables.map((item) => (
                            <motion.li
                              key={\`tag-\${activeService.id}-\${item}\`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.4 }}
                              className="text-[11px] font-bold uppercase tracking-wider text-brand-red"
                            >
                              {item}
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
          </div>{/* /inner glass panel */}`;

cServices = cServices.replace(oldLayoutRegex, newLayout);

fs.writeFileSync(pServices, cServices);
console.log("Services.tsx perfectly split into the two layouts for testing!");
