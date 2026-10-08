const fs = require('fs');
const path = require('path');
const ts = require('../node_modules/typescript');
const source = path.join(__dirname, 'src/components/generated');
const declaration = path.join(__dirname, 'asset-types.d.ts');
fs.writeFileSync(declaration, 'declare module "*.jpg" { const src: string; export default src; }\ndeclare module "*.avif" { const src: string; export default src; }\ndeclare module "*.css" {}\n');
const dependencyRoot = path.resolve(__dirname, '../node_modules');
const options = {
  strict: true, noEmit: true, skipLibCheck: true, esModuleInterop: true, resolveJsonModule: true,
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
  baseUrl: __dirname,
  paths: { '@paper-design/shaders': [path.join(dependencyRoot, '@paper-design/shaders')], 'lucide-react': [path.join(dependencyRoot, 'lucide-react')], react: [path.join(dependencyRoot, '@types/react')], 'react/*': [path.join(dependencyRoot, '@types/react/*')], 'framer-motion': [path.join(dependencyRoot, 'framer-motion')], gsap: [path.join(dependencyRoot, 'gsap')], 'gsap/*': [path.join(dependencyRoot, 'gsap/*')] },
  types: [],
};
const program = ts.createProgram([path.join(source, 'LIONOVARTWorkProspectJourney.tsx'), path.join(source, 'work-data.ts'), declaration], options);
const errors = ts.getPreEmitDiagnostics(program);
for (const d of errors) console.log(ts.flattenDiagnosticMessageText(d.messageText, '\n'));
if (errors.length) process.exit(1);
console.log('TypeScript: no errors in the prospect Work page or its work inventory.');
