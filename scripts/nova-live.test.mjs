import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { NovaLiveConnection } from '../src/lib/nova-live-connection.ts';
import { liveTokenPolicy, isSameOriginRequest, NOVA_SESSION_MS, validLocale, validConversationId } from '../src/lib/nova-live-policy.ts';
import agent from '../nova-agent-config.js';
import auth from '../ws-auth.js';

const credential = { token: 'auth_tokens/test-fixture', model: 'test-model', voice: 'Aoede' };
function harness(connect) {
  const sent = []; let callbacks; let closed = 0;
  const session = { sendRealtimeInput: data => sent.push(['input', data]), sendToolResponse: data => sent.push(['tool', data]), close: () => closed++ };
  const client = { live: { connect: async params => { callbacks = params.callbacks; return connect ? connect(params, session) : session; } } };
  const connection = new NovaLiveConnection(credential, async () => client);
  return { connection, sent, session, get callbacks() { return callbacks; }, get closed() { return closed; } };
}

test('live grant is single-use, allows one minute to connect and retains the original 45-minute deadline', () => {
  const start = Date.now();
  const first = liveTokenPolicy(start, start);
  const resumed = liveTokenPolicy(start + 300000, start);
  assert.equal(first.uses, 1);
  assert.equal(Date.parse(first.newSessionExpireTime) - start, 60000);
  assert.equal(first.expireTime, resumed.expireTime);
  assert.equal(Date.parse(first.expireTime), start + NOVA_SESSION_MS);
});
test('expired, future or invalid session timestamps cannot extend a credential', () => {
  for (const start of [0, NaN, Infinity, Date.now()+60000]) assert.throws(() => liveTokenPolicy(Date.now(), start));
});
test('preview host origin is accepted exactly; a different Vercel tenant is rejected', () => {
  const url = 'https://lionovart-next-preview.vercel.app/api/strategist/session-token';
  assert.equal(isSameOriginRequest(new Request(url, {headers:{origin:new URL(url).origin}})), true);
  for (const headers of [{origin:'https://attacker.vercel.app'}, {origin:new URL(url).origin,'sec-fetch-site':'cross-site'}, {}]) {
    assert.equal(isSameOriginRequest(new Request(url,{headers})), false);
  }
});
test('locales and conversation identifiers exclude unknown locales and document paths', () => {
  for (const locale of ['en','fr','es','it','ja','ko']) assert.equal(validLocale(locale),true);
  assert.equal(validLocale('de'),false);
  assert.equal(validConversationId('abc_123-def'),true);
  for (const value of ['../lead','a/b',{},'']) assert.equal(validConversationId(value),false);
});
test('server-built config overrides a forged prompt, toolset and voice', () => {
  const result = agent.buildLiveConfig({systemInstruction:'forged',tools:[],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'forged'}}}}, agent.DEFAULTS,'en','abc');
  assert.notEqual(result.config.systemInstruction.parts[0].text,'forged');
  assert.ok(result.config.tools.length);
  assert.equal(result.config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName,agent.DEFAULTS.voice);
});
test('Japanese session receives explicit Japanese guidance', () => {
  assert.match(agent.buildLiveConfig({},agent.DEFAULTS,'ja','abc').config.systemInstruction.parts[0].text,/natural, polite Japanese/);
});
test('tool receipt rejects altered conversation claims and expired tokens', () => {
  const secret='test-only-signing-secret-not-a-production-credential';
  const token=auth.mintToken({cid:'session-a'},secret,60000);
  assert.equal(auth.verifyToken(token,secret).cid,'session-a');
  const [payload,signature]=token.split('.');
  const forged=Buffer.from(JSON.stringify({...JSON.parse(Buffer.from(payload,'base64url')),cid:'session-b'})).toString('base64url');
  assert.equal(auth.verifyToken(forged+'.'+signature,secret),null);
  assert.equal(auth.verifyToken(auth.mintToken({cid:'x'},secret,-1),secret),null);
});
test('SDK handshake is not reported ready before setupComplete; audio and tool results map correctly', async () => {
  const h=harness();const messages=[];
  h.connection.onmessage=e=>messages.push(JSON.parse(e.data));
  await h.connection.connect();
  h.callbacks.onopen();assert.equal(h.connection.readyState,0);
  h.callbacks.onmessage({setupComplete:{}});assert.equal(h.connection.readyState,1);
  assert.deepEqual(messages.map(x=>x.type),['voice_resolved','setup_complete']);
  h.connection.send(JSON.stringify({realtimeInput:{audio:{data:'AAAA',mimeType:'audio/pcm;rate=16000'}}}));
  h.connection.send(JSON.stringify({type:'tool_response',responses:[{id:'1',name:'lookup_site_info',response:{ok:true}}]}));
  assert.equal(h.sent[0][0],'input');assert.equal(h.sent[1][1].functionResponses[0].id,'1');
  h.connection.close();assert.equal(h.closed,1);
});
test('messages sent during an early setup callback wait for the SDK session object', async () => {
  const h=harness(async(params,session)=>{params.callbacks.onmessage({setupComplete:{}});return session;});
  h.connection.onmessage=e=>{if(JSON.parse(e.data).type==='setup_complete')h.connection.send(JSON.stringify({realtimeInput:{text:'Hello'}}));};
  await h.connection.connect();assert.deepEqual(h.sent,[['input',{text:'Hello'}]]);h.connection.close();
});
test('interruption, transcripts, tool cancellations and resumption frames are preserved', async () => {
  const h=harness();const messages=[];h.connection.onmessage=e=>messages.push(JSON.parse(e.data));await h.connection.connect();
  const frames=[{serverContent:{interrupted:true}},{serverContent:{inputTranscription:{text:'Hi'}}},{toolCallCancellation:{ids:['1']}},{sessionResumptionUpdate:{newHandle:'resume',resumable:true}},{goAway:{timeLeft:'10s'}}];
  for(const frame of frames)h.callbacks.onmessage(frame);
  assert.deepEqual(messages,frames);h.connection.close();
});
test('stopping during connection closes a late SDK session and ignores late frames', async () => {
  let release;const h=harness(()=>new Promise(r=>{release=r;}));const messages=[];
  h.connection.onmessage=e=>messages.push(e);const connecting=h.connection.connect();
  await new Promise(r=>setImmediate(r));h.connection.close();release(h.session);await connecting;
  h.callbacks.onmessage({setupComplete:{}});assert.equal(h.closed,1);assert.equal(messages.length,0);assert.equal(h.connection.readyState,3);
});
test('provider errors close once without exposing provider error details', async () => {
  const h=harness();const closes=[];h.connection.onclose=e=>closes.push(e);await h.connection.connect();
  h.callbacks.onerror({message:'sensitive-provider-details'});h.callbacks.onclose({code:1006,reason:'sensitive-provider-details'});
  assert.equal(closes.length,1);assert.equal(closes[0].code,1011);assert.doesNotMatch(JSON.stringify(closes),/sensitive/);
});
for(const rate of [16000,44100,48000])test(`audio resampling at ${rate}Hz has no block-rounding drift and batches 20ms packets`,()=>{
  let Processor;const packets=[];
  const context={AudioWorkletProcessor:class{port={postMessage:m=>packets.push(m.pcm)}},sampleRate:rate,Int16Array,registerProcessor:(_,value)=>{Processor=value;}};
  vm.runInNewContext(readFileSync(new URL('../public/audio-processor.js',import.meta.url),'utf8'),context);
  const p=new Processor({processorOptions:{sampleRate:rate}});
  for(let block=0;block<1500;block++)p.process([[new Float32Array(128).fill(.25)]]);
  const produced=packets.length*320+p.packetIndex;const expected=1500*128*16000/rate;
  assert.ok(Math.abs(produced-expected)<2,`${produced} versus ${expected}`);
  assert.ok(packets.every(x=>x.length===320));assert.ok(packets[0].every(x=>Math.abs(x-8191)<2));
});
