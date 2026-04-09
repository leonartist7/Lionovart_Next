const fs = require('fs');

function removeParticles(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Remove the PARTICLES array
  const particlesArrayRegex = /\/\/\s*Rising particles[\s\S]*?const PARTICLES = \[[\s\S]*?\] as const;\r?\n\r?\n?/g;
  content = content.replace(particlesArrayRegex, '');

  // 2. Remove the DOM elements
  // We'll use a regex that matches the wrapper div and its contents.
  const domRegexServices = /\s*\{\/\*\s*Rising particles[\s\S]*?\*\/\}\r?\n\s*<div\s*className="absolute inset-0 pointer-events-none overflow-hidden"\s*aria-hidden(?:>|\r?\n\s*>)\r?\n\s*<style>\{`[\s\S]*?`\}<\/style>\r?\n\s*\{PARTICLES\.map\(\(p, i\) => \([\s\S]*?\)\)\}\r?\n\s*<\/div>/g;
  
  content = content.replace(domRegexServices, '');

  fs.writeFileSync(filePath, content);
  console.log("Cleaned particles from", filePath);
}

removeParticles('.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx');
removeParticles('.claude/worktrees/crazy-taussig/src/components/sections/Process.tsx');
