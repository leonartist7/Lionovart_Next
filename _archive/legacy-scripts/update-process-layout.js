const fs = require('fs');

const pProcess = '.claude/worktrees/crazy-taussig/src/components/sections/Process.tsx';
let cProcess = fs.readFileSync(pProcess, 'utf-8');

// 1. Change section background to a cooler off-white so neumorphism pops
cProcess = cProcess.replace(
  'className="relative bg-white"',
  'className="relative bg-[#eceff3]"'
);

// 2. Change pillar background to perfectly match the new section background, and boost shadow opacity slightly
cProcess = cProcess.replace(
  'background: "#f2f4f7",',
  'background: "#eceff3",'
);
cProcess = cProcess.replace(
  'boxShadow: "16px -16px 36px rgba(0,0,0,0.08), -16px -16px 36px rgba(255,255,255,1)",',
  'boxShadow: "16px -16px 36px rgba(0,0,0,0.12), -16px -16px 36px rgba(255,255,255,1)",'
);

// 3. Move the title/tag to the right of the number in a flex row
const oldTopSection = /\{\/\* Top section — number \+ tag \+ title \*\/\}\r?\n\s*<div>\r?\n\s*<div\r?\n\s*style=\{\{\r?\n\s*display: "inline-flex",[\s\S]*?\{step\.title\}\r?\n\s*<\/h3>\r?\n\s*<\/div>\r?\n\s*<\/div>/g;

const newTopSection = `{/* Top section — number + tag + title */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div
                    style={{
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "#e5192a",
                      boxShadow: "0 4px 12px rgba(229,25,42,0.30)",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 16,
                    }}
                  >
                    {step.num}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "2px" }}>
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
                </div>`;

cProcess = cProcess.replace(oldTopSection, newTopSection);

fs.writeFileSync(pProcess, cProcess);
console.log("Process.tsx layout and neumorphism dramatically enhanced.");