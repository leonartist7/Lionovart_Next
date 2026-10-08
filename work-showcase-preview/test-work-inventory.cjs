const fs=require('fs');const ts=require('../node_modules/typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,resolveJsonModule:true}}).outputText,file);
const data=require('./src/components/generated/work-data.ts');
const {matchesWork,allWork}=require('./src/components/generated/work-filters.ts');
module.exports={...data,allWork,matchesWork,count:(selection={},limit=12)=>Math.min(limit,data.publishedWorks.filter(work=>matchesWork(work,{...allWork,...selection})).length)};
