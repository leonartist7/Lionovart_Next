const fs = require('fs');

const pProcess = '.claude/worktrees/crazy-taussig/src/components/sections/Process.tsx';
let cProcess = fs.readFileSync(pProcess, 'utf-8');

const targetRegex = /\{\/\* Horizontally-translating row of columns \*\/\}\r?\n\s*<motion\.div[\s\S]*?<\/motion\.div>/;

const replacement = `{/* Horizontally-translating row of columns */}
          <motion.div
            ref={rowRef}
            style={{ x }}
            className="flex flex-col justify-between h-full pt-8 md:pt-16 pb-0 will-change-transform w-max"
          >
            {/* Timeline Header Row */}
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
                      className="absolute top-[23px] left-[48px] h-[2px] bg-[#e5192a]/20 w-[calc(100%-48px+2rem)] md:w-[calc(100%-48px+3.5rem)]"
                    />
                  )}

                  {/* Number Circle */}
                  <div
                    className="relative z-10 flex items-center justify-center w-[48px] h-[48px] rounded-full bg-[#e5192a] text-white font-black text-[16px] shadow-[0_4px_12px_rgba(229,25,42,0.30)]"
                  >
                    {step.num}
                  </div>

                  {/* Tag & Title */}
                  <div className="mt-6 flex flex-col gap-2">
                    <div className="text-[#e5192a] text-[11px] font-bold uppercase tracking-[0.18em]">
                      {step.tag}
                    </div>
                    <h3 className="text-[#111] text-[clamp(18px,2.5vw,26px)] font-bold uppercase tracking-[-0.01em] leading-[1.15] m-0 pr-4">
                      {step.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Pillars Row */}
            <div className="flex items-end gap-8 md:gap-14 px-6 md:px-14 mt-auto relative z-10">
              {STEPS.map((step, i) => (
                <div
                  key={\`pl-\${step.num}\`}
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    width: "clamp(240px, 32vw, 420px)",
                    height: COL_HEIGHTS[i],
                    background: "#eceff3",
                    borderRadius: "24px 24px 0 0",
                    boxShadow: "-8px 8px 24px rgba(0,0,0,0.15), 8px -8px 24px rgba(255,255,255,1)",
                    padding: "clamp(24px, 3vw, 40px)",
                    overflow: "hidden",
                  }}
                >
                  {/* Description */}
                  <p
                    style={{
                      fontSize: "clamp(13px, 1.4vw, 15px)",
                      lineHeight: "180%",
                      color: "#555",
                      margin: 0,
                      maxWidth: "90%",
                    }}
                  >
                    {step.description}
                  </p>

                  {/* Ghost number watermark */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: -16,
                      right: -8,
                      fontSize: "clamp(80px, 12vw, 130px)",
                      fontWeight: 900,
                      lineHeight: 1,
                      color: "rgba(0,0,0,0.02)",
                      pointerEvents: "none",
                      userSelect: "none",
                      fontFamily: "var(--font-heading, sans-serif)",
                    }}
                    aria-hidden
                  >
                    {step.num}
                  </span>
                </div>
              ))}
              
              {/* Trailing spacer keeps last column away from the edge */}
              <div style={{ flexShrink: 0, width: "clamp(24px, 6vw, 56px)" }} aria-hidden />
            </div>
          </motion.div>`;

cProcess = cProcess.replace(targetRegex, replacement);

fs.writeFileSync(pProcess, cProcess);
console.log("Process layout timeline replaced.");
