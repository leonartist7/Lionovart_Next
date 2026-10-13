import fs from 'node:fs';
import {artwork} from './artwork.mjs';
const base='src/lib/pearl-gold/',palette=JSON.parse(fs.readFileSync(base+'material-recipe.json','utf8'));
const bundle={};
for(const profile of ['desktop','tablet','mobile']){
 const doc=JSON.parse(fs.readFileSync(base+'designs/hero-'+profile+'.json','utf8')),ns='ribbonINSTANCE-'+profile;
 const generated=artwork(doc,{namespace:ns,palette:palette.materials,formation:true});
 generated.svg=generated.svg.replace('role="img"','aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax '+(profile==='desktop'?'slice':'meet')+'"');
 bundle[profile]=generated;
 fs.writeFileSync('public/ornaments/hero-'+profile+'.svg',artwork(doc,{namespace:'hero-'+profile,palette:palette.materials}).svg);
}
fs.writeFileSync(base+'hero.generated.json',JSON.stringify(bundle));
console.log('Generated desktop, portrait-tablet and mobile geometry; standalone SVG exports.');
