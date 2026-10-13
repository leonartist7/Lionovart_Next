export function roarProfile(quality,width,fine){return quality==='auto'?(!fine||width<768?'mobile':'desktop'):quality;}
export function pointerTilt(x,y,maxX=3,maxY=4){
 const clamp=v=>Math.max(-1,Math.min(1,v)),rad=Math.PI/180;
 return {x:-clamp(y)*Math.max(0,Math.min(3,maxX))*rad,y:clamp(x)*Math.max(0,Math.min(4,maxY))*rad};
}
export function dampTilt(current,target,seconds,responseMs=180){
 const alpha=1-Math.exp(-Math.max(0,Math.min(.05,seconds))/Math.max(.04,responseMs/1000));
 return {x:current.x+(target.x-current.x)*alpha,y:current.y+(target.y-current.y)*alpha};
}
export function settledTilt(current,target){return Math.abs(current.x-target.x)+Math.abs(current.y-target.y)<.00015;}
