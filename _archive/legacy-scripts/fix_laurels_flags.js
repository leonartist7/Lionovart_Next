const fs = require('fs');

const heroPath = 'src/components/sections/HeroTop.tsx';
let content = fs.readFileSync(heroPath, 'utf8');

// 1. Fix Laurel Images
content = content.replace(
  /<img\s+src="\/images\/laurel\.webp"\s+alt=""\s+className="absolute left-\[2%\] bottom-\[8%\] h-\[82%\] w-\[48%\] object-contain object-left-bottom pointer-events-none"\s*\/>/g,
  '<img src="/images/laurel-L.webp" alt="" className="absolute left-[2%] bottom-[8%] h-[82%] w-[48%] object-contain object-left-bottom pointer-events-none" />'
);

content = content.replace(
  /<img\s+src="\/images\/laurel\.webp"\s+alt=""\s+className="absolute right-\[2%\] bottom-\[8%\] h-\[82%\] w-\[48%\] object-contain object-right-bottom pointer-events-none scale-x-\[-1\]"\s*\/>/g,
  '<img src="/images/laurel-R.webp" alt="" className="absolute right-[2%] bottom-[8%] h-[82%] w-[48%] object-contain object-right-bottom pointer-events-none" />'
);

// 2. Fix Flags (Replace emoji block with FlagCDN images)
const oldFlagsBlock = `<div className="flex items-center justify-center -space-x-[1cqw] text-[10cqw] leading-none drop-shadow-md">
              <span style={{ transform: "rotate(-12deg) translateY(-1cqw)" }}>🇰🇷</span>
              <span style={{ transform: "rotate(-8deg) translateY(0cqw)" }}>🇯🇵</span>
              <span style={{ transform: "rotate(-4deg) translateY(1cqw)" }}>🇮🇹</span>
              <span style={{ transform: "rotate(0deg) translateY(1.5cqw)" }}>🇨🇭</span>
              <span style={{ transform: "rotate(4deg) translateY(1.5cqw)" }}>🇫🇷</span>
              <span style={{ transform: "rotate(8deg) translateY(1cqw)" }}>🇹🇴</span>
              <span style={{ transform: "rotate(12deg) translateY(0cqw)" }}>🇬🇧</span>
              <span style={{ transform: "rotate(16deg) translateY(-1cqw)" }}>🇪🇸</span>
           </div>`;

const newFlagsBlock = `
           {/* FlagCDN Images arranged in a slight curve */}
           <div className="flex items-center justify-center -space-x-[2cqw] drop-shadow-md mt-1">
              {[
                { src: "https://flagcdn.com/w40/kr.png", rot: -12, y: -1 },
                { src: "https://flagcdn.com/w40/jp.png", rot: -8, y: 0 },
                { src: "https://flagcdn.com/w40/it.png", rot: -4, y: 1 },
                { src: "https://flagcdn.com/w40/ch.png", rot: 0, y: 1.5 },
                { src: "https://flagcdn.com/w40/fr.png", rot: 4, y: 1.5 },
                { src: "https://flagcdn.com/w40/us.png", rot: 8, y: 1 },
                { src: "https://flagcdn.com/w40/gb.png", rot: 12, y: 0 },
                { src: "https://flagcdn.com/w40/es.png", rot: 16, y: -1 }
              ].map((flag, i) => (
                 <img 
                   key={i} 
                   src={flag.src} 
                   alt="flag" 
                   className="w-[10cqw] h-[7cqw] object-cover border-[0.5cqw] border-white/20 rounded-sm"
                   style={{ transform: \`rotate(\${flag.rot}deg) translateY(\${flag.y}cqw)\` }}
                 />
              ))}
           </div>`;

content = content.replace(oldFlagsBlock, newFlagsBlock);

fs.writeFileSync(heroPath, content);
console.log('✅ Updated HeroTop.tsx with correct laurel paths and flag images');
