import {renderSVG, editingPoints, outline} from '../../src/lib/pearl-gold/engine.mjs';
import {makeRibbonGeometry} from '../../src/lib/pearl-gold/formation.mjs';

// Static material, a shared lower blend, and exact cubic formation boundaries.
export function artwork(doc, {namespace, palette, effects='vector', formation=false}) {
 let svg=renderSVG(doc,{namespace,palette,effects}), defs='', ribbons=[];
 if(formation) doc.ribbons.forEach(r=>{
  const id=namespace+'-'+r.id, points=editingPoints(r,doc.style);
  ribbons.push({id:r.id,...makeRibbonGeometry(points.a,points.b)});
  defs+='<clipPath id="'+id+'-formation" clipPathUnits="userSpaceOnUse"><path data-reveal-ribbon="'+r.id+'" d="'+outline(r,doc.style)+'"/></clipPath>';
  svg=svg.replaceAll('data-ribbon="'+r.id+'" clip-path="url(#'+id+'-clip)"','data-ribbon="'+r.id+'" clip-path="url(#'+id+'-formation)"');
  svg=svg.replace(new RegExp('<clipPath id="'+id+'-receiver">([\\s\\S]*?)</clipPath>'),(_,paths)=>{
   let i=0;return '<clipPath id="'+id+'-receiver">'+paths.replace(/<path /g,()=>'<path data-receiver-ribbon="'+doc.ribbons[i++].id+'" ')+'</clipPath>';
  });
 });
 const {width,height}=doc.canvas;
 defs+='<linearGradient id="'+namespace+'-blend" x1="0" y1="'+height*.74+'" x2="0" y2="'+height*.98+'" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset=".3" stop-color="white" stop-opacity=".85"/><stop offset=".7" stop-color="white" stop-opacity=".25"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><mask id="'+namespace+'-lower" maskUnits="userSpaceOnUse" x="-100" y="-100" width="'+(width+200)+'" height="'+(height+300)+'" style="mask-type:alpha"><rect x="-100" y="-100" width="'+(width+200)+'" height="'+(height+300)+'" fill="url(#'+namespace+'-blend)"/></mask>';
 svg=svg.replace('</defs>',defs+'</defs><g mask="url(#'+namespace+'-lower)">').replace('</svg>','</g></svg>');
 return {svg,ribbons,width,height};
}
