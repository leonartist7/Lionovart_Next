import fs from 'node:fs';
import {boundaries, defaultStyle, validate} from '../../src/lib/pearl-gold/engine.mjs';

import {artwork} from './artwork.mjs';

// Intentional knots, paired continuous cubic boundaries; no image input.
const ribbon = (id, material, center, widths, phase) => ({
  id, name: id, ...boundaries(center, widths), material, phase, depth: 0
});
const desktop = {
  version: 2, name: 'closing-desktop', canvas: {width: 1400, height: 800}, mirror: true,
  style: {...defaultStyle, texture: .025, depth: 3, twist: .68, trim: .035, softness: .85},
  ribbons: [
    ribbon('gold-underfold', 'gold', [[-65,228],[67,266],[145,382],[202,500],[342,600],[487,659],[622,920]], [18,24,27,22,18,12,10], 1.2),
    ribbon('pearl-sweep', 'pearl', [[-65,176],[68,207],[155,325],[168,438],[321,548],[475,620],[650,930]], [40,60,49,45,32,35,22], .6),
    ribbon('pearl-return', 'pearl', [[-26,70],[95,132],[176,266],[115,402],[274,533],[483,679],[620,925]], [0,19,32,35,35,22,16], 2.3),
    ribbon('gold-filament', 'gold', [[15,30],[110,105],[213,250],[159,410],[257,546],[469,650],[636,940]], [0,1.8,2,1.8,1.3,1,1], 1)
  ]
};
// A dedicated portrait composition keeps every face outside the text corridor.
const mobile = {
  ...desktop, name: 'closing-mobile', canvas: {width: 420, height: 800},
  style: {...desktop.style, texture: 0, depth: 1, trim: .045},
  ribbons: [
    ribbon('gold-underfold', 'gold', [[-16,150],[2,276],[8,412],[15,573],[51,688],[156,920]], [0,5,6,7,5,4], 1.2),
    ribbon('pearl-sweep', 'pearl', [[-15,125],[6,260],[17,421],[24,584],[64,700],[174,930]], [0,11,14,13,10,7], .6),
    ribbon('gold-filament', 'gold', [[0,102],[13,246],[22,407],[30,584],[69,700],[164,940]], [0,.8,1,.9,.7,.6], 1)
  ]
};
const palette = JSON.parse(fs.readFileSync('src/lib/pearl-gold/material-recipe.json', 'utf8')).materials;
const bundle={};
for (const doc of [desktop, mobile]) {
  validate(doc);
  fs.writeFileSync('src/lib/pearl-gold/designs/'+doc.name+'.json', JSON.stringify(doc, null, 2)+'\n');
  fs.writeFileSync('public/ornaments/'+doc.name+'.svg', artwork(doc, {namespace: doc.name, palette, effects: 'satin'}).svg);
  // Each edge scales to the available CTA height without cropping the tips.
  const side = {...doc, mirror: false, canvas: {...doc.canvas, width: doc.canvas.width / 2}};
  fs.writeFileSync('public/ornaments/'+doc.name+'-side.svg', artwork(side, {namespace: doc.name+'-side', palette, effects: 'satin'}).svg);
  const profile=doc===desktop?'desktop':'mobile';
  bundle[profile]=artwork(side,{namespace:'closingINSTANCE',palette,effects:'satin',formation:true});
  bundle[profile].svg=bundle[profile].svg.replace('role="img"','aria-hidden="true" focusable="false"');
}
fs.writeFileSync('src/lib/pearl-gold/closing.generated.json',JSON.stringify(bundle));
console.log('Closing CTA: editable desktop/mobile designs and standalone vector exports.');
