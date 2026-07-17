const fs = require('fs');

const pProcess = '.claude/worktrees/crazy-taussig/src/components/sections/Process.tsx';
let cProcess = fs.readFileSync(pProcess, 'utf-8');

// 1. Replace Heights and Top Bar declarations
const heightsRegex = /\/\/ Each column taller than the last[\s\S]*?\] as const;\r?\n\r?\n\/\/ Top accent bar[\s\S]*?\] as const;\r?\n\r?\n\/\/ Column backgrounds[\s\S]*?\] as const;\r?\n/;

const newHeights = `// Taller columns to fit text comfortably, still maintaining the ascending bar-chart effect
const COL_HEIGHTS = [
  "clamp(320px, 45vh, 450px)",
  "clamp(380px, 55vh, 520px)",
  "clamp(440px, 65vh, 590px)",
  "clamp(500px, 75vh, 660px)",
] as const;
`;

cProcess = cProcess.replace(heightsRegex, newHeights);

// 2. Replace the main pillar styling and contents
const pillarRegex = /<div\r?\n\s*key=\{step\.num\}\r?\n\s*style=\{\{\r?\n\s*position: "relative",[\s\S]*?\{step\.description\}\r?\n\s*<\/p>\r?\n\s*<\/div>/g;

const newPillar = `<div
                key={step.num}
                style={{
                  position: "relative",
                  flexShrink: 0,
                  width: "clamp(260px, 36vw, 460px)",
                  height: COL_HEIGHTS[i],
                  background: "#f2f4f7",
                  borderRadius: "24px 24px 0 0",
                  borderTop: "4px solid rgba(255,255,255,0.8)",
                  borderLeft: "4px solid rgba(255,255,255,0.8)",
                  borderRight: "4px solid rgba(255,255,255,0.4)",
                  boxShadow: "16px -16px 36px rgba(0,0,0,0.08), -16px -16px 36px rgba(255,255,255,1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  gap: "24px",
                  padding: "clamp(24px, 3vw, 40px)",
                  overflow: "hidden",
                }}
              >
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

                {/* Top section — number + tag + title */}
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: "#e5192a",
                      boxShadow: "0 4px 12px rgba(229,25,42,0.30)",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 14,
                      marginBottom: 16,
                    }}
                  >
                    {step.num}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div
                      style={{
                        display: "inline-block",
                        color: "#e5192a",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                      }}
                    >
                      {step.tag}
                    </div>

                    <h3
                      style={{
                        fontSize: "clamp(18px, 2.5vw, 26px)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.15,
                        color: "#111111",
                        margin: 0,
                      }}
                    >
                      {step.title}
                    </h3>
                  </div>
                </div>

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
              </div>`;

cProcess = cProcess.replace(pillarRegex, newPillar);

// Remove remaining particles if they exist
const remainingParticles = /\/\/\s*⚡⚡⚡ Particles[\s\S]*?const PARTICLES = \[[\s\S]*?\] as const;\r?\n\r?\n?/g;
cProcess = cProcess.replace(remainingParticles, '');

fs.writeFileSync(pProcess, cProcess);
console.log("Process.tsx successfully overhauled.");