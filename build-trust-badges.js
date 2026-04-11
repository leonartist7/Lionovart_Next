const fs = require('fs');

const pHeroTop = '.claude/worktrees/crazy-taussig/src/components/sections/HeroTop.tsx';
let cHeroTop = fs.readFileSync(pHeroTop, 'utf-8');

// We need to inject the TrustBadge component before `export default function HeroTop`
const trustBadgeComponent = `
/* ─── Trust Badge Components ────────────────────────────────────── */
function TrustBadge({ 
  children, 
  title, 
  delay = 0 
}: { 
  children: React.ReactNode, 
  title: React.ReactNode, 
  delay?: number 
}) {
  return (
    <motion.div 
      className="relative flex flex-col items-center justify-center aspect-square @container w-full max-w-[140px]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
       {/* Left Laurel (Replace src with your laurel.webp) */}
       <img 
         src="/laurel.webp" 
         alt="" 
         className="absolute left-0 top-0 h-full w-[35%] object-contain object-left pointer-events-none opacity-50" 
         style={{ filter: "drop-shadow(0 2px 4px rgba(229,25,42,0.3))" }}
       />
       {/* Right Laurel (Flipped) */}
       <img 
         src="/laurel.webp" 
         alt="" 
         className="absolute right-0 top-0 h-full w-[35%] object-contain object-right pointer-events-none scale-x-[-1] opacity-50" 
         style={{ filter: "drop-shadow(0 2px 4px rgba(229,25,42,0.3))" }}
       />
       
       {/* Content Container (dynamically scaled using container query units) */}
       <div className="absolute inset-0 flex flex-col items-center justify-center px-[15%] text-center pt-[5cqw]">
          {children}
          <span 
            className="text-brand-red font-bold leading-[1.1] mt-[6cqw] uppercase" 
            style={{ fontSize: "14cqw", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
          >
            {title}
          </span>
       </div>
    </motion.div>
  );
}

function DynamicTrustBadges() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  
  const brandsCount = useCountUp(50, 1600, inView);
  const countriesCount = useCountUp(10, 1400, inView);

  return (
    <div ref={ref} className="flex justify-center items-center gap-[2vw] md:gap-8 w-full max-w-[600px] mx-auto mt-4 md:mt-5">
      {/* Badge 1: Brands */}
      <TrustBadge title={<>Brands<br/>elevated</>} delay={0.1}>
         <div className="flex items-center text-brand-red font-black leading-none tracking-tighter" style={{ fontSize: "38cqw" }}>
            <span style={{ fontSize: "28cqw", marginRight: "1cqw" }}>+</span>
            {brandsCount}
         </div>
      </TrustBadge>
      
      {/* Badge 2: Customer Experience */}
      <TrustBadge title={<>Customer<br/>Experience</>} delay={0.2}>
         {/* Animated SVG Stars */}
         <div className="flex items-center justify-center gap-[2cqw] mb-[6cqw]">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.svg 
                key={i} 
                viewBox="0 0 24 24" 
                fill="#e5192a" 
                className="w-[14cqw] h-[14cqw]"
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + (i * 0.1), type: "spring", stiffness: 200 }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </motion.svg>
            ))}
         </div>
         {/* Avatars Placeholder */}
         <div className="flex items-center justify-center -space-x-[4cqw] mb-[2cqw]">
            {[1, 2, 3, 4, 5].map((i) => (
               <motion.div 
                 key={i} 
                 className="w-[18cqw] h-[18cqw] rounded-full border-[1.5cqw] border-brand-red bg-white/20 overflow-hidden relative"
                 initial={{ opacity: 0, x: -10 }}
                 animate={inView ? { opacity: 1, x: 0 } : {}}
                 transition={{ delay: 0.6 + (i * 0.05) }}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
               </motion.div>
            ))}
         </div>
      </TrustBadge>

      {/* Badge 3: Countries */}
      <TrustBadge title="Countries" delay={0.3}>
         <div className="flex items-center text-brand-red font-black leading-none tracking-tighter" style={{ fontSize: "38cqw" }}>
            <span style={{ fontSize: "28cqw", marginRight: "1cqw" }}>+</span>
            {countriesCount}
         </div>
         {/* Flags Placeholder */}
         <div className="flex items-center justify-center -space-x-[2cqw] mt-[4cqw]">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
               <motion.div 
                 key={i} 
                 className="w-[10cqw] h-[7cqw] border-[0.5cqw] border-white/50 bg-white/20 overflow-hidden relative"
                 style={{ transform: \`rotate(\${(i - 4) * 4}deg)\` }}
                 initial={{ opacity: 0, y: 10 }}
                 animate={inView ? { opacity: 1, y: 0 } : {}}
                 transition={{ delay: 0.8 + (i * 0.05) }}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
               </motion.div>
            ))}
         </div>
      </TrustBadge>
    </div>
  )
}
`;

const insertionPoint = '/* ─── Main Component ────────────────────────────────────────────── */';
cHeroTop = cHeroTop.replace(insertionPoint, trustBadgeComponent + '\n' + insertionPoint);

// Replace the static Image with the Dynamic component
const oldImageRegex = /\{\/\* Trust Badges \*\/\}\r?\n\s*<motion\.div[\s\S]*?priority\r?\n\s*\/>\r?\n\s*<\/motion\.div>/;
const newComponent = `{/* Dynamic Trust Badges */}
        <DynamicTrustBadges />`;

cHeroTop = cHeroTop.replace(oldImageRegex, newComponent);

fs.writeFileSync(pHeroTop, cHeroTop);
console.log("Trust badges demo implemented.");
