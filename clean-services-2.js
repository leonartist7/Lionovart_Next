const fs = require('fs');
const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

const target1 = "  const [activeId, setActiveId] = useState<string>(SERVICES[0].id);\r\n";
const target1_linux = "  const [activeId, setActiveId] = useState<string>(SERVICES[0].id);\n";
const target2 = "  const activeService = SERVICES.find((s) => s.id === activeId) ?? SERVICES[0];";

const idx1 = cServices.indexOf(target1) !== -1 ? cServices.indexOf(target1) + target1.length : cServices.indexOf(target1_linux) + target1_linux.length;
const idx2 = cServices.indexOf(target2);

if (idx1 !== -1 && idx2 !== -1) {
  cServices = cServices.substring(0, idx1) + "\n" + cServices.substring(idx2);
  fs.writeFileSync(pServices, cServices);
  console.log("Services hooks cleaned.");
} else {
  console.log("Could not find targets", idx1, idx2);
}
