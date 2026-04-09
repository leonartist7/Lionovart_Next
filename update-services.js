const fs = require('fs');

const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

// 1. Remove @paper-design/shaders import
cServices = cServices.replace(/import \{ liquidMetalFragmentShader, ShaderMount \} from "@paper-design\/shaders";\n/, '');

// 2. Remove panelShaderRef, panelShaderMount, and their useEffects
const refsRegex = /\/\/ biome-ignore lint\/suspicious\/noExplicitAny: External library without types\n\s*const panelShaderRef = useRef<HTMLDivElement>\(null\);\n\s*const panelShaderMount = useRef<any>\(null\);\n\n\s*const isInView = useInView\(panelShaderRef, \{ margin: "300px" \}\);\n\n\s*useEffect\(\(\) => \{[\s\S]*?\}\n\s*\}, \[isInView\]\);/g;
cServices = cServices.replace(refsRegex, '');

// Also any leftover useEffects related to shader
cServices = cServices.replace(/useEffect\(\(\) => \{\n\s*if \(panelShaderMount\.current\?\.setSpeed\) \{[\s\S]*?\}, \[isInView\]\);\n/g, '');

// 3. Update the Panel wrapper 
// From: className="relative rounded-[28px]" style={{ padding: "3px" }}
// To: className="relative rounded-[28px] bg-gradient-to-br from-[#e6e9ef] via-[#ffffff] to-[#c8ccd6]" style={{ padding: "1px" }}
cServices = cServices.replace(
  /className="relative rounded-\[28px\]"\n\s*style=\{\{ padding: "3px" \}\}/g,
  'className="relative rounded-[28px] bg-gradient-to-br from-[#e6e9ef] via-[#ffffff] to-[#d5d9e2]"\n          style={{ padding: "1px" }}'
);

// 4. Remove the Shader container completely
const shaderContainerRegex = /\{\/\* Liquid metal shader rim \*\/\}\n\s*<div\n\s*ref=\{panelShaderRef\}\n\s*className="shader-container-card"\n\s*style=\{\{\n\s*position: "absolute",\n\s*inset: 0,\n\s*borderRadius: "28px",\n\s*overflow: "hidden",\n\s*pointerEvents: "none",\n\s*\}\}\n\s*\/>/g;
cServices = cServices.replace(shaderContainerRegex, '');

// 5. Update the Inner glass panel styling
// From: shadow-[0_12px_64px_-12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]
// To: shadow-[0_12px_64px_-12px_rgba(0,0,0,0.12),inset_0_8px_32px_rgba(255,255,255,1),inset_0_1px_2px_rgba(255,255,255,1)]
cServices = cServices.replace(
  /shadow-\[0_12px_64px_-12px_rgba\(0,0,0,0\.12\),inset_0_1px_0_rgba\(255,255,255,0\.95\)\]/g,
  'shadow-[0_12px_64px_-12px_rgba(0,0,0,0.12),inset_0_8px_32px_rgba(255,255,255,1),inset_0_1px_2px_rgba(255,255,255,1)]'
);

// 6. Neumorphism on AccordionItem
// Current: className="border-b border-black/[0.07] last:border-b-0"
// Change: className={`transition-all duration-500 ease-out border-b border-black/[0.07] last:border-b-0 ${activeId === service.id ? 'bg-[#fcfdff] border-transparent shadow-[4px_4px_16px_rgba(0,0,0,0.06),-4px_-4px_16px_rgba(255,255,255,1)] rounded-2xl p-5 -mx-5 relative z-10' : ''}`}
cServices = cServices.replace(
  /className="border-b border-black\/\[0\.07\] last:border-b-0"/g,
  'className={`transition-all duration-500 ease-out border-b border-black/[0.07] last:border-b-0 ${activeId === service.id ? \'bg-[#fcfdff] border-transparent shadow-[4px_4px_16px_rgba(0,0,0,0.06),-4px_-4px_16px_rgba(255,255,255,1)] rounded-2xl p-5 -mx-5 relative z-10\' : \'\'}`}'
);

fs.writeFileSync(pServices, cServices);
console.log("Updated Services.tsx properly.");
