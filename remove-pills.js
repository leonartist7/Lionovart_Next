const fs = require('fs');

const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

const oldTags = `<ul className="flex flex-wrap gap-2 mb-2">
                          {service.deliverables.map((item) => (
                            <li
                              key={item}
                              className="
                                rounded-[6px]
                                border border-brand-red/25
                                bg-brand-red/[0.06]
                                px-3 py-[6px]
                                text-[11px] font-bold uppercase tracking-wider
                                text-brand-red
                              "
                            >
                              {item}
                            </li>
                          ))}
                        </ul>`;

const newTags = `<ul className="flex flex-wrap gap-x-5 gap-y-2 mb-2">
                          {service.deliverables.map((item) => (
                            <li
                              key={item}
                              className="text-[11px] font-bold uppercase tracking-wider text-brand-red"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>`;

// Regex match for flexibility across platforms (Windows CRLF vs Linux LF)
const targetRegex = /<ul className="flex flex-wrap gap-2 mb-2">[\s\S]*?<\/ul>/;

cServices = cServices.replace(targetRegex, newTags);

fs.writeFileSync(pServices, cServices);
console.log("Pill backgrounds removed from tags.");
