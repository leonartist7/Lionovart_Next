const fs = require('fs');

function updateBackground(filePath, searchRegex, replacement) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(searchRegex, replacement);
  fs.writeFileSync(filePath, content);
  console.log("Updated background in", filePath);
}

// 1. Services.tsx
updateBackground(
  '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx',
  /className="relative bg-white pt-\[100px\] pb-\[100px\] md:pt-\[120px\] md:pb-\[140px\]"/,
  'className="relative bg-[#eceff3] pt-[100px] pb-[100px] md:pt-[120px] md:pb-[140px]"'
);

// 2. Comparison.tsx (Why Lionovart)
updateBackground(
  '.claude/worktrees/crazy-taussig/src/components/sections/Comparison.tsx',
  /className="bg-\[#F5F0EB\] py-\[100px\] md:py-\[140px\] px-4 md:px-8"/,
  'className="bg-[#eceff3] py-[100px] md:py-[140px] px-4 md:px-8"'
);

// 3. Portfolio.tsx (Selected Work)
// Note: It might have an id="work" before the className
updateBackground(
  '.claude/worktrees/crazy-taussig/src/components/sections/Portfolio.tsx',
  /className="bg-\[#F5F0EB\] pt-\[40px\] pb-\[80px\] md:pt-\[60px\] md:pb-\[120px\]"/,
  'className="bg-[#eceff3] pt-[40px] pb-[80px] md:pt-[60px] md:pb-[120px]"'
);
