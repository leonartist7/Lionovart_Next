import test from 'node:test';
import assert from 'node:assert/strict';
import { INTRO_EXIT_FRAMES, introExitFrame } from '../src/components/ui/intro-honeycomb.ts';
import { waitForIntroContent } from '../src/components/ui/intro-readiness.ts';
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
function browser(){
 const fonts=deferred(),logo=deferred(),poster=deferred();
 let mounted=false,observer,disconnected=false,measurements=0,id=0;
 const frames=new Map();
 const node={querySelector:()=>null,getBoundingClientRect:()=>{measurements++;return {width:390,height:844}}};
 globalThis.location={pathname:'/'};
 globalThis.getComputedStyle=()=>({fontWeight:'700',fontSize:'24px',fontFamily:'TestFont'});
 globalThis.document={body:{},querySelector:()=>mounted?node:null,querySelectorAll:()=>[{decode:()=>logo.promise},{decode:()=>poster.promise}],fonts:{load:()=>fonts.promise}};
 globalThis.MutationObserver=class{constructor(fn){observer=fn}observe(){}disconnect(){disconnected=true}};
 globalThis.requestAnimationFrame=fn=>{frames.set(++id,fn);return id};globalThis.cancelAnimationFrame=n=>frames.delete(n);
 return {fonts,logo,poster,mount(){mounted=true;observer()},paint(){for(const [id,fn] of [...frames]){frames.delete(id);fn()}},get disconnected(){return disconnected},get measurements(){return measurements},get frames(){return frames.size}};
}
const tick=()=>new Promise(r=>setImmediate(r));
test('readiness waits for mounted content, essential fonts, both decoded images, then two measured frames',async()=>{
 const b=browser(),controller=new AbortController();let ready=false;
 const promise=waitForIntroContent(controller.signal).then(()=>ready=true);
 await tick();assert.equal(ready,false);b.mount();await tick();
 b.fonts.resolve();b.logo.resolve();await tick();assert.equal(b.frames,0);
 b.poster.resolve();await tick();assert.equal(b.frames,1);b.paint();await tick();assert.equal(ready,false);
 b.paint();await promise;assert.equal(ready,true);assert.equal(b.measurements,4);assert.equal(b.disconnected,true);
});
test('timeout cancellation disconnects mount observer',async()=>{
 const b=browser(),controller=new AbortController();const promise=waitForIntroContent(controller.signal);
 controller.abort(new Error('deadline'));await assert.rejects(promise,/deadline/);assert.equal(b.disconnected,true);assert.equal(b.frames,0);
});
test('cancellation removes pending layout frame',async()=>{
 const b=browser(),controller=new AbortController();const promise=waitForIntroContent(controller.signal);
 b.mount();b.fonts.resolve();b.logo.resolve();b.poster.resolve();await tick();assert.equal(b.frames,1);
 controller.abort(new Error('skip'));await assert.rejects(promise,/skip/);assert.equal(b.frames,0);
});

test('the exit keyframes start at rest and fade to a fully clear cover', () => {
  const first = introExitFrame(0);
  assert.equal(first.cover, 1);
  assert.equal(first.camera, 'translate3d(0%, 0%, 0) scale(1)');
  let previous = first;
  for (const next of INTRO_EXIT_FRAMES) {
    assert.ok(next.cover <= previous.cover);
    assert.ok(previous.cover - next.cover < .1);
    previous = next;
  }
  assert.equal(previous.cover, 0);
  assert.equal(previous.wordmarkOpacity, 0);
  assert.equal(previous.camera, 'translate3d(2.4%, -1.7%, 0) scale(1.56)');
});
