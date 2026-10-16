import test from 'node:test';
import assert from 'node:assert/strict';
import {navScrollIntent} from '../src/components/sections/nav-scroll.ts';
test('navigation hides on descent and returns after deliberate upward travel',()=>{
 let state={direction:0,origin:0};
 let previous=100;
 for(const latest of [104,108,112,120,160]) {state=navScrollIntent(previous,latest,state.direction,state.origin);previous=latest;}
 assert.equal(state.visible,false);
 state=navScrollIntent(160,158,state.direction,state.origin);assert.equal(state.visible,undefined);
 state=navScrollIntent(158,150,state.direction,state.origin);assert.equal(state.visible,undefined);
 state=navScrollIntent(150,126,state.direction,state.origin);assert.equal(state.visible,true);
});
test('a new direction resets its accumulated travel',()=>{
 const down=navScrollIntent(150,165,-1,200);
 assert.equal(down.origin,150);assert.equal(down.visible,false);
 const up=navScrollIntent(165,160,down.direction,down.origin);
 assert.equal(up.origin,165);assert.equal(up.visible,undefined);
});
