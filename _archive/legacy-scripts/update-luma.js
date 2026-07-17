const fs = require('fs');
const pLuma = '.claude/worktrees/crazy-taussig/src/components/sections/LumaShowcase.tsx';
let cLuma = fs.readFileSync(pLuma, 'utf-8');

cLuma = cLuma.replace(
  'import { motion, AnimatePresence } from "framer-motion";',
  'import { motion, AnimatePresence, useInView } from "framer-motion";'
);

// We'll add `const isInView = useInView(sectionRef);` inside `export default function LumaShowcase() {`
cLuma = cLuma.replace(
  /export default function LumaShowcase\(\) \{[\s\S]*?const sectionRef      = useRef<HTMLElement>\(null\);/,
  `export default function LumaShowcase() {

  /* ── Refs ─────────────────────────────────────────────────────────── */
  const sectionRef      = useRef<HTMLElement>(null);
  const isInView        = useInView(sectionRef);`
);

// Now update the idle interval
cLuma = cLuma.replace(
  /useEffect\(\(\) => \{\n\s*if \(\!isScrollComplete || isAutoPlaying\) return;\n\s*const id = setInterval\(\(\) => \{/,
  `useEffect(() => {
    if (!isInView || !isScrollComplete || isAutoPlaying) return;
    const id = setInterval(() => {`
);

// Now update the rAF loop
cLuma = cLuma.replace(
  /useEffect\(\(\) => \{\n\s*if \(\!isAutoPlaying \|\| \!isScrollComplete\) \{/,
  `useEffect(() => {
    if (!isInView || !isAutoPlaying || !isScrollComplete) {`
);

fs.writeFileSync(pLuma, cLuma);
console.log("Updated LumaShowcase.tsx");
