const fs = require('fs');

const heroPath = 'src/components/sections/HeroTop.tsx';
let content = fs.readFileSync(heroPath, 'utf8');

// Update Left Laurel
content = content.replace(
  /<img src="\/images\/laurel-L\.webp" alt="" className="absolute left-\[2%\] bottom-\[8%\] h-\[82%\] w-\[48%\] object-contain object-left-bottom pointer-events-none" \/>/g,
  '<img src="/images/laurel-L.webp" alt="" className="absolute left-0 top-0 h-full w-[40%] object-contain object-left pointer-events-none drop-shadow-md" />'
);

// Update Right Laurel
content = content.replace(
  /<img src="\/images\/laurel-R\.webp" alt="" className="absolute right-\[2%\] bottom-\[8%\] h-\[82%\] w-\[48%\] object-contain object-right-bottom pointer-events-none" \/>/g,
  '<img src="/images/laurel-R.webp" alt="" className="absolute right-0 top-0 h-full w-[40%] object-contain object-right pointer-events-none drop-shadow-md" />'
);

// Update Content Container padding to keep text safely away from the laurels
content = content.replace(
  /className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-\[10%\] pt-\[8%\] pb-\[5%\]"/g,
  'className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-[18%] py-[5%]"'
);

// Specifically ensure Badge 2 (Customer Experience) avatars fit perfectly
// by slightly tweaking their container if needed (from 20cqw to 18cqw)
content = content.replace(
  /className="w-\[20cqw\] h-\[20cqw\] rounded-full border-\[1\.5cqw\] border-\[#e5192a\] overflow-hidden relative"/g,
  'className="w-[18cqw] h-[18cqw] rounded-full border-[1.5cqw] border-[#e5192a] overflow-hidden relative shadow-sm"'
);

fs.writeFileSync(heroPath, content);
console.log('✅ Updated laurel positioning to sit purely on the sides.');
