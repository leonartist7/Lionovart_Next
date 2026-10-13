export type Tilt={x:number;y:number};
export function roarProfile(quality:'auto'|'desktop'|'mobile',width:number,fine:boolean):'desktop'|'mobile';
export function pointerTilt(x:number,y:number,maxX?:number,maxY?:number):Tilt;
export function dampTilt(current:Tilt,target:Tilt,seconds:number,responseMs?:number):Tilt;
export function settledTilt(current:Tilt,target:Tilt):boolean;
