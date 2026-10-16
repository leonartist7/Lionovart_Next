import test from 'node:test';
import assert from 'node:assert/strict';
import { SonicCues } from '../src/components/experience/sonic.ts';
let contexts=0, sources=0, tones=0;
class Param { value=0; targets=[]; holds=0; cancelAndHoldAtTime() {this.holds++;} setValueAtTime() {} linearRampToValueAtTime() {} exponentialRampToValueAtTime() {} cancelScheduledValues() {} setTargetAtTime(value) {this.targets.push(value);} }
class Node {gain=new Param();frequency=new Param();Q=new Param();connect(){} disconnect(){} start(){} stop(){} }
class Audio {
 state='suspended';currentTime=0;sampleRate=1000;destination={};
 constructor(){contexts++;}
 async resume(){this.state='running';} async suspend(){this.state='suspended';} async close(){this.state='closed';}
 createBuffer(channels,length){return {getChannelData:()=>new Float32Array(length)};}
 createBufferSource(){sources++;return new Node();} createBiquadFilter(){return new Node();} createGain(){return new Node();} createOscillator(){tones++;return new Node();}
}
globalThis.AudioContext=Audio;
globalThis.document={hidden:false};
test('breeze is silent by default, reuses one graph and fades on suspension',async()=>{
 const cues=new SonicCues();cues.scroll(20);cues.chapter('film');assert.equal(contexts,0);
 assert.equal(await cues.toggle(),true);assert.equal(sources,2);
 cues.scroll(10);cues.scroll(20);assert.equal(sources,2);
 assert.ok(cues.breezeGain.gain.targets.at(-1)>0);assert.ok(cues.breezeGain.gain.targets.at(-1)<=.026);
 cues.suspend();assert.equal(cues.breezeGain.gain.targets.at(-1),0);
 assert.equal(await cues.toggle(),false);assert.equal(await cues.toggle(),true);assert.equal(sources,2);
 document.hidden=true;const count=cues.breezeGain.gain.targets.length;cues.scroll(20);assert.equal(cues.breezeGain.gain.targets.length,count);
 cues.dispose();document.hidden=false;
});

test('hover cues stay opt-in, quiet and rate-limited',async()=>{
 const cues=new SonicCues();const before=tones;
 cues.hover();assert.equal(tones,before);
 await cues.toggle();cues.lastTap=-Infinity; const enabled=tones, enabledSources=sources;
 cues.hover();assert.equal(tones,enabled,'hover adds no musical tones');assert.equal(sources,enabledSources+1);
 cues.hover();assert.equal(sources,enabledSources+1,'rate-limited hover reuses the noise buffer');
 cues.lastHover=-Infinity;cues.scroll(10);cues.hover();assert.equal(sources,enabledSources+1,'scrolling suppresses incidental hover sounds');
 assert.ok(cues.breezeGain.gain.holds>0,'breeze updates retain the current envelope');
 cues.dispose();
});

test('clicks and step/service cues remain quiet, rate-limited and release their voices',async()=>{
 const cues=new SonicCues();let start=tones;cues.tap();cues.change('service','identity');assert.equal(tones,start,'no sound or graph before opting in');
 await cues.toggle();assert.equal(cues.output.gain.value,.45);
 start=tones;cues.tap();assert.equal(tones,start,'double clicks do not overlap');
 cues.lastTap=-Infinity;cues.tap();assert.equal(tones,start+1);
 cues.change('service','identity');const changed=tones;cues.change('service','identity');assert.equal(tones,changed);
 cues.lastChange=-Infinity;cues.change('process','1',1);assert.equal(tones,changed+2);
 document.hidden=true;cues.lastTap=-Infinity;cues.tap();assert.equal(tones,changed+2);document.hidden=false;
 cues.suspend();assert.equal(cues.cueCleanup.size,0,'hidden/suspended audio has no remaining cue voices');
 cues.dispose();
});
