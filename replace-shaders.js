const fs = require('fs');

const pPortfolio = '.claude/worktrees/crazy-taussig/src/components/sections/Portfolio.tsx';
let cPortfolio = fs.readFileSync(pPortfolio, 'utf-8');

// 1. Remove Shader imports
cPortfolio = cPortfolio.replace(/import \{ liquidMetalFragmentShader, ShaderMount \} from "@paper-design\/shaders";\r?\n/, '');

// 2. Remove hooks in ProjectCard
const hooksRegex1 = /\s*\/\/ biome-ignore lint\/suspicious\/noExplicitAny: External library without types\r?\n\s*const shaderRef = useRef<HTMLDivElement>\(null\);\r?\n\s*const shaderMount = useRef<any>\(null\);\r?\n\r?\n\s*const isInView = useInView\(shaderRef, \{ margin: "300px" \}\);\r?\n\r?\n\s*useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);\r?\n\r?\n\s*\/\/ Separate effect to pause animation when off-screen to save battery without recompiling\r?\n\s*useEffect\(\(\) => \{[\s\S]*?\}, \[isInView\]\);/g;
cPortfolio = cPortfolio.replace(hooksRegex1, '');

// 3. Remove hooks in BentoCard
const hooksRegex2 = /\s*const isInView = useInView\(shaderRef, \{ margin: "300px" \}\);\r?\n\r?\n\s*useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);\r?\n\r?\n\s*\/\/ Separate effect to pause animation when off-screen to save battery without recompiling\r?\n\s*useEffect\(\(\) => \{[\s\S]*?\}, \[isInView\]\);/g;
cPortfolio = cPortfolio.replace(hooksRegex2, '');

// Also remove the shaderRefs in BentoCard (they are above isInView)
const bentoRefsRegex = /\s*const shaderRef = useRef<HTMLDivElement>\(null\);\r?\n\s*const shaderMount = useRef<any>\(null\);\r?\n/g;
cPortfolio = cPortfolio.replace(bentoRefsRegex, '');

// 4. Replace ProjectCard shader with CSS gradient
const oldProjectCardShader = /\{\/\* Liquid metal shader — fills full card, visible only as the 3px rim \*\/\}\r?\n\s*<div\r?\n\s*ref=\{shaderRef\}\r?\n\s*className="shader-container-card"\r?\n\s*style=\{\{\r?\n\s*position: "absolute",\r?\n\s*inset: 0,\r?\n\s*borderRadius: "20px",\r?\n\s*overflow: "hidden",\r?\n\s*pointerEvents: "none",\r?\n\s*\}\}\r?\n\s*\/>\r?\n\r?\n\s*\{\/\* Inner dark layer — 3px inset leaves shader visible as the border \*\/\}\r?\n\s*<div\r?\n\s*className="flex flex-col"\r?\n\s*style=\{\{\r?\n\s*position: "absolute",\r?\n\s*inset: "3px",\r?\n\s*borderRadius: "17px",\r?\n\s*background: "#0d0d0d",\r?\n\s*overflow: "hidden",\r?\n\s*\}\}\r?\n\s*>/g;

const newProjectCardShader = `{/* Soft Animated Rim */}
        <div
          className="absolute inset-[-100%] animate-[spin_5s_linear_infinite]"
          style={{
            background: "conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(229,25,42,0.8) 20%, transparent 40%, rgba(229,25,42,0.8) 60%, transparent 80%)",
            opacity: 0.6,
          }}
        />

        {/* Inner dark layer — 2px inset leaves the animated gradient visible as the border */}
        <div
          className="flex flex-col"
          style={{
            position: "absolute",
            inset: "2px",
            borderRadius: "18px",
            background: "#0d0d0d",
            overflow: "hidden",
          }}
        >`;

cPortfolio = cPortfolio.replace(oldProjectCardShader, newProjectCardShader);

// Update ProjectCard outer shell background
cPortfolio = cPortfolio.replace(
  '        className="relative flex h-full w-full min-h-[220px] md:min-h-0"',
  '        className="relative flex h-full w-full min-h-[220px] md:min-h-0 bg-[#161616]"'
);

// 5. Replace BentoCard shader with CSS gradient
const oldBentoCardShader = /\{\/\* Liquid metal shader — fills the full card; only the 3px rim is exposed \*\/\}\r?\n\s*<div\r?\n\s*ref=\{shaderRef\}\r?\n\s*className="shader-container-card"\r?\n\s*style=\{\{\r?\n\s*position: "absolute",\r?\n\s*inset: 0,\r?\n\s*borderRadius: "20px",\r?\n\s*overflow: "hidden",\r?\n\s*pointerEvents: "none",\r?\n\s*\}\}\r?\n\s*\/>\r?\n\r?\n\s*\{\/\* Inner content wrapper — 3px inset makes the shader ring visible as the border \*\/\}\r?\n\s*<div\r?\n\s*className="absolute flex flex-col justify-end"\r?\n\s*style=\{\{\r?\n\s*inset: "3px",\r?\n\s*borderRadius: "17px",\r?\n\s*background: "#161616",\r?\n\s*overflow: "hidden",\r?\n\s*\}\}\r?\n\s*>/g;

const newBentoCardShader = `{/* Soft Animated Rim */}
        <motion.div
          className="absolute inset-[-100%] animate-[spin_5s_linear_infinite]"
          style={{
            background: "conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(229,25,42,0.8) 20%, transparent 40%, rgba(229,25,42,0.8) 60%, transparent 80%)",
          }}
          animate={{ opacity: isHovered ? 1 : 0.3 }}
          transition={{ duration: 0.4 }}
        />

        {/* Inner content wrapper — 2px inset makes the rim visible */}
        <div
          className="absolute flex flex-col justify-end"
          style={{
            inset: "2px",
            borderRadius: "18px",
            background: "#161616",
            overflow: "hidden",
          }}
        >`;

cPortfolio = cPortfolio.replace(oldBentoCardShader, newBentoCardShader);

// Update BentoCard outer shell background
cPortfolio = cPortfolio.replace(
  '        className="relative flex h-full w-full cursor-default min-h-[220px] md:min-h-0"',
  '        className="relative flex h-full w-full cursor-default min-h-[220px] md:min-h-0 bg-[#161616]"'
);


fs.writeFileSync(pPortfolio, cPortfolio);
console.log("Replaced liquid metal with CSS conic gradient successfully.");
