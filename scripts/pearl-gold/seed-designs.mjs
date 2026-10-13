import fs from 'node:fs';
import {boundaries,defaultStyle,validate} from '../../src/lib/pearl-gold/engine.mjs';
const ribbon=(id,material,center,widths,phase)=>({id,name:id,...boundaries(center,widths),material,phase,depth:0});
// Open arcs flare away from the content. The lower tips stay in the side gutters;
// no ribbon crosses the center, trust badges, or the bottom of the card group.
const desktop={version:2,name:'hero-desktop',canvas:{width:1400,height:900},mirror:true,style:{...defaultStyle,texture:0,depth:2,twist:.3,trim:.032},ribbons:[
ribbon('obsidian','dark',[[12,222],[38,270],[77,380],[107,525],[118,675],[123,1010]],[0,8,18,22,12,10],1.2),
ribbon('outer-pearl','pearl',[[12,210],[50,260],[93,368],[121,515],[130,670],[128,1010]],[0,9,22,25,16,12],.6)
]};
const mobile={version:2,name:'hero-mobile',canvas:{width:420,height:1000},mirror:true,style:{...defaultStyle,texture:0,depth:0,twist:.25,trim:.045},ribbons:[
ribbon('outer-pearl','pearl',[[0,200],[2,270],[6,400],[9,560],[10,730],[8,1100]],[0,2,4,5,3,3],.6)
]};
const tablet={...mobile,name:'hero-tablet',canvas:{width:840,height:1000},ribbons:[
ribbon('outer-pearl','pearl',[[2,210],[12,270],[24,400],[32,560],[35,730],[32,1100]],[0,4,8,10,6,6],.6)
]};
for(const [name,doc] of Object.entries({desktop,tablet,mobile})){validate(doc);fs.writeFileSync('src/lib/pearl-gold/designs/hero-'+name+'.json',JSON.stringify(doc,null,2));}
