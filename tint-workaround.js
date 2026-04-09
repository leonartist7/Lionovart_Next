const fs = require('fs');

const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

// 1. Tint the inner glass panel
cServices = cServices.replace(
  'bg-white/85',
  'bg-[#f2f4f7]/95' // Light gray tint to make white shadows pop
);

// 2. Update Accordion Active State to match the base color and boost neumorphic shadows
const accordionRegex = /\$\{activeId === service\.id \? 'bg-\[#fcfdff\] shadow-\[0_6px_20px_rgba\(0,0,0,0\.04\),0_-6px_20px_rgba\(255,255,255,0\.9\)\] relative z-10 -mx-4 px-4 md:-mx-6 md:px-6' : '-mx-4 px-4 md:-mx-6 md:px-6'\}/;
const newAccordion = "${activeId === service.id ? 'bg-[#f2f4f7] shadow-[8px_8px_20px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,1)] border-t border-l border-white/60 relative z-10 -mx-4 px-4 md:-mx-6 md:px-6' : '-mx-4 px-4 md:-mx-6 md:px-6'}";
cServices = cServices.replace(accordionRegex, newAccordion);

// 3. Update the Image Bezel to match the exact base color and massively boost the shadows
const bezelRegex = /<div className="relative rounded-\[24px\] aspect-\[3\/4\] p-3 md:p-4 bg-\[#f0f3f8\] shadow-\[12px_12px_24px_rgba\(0,0,0,0\.12\),-12px_-12px_24px_rgba\(255,255,255,1\)\]">/;
const newBezel = '<div className="relative rounded-[24px] aspect-[3/4] p-3 md:p-4 bg-[#f2f4f7] border border-white/80 shadow-[16px_16px_36px_rgba(0,0,0,0.12),-16px_-16px_36px_rgba(255,255,255,1)]">';
cServices = cServices.replace(bezelRegex, newBezel);

// Also add a deeper inset shadow to the image wrapper so the screen looks deeply embedded
const imageWrapperRegex = /<div className="relative w-full h-full overflow-hidden rounded-\[16px\] shadow-\[inset_4px_4px_10px_rgba\(0,0,0,0\.06\),inset_-4px_-4px_10px_rgba\(255,255,255,0\.7\)\]">/;
const newImageWrapper = '<div className="relative w-full h-full overflow-hidden rounded-[16px] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.12),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]">';
cServices = cServices.replace(imageWrapperRegex, newImageWrapper);

fs.writeFileSync(pServices, cServices);
console.log("Applied gray tint workaround for white shadows.");
