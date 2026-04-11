const fs = require('fs');

const heroPath = 'src/components/sections/HeroTop.tsx';
let content = fs.readFileSync(heroPath, 'utf8');

const startIndex = content.indexOf('function TrustBadge(');
const endIndex = content.indexOf('export default function HeroTop()');

if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find boundaries');
    process.exit(1);
}

const before = content.substring(0, startIndex);
// Remove the specific comment if it's there
const afterRaw = content.substring(endIndex);
const mainCommentIndex = afterRaw.lastIndexOf('/* ', 50); // It's usually right before
let after = afterRaw;
if(mainCommentIndex > -1 && mainCommentIndex < 50) {
    // it's right before export default function
}

const newCode = `function TrustBadge({ 
  children, 
  title, 
  delay = 0 
}: { 
  children: React.ReactNode, 
  title?: React.ReactNode, 
  delay?: number 
}) {
  return (
    <motion.div 
      className="relative flex items-center justify-center aspect-square @container w-full max-w-[126px]"
      initial={{ opacity: 1, scale: 1 }}
    >
       {/* Left Laurel */}
       <img 
         src="/images/laurel.webp" 
         alt="" 
         className="absolute left-[2%] bottom-[8%] h-[82%] w-[48%] object-contain object-left-bottom pointer-events-none" 
       />
       {/* Right Laurel (Flipped) */}
       <img 
         src="/images/laurel.webp" 
         alt="" 
         className="absolute right-[2%] bottom-[8%] h-[82%] w-[48%] object-contain object-right-bottom pointer-events-none scale-x-[-1]" 
       />
       
       {/* Content Container */}
       <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-[10%] pt-[8%] pb-[5%]">
          {children}
          {title && (
            <span 
              className="text-[#e5192a] font-bold leading-[1.15] mt-[3cqw]" 
              style={{ fontSize: "13cqw" }}
            >
              {title}
            </span>
          )}
       </div>
    </motion.div>
  );
}

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80"
];

function DynamicTrustBadges() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  
  const brandsCount = useCountUp(50, 1600, inView);
  const countriesCount = useCountUp(10, 1400, inView);

  return (
    <div ref={ref} className="flex justify-center items-center gap-[4vw] md:gap-10 w-full max-w-[540px] mx-auto mt-4 md:mt-5">
      
      {/* Badge 1: Brands */}
      <TrustBadge title={<>Brands<br/>elevated</>} delay={0.1}>
         <div className="flex items-center text-[#e5192a] font-black leading-none tracking-tighter" style={{ fontSize: "40cqw" }}>
            <span style={{ fontSize: "32cqw", marginRight: "1cqw" }}>+</span>
            {brandsCount}
         </div>
      </TrustBadge>
      
      {/* Badge 2: Customer Experience */}
      <TrustBadge title={<>Customer<br/>Experience</>} delay={0.2}>
         <div className="flex flex-col items-center gap-[3cqw] mb-[2cqw] mt-[6cqw]">
           {/* 5 Stars */}
           <div className="flex items-center justify-center gap-[1.5cqw]">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} viewBox="0 0 24 24" fill="#e5192a" className="w-[12cqw] h-[12cqw]">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
           </div>
           
           {/* 5 Avatars */}
           <div className="flex items-center justify-center -space-x-[3cqw]">
              {AVATARS.map((src, i) => (
                 <div 
                   key={i} 
                   className="w-[20cqw] h-[20cqw] rounded-full border-[1.5cqw] border-[#e5192a] overflow-hidden relative"
                 >
                   <img src={src} alt="Client" className="w-full h-full object-cover" />
                 </div>
              ))}
           </div>
         </div>
      </TrustBadge>

      {/* Badge 3: Countries */}
      <TrustBadge delay={0.3}>
         <div className="flex flex-col items-center">
           <div className="flex items-center text-[#e5192a] font-black leading-none tracking-tighter mb-[2cqw]" style={{ fontSize: "40cqw" }}>
              <span style={{ fontSize: "32cqw", marginRight: "1cqw" }}>+</span>
              {countriesCount}
           </div>
           <span className="text-[#e5192a] font-bold leading-[1.15] mb-[4cqw]" style={{ fontSize: "13cqw" }}>
              Countries
           </span>
           
           {/* Flag Emojis arranged in a slight curve */}
           <div className="flex items-center justify-center -space-x-[1cqw] text-[10cqw] leading-none drop-shadow-md">
              <span style={{ transform: "rotate(-12deg) translateY(-1cqw)" }}>🇰🇷</span>
              <span style={{ transform: "rotate(-8deg) translateY(0cqw)" }}>🇯🇵</span>
              <span style={{ transform: "rotate(-4deg) translateY(1cqw)" }}>🇮🇹</span>
              <span style={{ transform: "rotate(0deg) translateY(1.5cqw)" }}>🇨🇭</span>
              <span style={{ transform: "rotate(4deg) translateY(1.5cqw)" }}>🇫🇷</span>
              <span style={{ transform: "rotate(8deg) translateY(1cqw)" }}>🇹🇴</span>
              <span style={{ transform: "rotate(12deg) translateY(0cqw)" }}>🇬🇧</span>
              <span style={{ transform: "rotate(16deg) translateY(-1cqw)" }}>🇪🇸</span>
           </div>
         </div>
      </TrustBadge>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */
`;

content = before + newCode + afterRaw;
fs.writeFileSync(heroPath, content);
console.log('✅ Updated badges visual layout');
