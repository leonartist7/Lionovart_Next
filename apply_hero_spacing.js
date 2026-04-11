const fs = require('fs');

const heroPath = 'src/components/sections/HeroTop.tsx';
let heroContent = fs.readFileSync(heroPath, 'utf8');

// 1. Shrink Trust Badges
heroContent = heroContent.replace('max-w-[140px]', 'max-w-[126px]');
heroContent = heroContent.replace('max-w-[600px]', 'max-w-[540px]');

// 2. Adjust Marquee Margins (Pull up under buttons)
// Find the Carousel wrapper div
heroContent = heroContent.replace(
  /className="relative z-10 mt-10 md:mt-16 mb-4 md:mb-12 w-full overflow-visible pointer-events-none"/g,
  'className="relative z-10 mt-[5px] mb-0 md:-mb-8 w-full overflow-visible pointer-events-none"'
);

// 3. Tuck Text tightly below badges (Pull badges & text section up too)
// The badges wrapper container: 
heroContent = heroContent.replace(
  /className="relative z-20 flex w-full max-w-\[1200px\] flex-col items-center gap-6 text-center"/g,
  'className="relative z-20 flex w-full max-w-[1200px] flex-col items-center gap-2 text-center -mt-4"'
);

fs.writeFileSync(heroPath, heroContent);
console.log('✅ HeroTop.tsx successfully updated.');
