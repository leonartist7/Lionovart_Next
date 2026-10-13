// Continuous cubic surfaces. Geometry, material palette and lighting are independent.
// No image input. No polygon patches. Sampling below is only for validation.
export const defaultStyle={width:1,taper:1,twist:.48,trim:.024,light:-.45,softness:1,depth:6,texture:.08};
export const materials={
 pearl:{base:['#8e7960','#e8d7bb','#fff7e7','#99836b','#e9d6b8','#fff9ef','#a28c70'],reflection:'#fffdf6',shade:'#695640',strength:.55},
 dark:{base:['#090908','#302b23','#0b0c0b','#4a4031','#181714','#080907'],reflection:'#e5d4b6',shade:'#000000',strength:.17},
 gold:{base:['#3f260d','#a66b26','#f4cb83','#fff4d4','#b7823f','#503012'],reflection:'#fff8df',shade:'#603814',strength:.35,edge:['#553310','#d7a052','#fff0bd','#a9702c','#5d3814','#e6b663','#fff9de','#b37630','#42280f'],bevel:['#c4a16b','#ffe6a5','#fffefa','#edd2a0','#ba9155','#fff5d7','#fffefa','#e5c18a','#a47b42']}
};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const f=v=>Number(v.toFixed(5)),P=p=>p.map(f).join(' '),mix=(a,b,t)=>a.map((v,j)=>v+(b[j]-v)*t);
export function boundaries(center,widths){const a=[],b=[];center.forEach((p,i)=>{const prev=center[Math.max(0,i-1)],next=center[Math.min(center.length-1,i+1)],dx=next[0]-prev[0],dy=next[1]-prev[1],len=Math.hypot(dx,dy)||1,n=[-dy/len,dx/len];a.push([p[0]+n[0]*widths[i]/2,p[1]+n[1]*widths[i]/2]);b.push([p[0]-n[0]*widths[i]/2,p[1]-n[1]*widths[i]/2]);});return {a,b};}
function ribbon(id,name,center,widths,material='pearl',phase=0){return {id,name,...boundaries(center,widths),material,phase,bank:0,depth:0};}
export function preset(name='study'){
 let ribbons=[],mirror=false;
 if(name==='study')ribbons=[
  ribbon('dark','01 · Obsidian underfold',[[140,545],[365,555],[615,380],[865,245],[1110,286],[1280,444]],[0,65,88,82,50,0],'dark',1.2),
  ribbon('pearl','02 · Pearl crossing',[[115,244],[338,255],[580,404],[840,528],[1090,493],[1285,323]],[0,76,116,112,61,0],'pearl',.2)
 ];
 else if(name==='frame'){
  mirror=true;ribbons=[
   ribbon('dark','Obsidian inner fold',[[110,113],[150,286],[118,463],[268,594],[476,650],[668,722]],[0,28,61,67,40,0],'dark',1.2),
   ribbon('pearl','Pearl outer fold',[[102,100],[190,260],[166,390],[189,515],[368,625],[668,722]],[0,42,62,43,31,0],'pearl',.6),
   ribbon('sweep','Crossing pearl sweep',[[125,180],[125,380],[148,508],[342,595],[513,681],[668,722]],[0,24,60,42,39,0],'pearl',2.3),
   ribbon('accent','Separate gold filament',[[129,51],[233,267],[198,427],[375,594],[657,719]],[0,2.9,2.2,1.8,0],'gold',1)
  ];
 }else if(name==='wave')ribbons=[
  ribbon('dark','Dark wave',[[-80,345],[245,435],[581,319],[960,427],[1480,348]],[22,52,70,76,30],'dark',1),
  ribbon('pearl','Pearl wave',[[-80,377],[245,462],[580,379],[960,482],[1480,398]],[38,63,80,67,30],'pearl',.2)
 ];
 else if(name==='petal')ribbons=[
  ribbon('dark','Dark petal',[[298,660],[307,409],[637,209],[908,337],[1100,658]],[0,78,92,55,0],'dark',.6),
  ribbon('pearl','Rising pearl',[[291,665],[455,498],[733,362],[791,183],[637,103]],[0,75,86,45,0],'pearl',2.4),
  ribbon('sweep','Returning fold',[[294,665],[589,656],[878,535],[1026,306],[1100,137]],[0,65,71,39,0],'pearl',.2),
  ribbon('accent','Gold flourish',[[299,665],[577,682],[952,541],[1091,291],[1098,109]],[0,2,3,1.7,0],'gold',.9)
 ];else throw Error('Unknown composition.');
 return {version:2,name,canvas:{width:1400,height:800},mirror,style:{...defaultStyle},ribbons};
}
// Knot interpolation produces one cubic per intentional curve span, with matching
// incoming/outgoing tangents. Interior surface curves use the same basis as edges.
function prepared(r,s){const a=[],b=[];r.a.forEach((p,i)=>{let t=i/(r.a.length-1),c=mix(p,r.b[i],.5),bank=s.twist*Math.sin(t*Math.PI*2+r.phase),taper=Math.pow(Math.max(.12,Math.sin(Math.PI*t)),(s.taper-1)*.42),scale=s.width*(.92+.08*Math.cos(bank))*taper;a.push(mix(c,p,scale));b.push(mix(c,r.b[i],scale));});return {a,b};}
function cubics(points){return points.slice(0,-1).map((p,i)=>{let prev=points[Math.max(0,i-1)],next=points[i+1],after=points[Math.min(points.length-1,i+2)];return [p,p.map((v,j)=>v+(next[j]-prev[j])/6),next.map((v,j)=>v-(after[j]-p[j])/6),next];});}
function pathC(curves,move=true){return (move?'M'+P(curves[0][0]):'')+curves.map(c=>'C'+c.slice(1).map(P).join(' ')).join('');}
function reverse(curves){return [...curves].reverse().map(c=>[...c].reverse());}
function closeCurves(a,b){let end=a.at(-1)[3],bend=b.at(-1)[3],start=a[0][0],bstart=b[0][0];return pathC(a)+'C'+P(end)+' '+P(bend)+' '+P(bend)+pathC(reverse(b),false)+'C'+P(bstart)+' '+P(start)+' '+P(start)+'Z';}
function lineAt(g,v){return g.a.map((p,i)=>mix(p,g.b[i],typeof v==='function'?v(i/(g.a.length-1),i):v));}
function band(g,va,vb){return closeCurves(cubics(lineAt(g,va)),cubics(lineAt(g,vb)));}
function curveAt(g,v){return pathC(cubics(lineAt(g,v)));}
function evaluate(c,t){let u=1-t;return c[0].map((_,j)=>u*u*u*c[0][j]+3*u*u*t*c[1][j]+3*u*t*t*c[2][j]+t*t*t*c[3][j]);}
export function section(r,t,s){let g=prepared(r,s),ac=cubics(g.a),bc=cubics(g.b),n=ac.length,x=clamp(t)*n,i=Math.min(n-1,Math.floor(x)),a=evaluate(ac[i],x-i),b=evaluate(bc[i],x-i);return {a,b,c:mix(a,b,.5)};}
export function outline(r,s){return band(prepared(r,s),0,1);}
export function boundaryCurve(r,s,edge){return pathC(cubics(prepared(r,s)[edge]));}
export function editingPoints(r,s){return prepared(r,s);}
export function moveBoundaryPoint(r,s,edge,i,point){
 const other=edge==='a'?'b':'a';
 if((i===0||i===r.a.length-1)&&Math.hypot(r.a[i][0]-r.b[i][0],r.a[i][1]-r.b[i][1])<.001){r.a[i]=[...point];r.b[i]=[...point];return;}
 const t=i/(r.a.length-1),bank=s.twist*Math.sin(t*Math.PI*2+r.phase),scale=s.width*(.92+.08*Math.cos(bank))*Math.pow(Math.max(.12,Math.sin(Math.PI*t)),(s.taper-1)*.42);
 r[edge][i]=point.map((v,j)=>(2*v-(1-scale)*r[other][i][j])/(1+scale));
}
export function migrate(input){let doc=structuredClone(input);if(doc.version===1){doc.version=2;doc.style={...defaultStyle,...doc.style};doc.migration='Approximate import from the patch renderer; cubic geometry and the material recipe have changed.';}return doc;}
function crosses(a,b,c,d){let turn=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);return turn(a,b,c)*turn(a,b,d)<-1e-7&&turn(c,d,a)*turn(c,d,b)<-1e-7;}
export function validate(doc){
 if(doc.version!==2||!Array.isArray(doc.ribbons)||!doc.ribbons.length||doc.ribbons.length>12)throw Error('Use a version 2 design with 1–12 ribbons.');
 if(!Number.isFinite(doc.canvas?.width)||!Number.isFinite(doc.canvas?.height)||doc.canvas.width<100||doc.canvas.height<100||doc.canvas.width>8000||doc.canvas.height>8000)throw Error('Canvas dimensions must be 100–8000.');
 const ranges={width:[.3,2],taper:[.3,2],twist:[0,1.3],trim:[.005,.08],light:[-3.15,3.15],softness:[.4,2],depth:[0,25],texture:[0,.5]};
 for(let [k,[lo,hi]] of Object.entries(ranges))if(!Number.isFinite(doc.style?.[k])||doc.style[k]<lo||doc.style[k]>hi)throw Error('Unsupported setting: '+k);
 const ids=new Set();for(let r of doc.ribbons){
  if(!/^[a-z0-9-]{1,40}$/.test(r.id)||ids.has(r.id))throw Error('Ribbon identifiers must be unique lowercase names.');ids.add(r.id);
  if(!['pearl','dark','gold'].includes(r.material)||!Number.isFinite(r.phase))throw Error('Invalid ribbon material or reflection phase.');
  if(r.depth!==undefined&&(!Number.isFinite(r.depth)||r.depth<0||r.depth>25))throw Error('Ribbon shadow separation must be between 0 and 25.');
  for(let pts of [r.a,r.b])if(!Array.isArray(pts)||pts.length<3||pts.length>20||pts.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v)||Math.abs(v)>10000)))throw Error('Each boundary needs 3–20 finite points.');
  if(r.a.length!==r.b.length)throw Error('The two boundaries need matching point counts.');
  const g=prepared(r,doc.style),ac=cubics(g.a),bc=cubics(g.b),a=[],b=[];let prev;
  for(let i=0;i<=96;i++){let x=i/96*ac.length,k=Math.min(ac.length-1,Math.floor(x)),pa=evaluate(ac[k],x-k),pb=evaluate(bc[k],x-k);a.push(pa);b.push(pb);let d=[pb[0]-pa[0],pb[1]-pa[1]];if(i>0&&i<96){if(Math.hypot(...d)<.001)throw Error('This ribbon collapses inside its face. Separate the boundary points.');if(prev&&prev[0]*d[0]+prev[1]*d[1]<0)throw Error('The boundaries cross. Move the points apart.');prev=d;}}
  let ring=a.concat(b.reverse());for(let i=0;i<ring.length;i++)for(let j=i+2;j<ring.length;j++){if(i===0&&j===ring.length-1)continue;if(crosses(ring[i],ring[(i+1)%ring.length],ring[j],ring[(j+1)%ring.length]))throw Error('The ribbon intersects itself. Open the curve or reduce its width.');}
 }
}
export function renderSVG(doc,{motion=false,namespace='pg',shading=true,palette=materials,effects='satin'}={}){
 validate(doc);if(!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(namespace))throw Error('Use a unique letter-led SVG namespace.');
 for(const key of ['pearl','dark','gold']){const m=palette[key];if(!m||!Array.isArray(m.base)||m.base.length<2||m.base.length>32||![...m.base,m.reflection,m.shade,...(key==='gold'?[...(m.edge||[]),...(m.bevel||[])]:[])].every(c=>/^#[0-9a-f]{6}$/i.test(c))||!Number.isFinite(m.strength)||m.strength<0||m.strength>1)throw Error('Invalid material palette: '+key);}if(!palette.gold.edge?.length||!palette.gold.bevel?.length)throw Error('Gold needs edge and bevel ramps.');
 const s=doc.style,W=doc.canvas.width,H=doc.canvas.height,defs=[],parts=[],below=[];
 const stops=(colors,offsets)=>colors.map((c,i)=>'<stop offset="'+(offsets?offsets[i]:i/(colors.length-1))+'" stop-color="'+c+'"/>').join('');
 doc.ribbons.forEach((r,index)=>{
  const id=namespace+'-'+r.id,g=prepared(r,s),d=band(g,0,1),trim=r.material==='gold'?0:s.trim,face=band(g,trim,1-trim),m=palette[r.material];
  const all=[...cubics(g.a),...cubics(g.b)].flat(),xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),minX=Math.min(...xs),minY=Math.min(...ys),bw=Math.max(...xs)-minX,bh=Math.max(...ys)-minY,maxWidth=Math.max(...g.a.map((p,i)=>Math.hypot(p[0]-g.b[i][0],p[1]-g.b[i][1])));
  const bounds=' filterUnits="userSpaceOnUse" x="'+f(minX-180)+'" y="'+f(minY-180)+'" width="'+f(bw+360)+'" height="'+f(bh+360)+'" color-interpolation-filters="sRGB"';
  const grad=(name,colors,cross=false)=>{let mid=section(r,.5,s),start=section(r,.04,s).c,end=section(r,.96,s).c;if(cross){start=mid.a;end=mid.b;}let dx=end[0]-start[0],dy=end[1]-start[1],cx=(start[0]+end[0])/2,cy=(start[1]+end[1])/2,angle=s.light*.22,rx=dx*Math.cos(angle)-dy*Math.sin(angle),ry=dx*Math.sin(angle)+dy*Math.cos(angle);defs.push('<linearGradient id="'+id+'-'+name+'" gradientUnits="userSpaceOnUse" x1="'+f(cx-rx/2)+'" y1="'+f(cy-ry/2)+'" x2="'+f(cx+rx/2)+'" y2="'+f(cy+ry/2)+'">'+stops(colors)+'</linearGradient>');return 'url(#'+id+'-'+name+')';};
  const gold=grad('gold',palette.gold.edge),goldLight=grad('bevel',palette.gold.bevel),base=grad('face',m.base),cross=grad('cross',r.material==='dark'?['#080908','#746651','#10100e']:['#74604a','#eadac0','#fffdf4'],true);
  defs.push('<clipPath id="'+id+'-clip"><path d="'+d+'"/></clipPath><clipPath id="'+id+'-inner"><path d="'+face+'"/></clipPath>');
  if(index&&s.depth>0){let depth=s.depth+(r.depth||0),dx=Math.sin(s.light)*depth,dy=depth*.6+1.2;defs.push('<clipPath id="'+id+'-receiver">'+below.map(x=>'<path d="'+x+'"/>').join('')+'</clipPath>'+(effects==='vector'?'':'<filter id="'+id+'-shadow"'+bounds+'><feGaussianBlur stdDeviation="'+f(.5+depth*.32)+'"/></filter>'));parts.push('<g clip-path="url(#'+id+'-receiver)"><path data-shadow-caster="'+r.id+'" d="'+d+'" transform="translate('+f(dx)+' '+f(dy)+')" fill="#080603" opacity="'+(effects==='vector'?'.28':'.75')+'"'+(effects==='vector'?'':' filter="url(#'+id+'-shadow)"')+'/></g>');}
  let layers='<path d="'+d+'" fill="'+gold+'"/>';
  if(trim)layers+='<path d="'+face+'" fill="'+base+'"/>';
  if(shading&&trim&&effects==='vector'){
   // A broad gradient and one shallow curved reflection replace raster blur passes.
   layers+='<g clip-path="url(#'+id+'-inner)"><path d="'+face+'" fill="'+cross+'" opacity=".22"/>';
   layers+='<path d="'+band(g,.08,t=>.52+.14*Math.sin(t*Math.PI+r.phase))+'" fill="'+cross+'" opacity=".15"/></g>';
  }
  if(shading&&trim&&effects!=='vector'){
   // Soft curved reflection cards are filtered *inside* the unfiltered vector face.
   // Their footprint and gold trim share the exact same boundary basis.
   const sigma=Math.max(.2,maxWidth*.085*s.softness);
   defs.push('<filter id="'+id+'-satin"'+bounds+'><feGaussianBlur stdDeviation="'+f(sigma)+'"/></filter>');
   defs.push('<filter id="'+id+'-shoulder"'+bounds+'><feGaussianBlur stdDeviation="'+f(Math.max(.15,maxWidth*.022*s.softness))+'"/></filter>');
   const fade=id+'-fade';defs.push('<linearGradient id="'+fade+'" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox"><stop stop-color="'+m.reflection+'" stop-opacity=".15"/><stop offset=".25" stop-color="'+m.reflection+'" stop-opacity=".9"/><stop offset=".65" stop-color="'+m.reflection+'"/><stop offset="1" stop-color="'+m.reflection+'" stop-opacity=".25"/></linearGradient>');
   let center=t=>clamp(.36+.32*Math.sin(t*Math.PI*2+r.phase+s.light*.45)*s.twist/.8,.15,.8),half=.23*s.softness;
   layers+='<g clip-path="url(#'+id+'-inner)"><path d="'+face+'" fill="'+cross+'" opacity=".16"/>';
   layers+='<path d="'+band(g,t=>center(t)-half,t=>center(t)+half)+'" fill="url(#'+fade+')" opacity="'+m.strength+'" filter="url(#'+id+'-satin)"/>';
   layers+='<path d="'+band(g,.79,.99)+'" fill="'+m.shade+'" opacity=".14" filter="url(#'+id+'-satin)"/>';
   layers+='<path d="'+band(g,.035,.10)+'" fill="'+m.reflection+'" opacity="'+(r.material==='dark'?.16:.56)+'" filter="url(#'+id+'-satin)"/>';
   if(s.texture)for(let k=1;k<=9;k++)layers+='<path d="'+curveAt(g,.1+k*.08)+'" fill="none" stroke="'+(k%2?'#fff7e5':'#493a29')+'" stroke-width=".18" opacity="'+f(s.texture*.35)+'"/>';
   layers+='<path d="'+band(g,t=>.13+.055*Math.sin(t*6+r.phase),t=>.17+.065*Math.sin(t*6+r.phase))+'" fill="url(#'+fade+')" opacity="'+(r.material==='dark'?.08:.25)+'" filter="url(#'+id+'-shoulder)"/>';
   layers+='</g>';
  }
  // Shallow gold bevel: finite-width curved bands, never circular strokes.
  for(let side of trim?[0,1]:[0]){
   let edge=trim||1,at=v=>side?1-v*edge:v*edge;
   layers+='<path d="'+band(g,at(.08),at(.30))+'" fill="'+goldLight+'"/>';
   if(trim)layers+='<path d="'+band(g,at(.77),at(1))+'" fill="#51320f" opacity=".45"/><path d="'+band(g,at(.31),at(.43))+'" fill="'+goldLight+'" opacity=".68"/>';
  }
  parts.push('<g data-ribbon="'+r.id+'" clip-path="url(#'+id+'-clip)">'+layers+'</g>');below.push(d);
 });
 const content=parts.join(''),css=motion?'<style>@keyframes '+namespace+'-breathe{50%{transform:translateY(-2px)}}.'+namespace+'-motion{animation:'+namespace+'-breathe 18s ease-in-out infinite}@media(prefers-reduced-motion:reduce){.'+namespace+'-motion{animation:none}}</style>':'';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="Flowing pearl and gold silk ribbons" color-interpolation="sRGB"><defs>'+defs.join('')+'</defs>'+css+'<g class="'+namespace+'-motion">'+content+(doc.mirror?'<g transform="translate('+W+' 0) scale(-1 1)">'+content+'</g>':'')+'</g></svg>';
}
