const fs = require('fs');

// 2. Modify HeroTop.tsx
const heroPath = 'src/components/sections/HeroTop.tsx';
let heroContent = fs.readFileSync(heroPath, 'utf8');

const ctaRegex = /(\{\/\*\s*CTAs[^]*?\*\/\}\s*<motion\.div[\s\S]*?<\/motion\.div>)/;
const badgesRegex = /(\{\/\*\s*Dynamic Trust Badges\s*\*\/\}\s*<DynamicTrustBadges \/>\s*\{\/\*\s*Trust Text\s*\*\/\}\s*<motion\.p[\s\S]*?<\/motion\.p>)/;
const carouselRegex = /(\{\/\*\s*3D Rotating Carousel[^]*?\*\/\}\s*<motion\.div\s+initial=\{\{\s*opacity:\s*0\s*\}\}\s+animate=\{\{\s*opacity:\s*1\s*\}\}\s+transition=\{\{\s*delay:\s*1,\s*duration:\s*1\.2\s*\}\}\s+className="relative z-10 [^"]*?"\s*>\s*<Carousel3D \/>\s*<\/motion\.div>)/;

const ctaMatch = heroContent.match(ctaRegex);
const badgesMatch = heroContent.match(badgesRegex);
const carouselMatch = heroContent.match(carouselRegex);

if (!ctaMatch || !badgesMatch || !carouselMatch) {
  console.log('Error finding sections in HeroTop.tsx');
  console.log('CTA Match:', !!ctaMatch);
  console.log('Badges Match:', !!badgesMatch);
  console.log('Carousel Match:', !!carouselMatch);
  process.exit(1);
}

// Remove badges and carousel from their current positions
heroContent = heroContent.replace(badgesMatch[0], '');
heroContent = heroContent.replace(carouselMatch[0], '');

// Redefine the carousel div with updated margins so it looks good between CTAs and Badges
const newCarousel = `
      {/* 3D Rotating Carousel - full bleed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1.2 }}
        className="relative z-10 mt-10 md:mt-16 mb-4 md:mb-12 w-full overflow-visible pointer-events-none"
      >
        <Carousel3D />
      </motion.div>
`;

// Wrap the badges in their own motion div since we broke them out of the first container
const newBadges = `
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 flex w-full max-w-[1200px] flex-col items-center gap-6 text-center"
      >
        ${badgesMatch[0]}
      </motion.div>
`;

// Insert the new carousel and badges immediately after the closing tag of the first motion.div
const afterCta = heroContent.indexOf(ctaMatch[0]) + ctaMatch[0].length;
// The next </motion.div> after the CTA block is the end of the main container
const endOfMainContainer = heroContent.indexOf('</motion.div>', afterCta) + '</motion.div>'.length;

const before = heroContent.substring(0, endOfMainContainer);
const after = heroContent.substring(endOfMainContainer);

const newHeroContent = before + '\n' + newCarousel + '\n' + newBadges + '\n' + after;

fs.writeFileSync(heroPath, newHeroContent);
console.log('✅ HeroTop.tsx updated (Reordered Marquee and Trust Badges)');
