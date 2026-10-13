// Exact cubic subdivision; samples are used only for distance/timing, never contours.
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const fmt=p=>p.map(v=>Number(v.toFixed(3))).join(' ');
export function cubics(points){return points.slice(0,-1).map((p,i)=>{const before=points[Math.max(0,i-1)],q=points[i+1],after=points[Math.min(points.length-1,i+2)];return [p,p.map((v,j)=>v+(q[j]-before[j])/6),q.map((v,j)=>v-(after[j]-p[j])/6),q];});}
export function evaluate(c,t){const a=lerp(c[0],c[1],t),b=lerp(c[1],c[2],t),d=lerp(c[2],c[3],t);return lerp(lerp(a,b,t),lerp(b,d,t),t);}
function cut(c,t){const a=lerp(c[0],c[1],t),b=lerp(c[1],c[2],t),d=lerp(c[2],c[3],t),e=lerp(a,b,t);return [c[0],a,e,lerp(e,lerp(b,d,t),t)];}
function path(cs,move=true){return (move?'M'+fmt(cs[0][0]):'')+cs.map(c=>'C'+c.slice(1).map(fmt).join(' ')).join('');}
export function makeRibbonGeometry(a,b){const A=cubics([...a].reverse()),B=cubics([...b].reverse()),lut=[[0,0]];let previous=lerp(A[0][0],B[0][0],.5),length=0;for(let i=0;i<A.length;i++)for(let k=1;k<=40;k++){const t=k/40,p=lerp(evaluate(A[i],t),evaluate(B[i],t),.5);length+=Math.hypot(p[0]-previous[0],p[1]-previous[1]);lut.push([length,(i+t)/A.length]);previous=p;}return {a:A,b:B,lut:lut.map(([d,t])=>[d/length,t])};}
export function revealPath(geometry,progress){
 if(progress<=0)return 'M0 0';
 const {a,b,lut}=geometry,p=Math.min(1,progress);
 const position=fraction=>{let low=0,high=lut.length-1;
 while(high-low>1){const m=(low+high)>>1;if(lut[m][0]<fraction)low=m;else high=m;}
 const span=lut[high][0]-lut[low][0];return span?lut[low][1]+(lut[high][1]-lut[low][1])*(fraction-lut[low][0])/span:1;};
 // Fade the taper length away near completion, so the final silhouette is exact.
 const tail=p===1?0:Math.min(.065,p*.65,(1-p)*.8),t=position(p-tail);
 const pos=t*a.length,i=Math.min(a.length-1,Math.floor(pos)),u=Math.min(1,pos-i),A=[...a.slice(0,i),cut(a[i],u)],B=[...b.slice(0,i),cut(b[i],u)],ae=A.at(-1)[3],be=B.at(-1)[3];
 const fp=position(p)*a.length,fi=Math.min(a.length-1,Math.floor(fp)),fu=Math.min(1,fp-fi);
 const tip=lerp(evaluate(a[fi],fu),evaluate(b[fi],fu),.5),prior=lerp(evaluate(a[fi],Math.max(0,fu-.01)),evaluate(b[fi],Math.max(0,fu-.01)),.5);
 const dist=Math.hypot(tip[0]-(ae[0]+be[0])/2,tip[1]-(ae[1]+be[1])/2),dx=tip[0]-prior[0],dy=tip[1]-prior[1],n=Math.hypot(dx,dy)||1;
 const nearTip=[tip[0]-dx/n*dist*.34,tip[1]-dy/n*dist*.34];
 const tangent=(end,control)=>{const x=end[0]-control[0],y=end[1]-control[1],l=Math.hypot(x,y)||1;return [end[0]+x/l*dist*.34,end[1]+y/l*dist*.34];};
 const reverse=[...B].reverse().map(c=>[...c].reverse()),end=B[0][0],start=A[0][0];
 const cap=p===1?'C'+fmt(ae)+' '+fmt(be)+' '+fmt(be):'C'+fmt(tangent(ae,A.at(-1)[2]))+' '+fmt(nearTip)+' '+fmt(tip)+'C'+fmt(nearTip)+' '+fmt(tangent(be,B.at(-1)[2]))+' '+fmt(be);
 return path(A)+cap+path(reverse,false)+'C'+fmt(end)+' '+fmt(start)+' '+fmt(start)+'Z';
}
// The project's on-screen-movement curve: cubic-bezier(.77,0,.175,1).
export function formationEase(x){if(x<=0)return 0;if(x>=1)return 1;let lo=0,hi=1;for(let i=0;i<18;i++){const t=(lo+hi)/2,v=3*(1-t)*(1-t)*t*.77+3*(1-t)*t*t*.175+t*t*t;if(v<x)lo=t;else hi=t;}let t=(lo+hi)/2;return 3*(1-t)*t*t+t*t*t;}
export function layerProgress(elapsed,index,{durationMs=9000,staggerMs=100,startDelayMs=0,layerCount=4}={}){const stagger=Math.min(Math.max(0,staggerMs),durationMs/Math.max(2,layerCount*2)),delay=startDelayMs+index*stagger;return formationEase(Math.max(0,Math.min(1,(elapsed-delay)/Math.max(1,durationMs-index*stagger))));}
