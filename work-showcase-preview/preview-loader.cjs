const fs = require('fs');
const path = require('path');
const ts = require('../node_modules/typescript');
module.exports = function (source) {
  if (this.resourcePath.endsWith('.css')) {
    return `const css=${JSON.stringify(source)};const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);`;
  }
  const mediaRoot = path.resolve(__dirname, 'assets/legacy');
  if (this.resourcePath.endsWith('work-data.ts')) {
    const legacyPosters = ['stormlikes','lsi-asia-25','fundonion','oma','rise','justa','coinly','op','rakbank','blastup'];
    source = source.replace(/const poster(\d+) = "[^"]+";/g, (_, i) => `const poster${i} = ${JSON.stringify('data:image/jpeg;base64,' + fs.readFileSync(path.join(mediaRoot, legacyPosters[Number(i)] + '.jpg')).toString('base64'))};`);
  }
  if (this.resourcePath.endsWith('LIONOVARTWorkProspectJourney.tsx')) {
    source = source.replace(/const portrait = "[^"]+";/, 'const portrait = ' + JSON.stringify('data:image/avif;base64,' + fs.readFileSync(path.join(mediaRoot, 'leonardo.avif')).toString('base64')) + ';');
  }
  return ts.transpileModule(source, {
    fileName: this.resourcePath,
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }
  }).outputText;
};
