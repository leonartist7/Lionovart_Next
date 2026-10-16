import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base=process.env.NOVA_TEST_BASE||'http://localhost:3100';
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname),'Browser fixture must target local server');
const artifacts=process.env.NOVA_TEST_ARTIFACTS||'/workspace/nova-verification';
await mkdir(artifacts,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const evidence={mockedProvider:true,checks:[]};
const pcm=Buffer.alloc(4800*2);for(let i=0;i<4800;i++)pcm.writeInt16LE(Math.round(Math.sin(i/24000*Math.PI*440*2)*3000),i*2);
try {
 const context=await browser.newContext({permissions:['microphone'],viewport:{width:1280,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();const grants=[];let microphonePackets=0,connections=0,toolResponses=0;let firstSocket;
 await page.addInitScript(()=>{
  window.__novaStreams=[];window.__novaPlayback=0;
  const getMedia=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia=async(...args)=>{const stream=await getMedia(...args);window.__novaStreams.push(stream);return stream;};
  const start=AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start=function(...args){window.__novaPlayback++;return start.apply(this,args);};
 });
 page.on('response',async response=>{if(response.url().endsWith('/api/strategist/session-token')&&response.status()===200)grants.push(await response.json());});
 await page.routeWebSocket('wss://generativelanguage.googleapis.com/**',socket=>{
  connections++;if(!firstSocket)firstSocket=socket;
  assert.ok(socket.url().includes('access_token=auth_tokens/local-regression-fixture'));
  socket.onMessage(raw=>{
   const m=JSON.parse(String(raw));
   if(m.setup){socket.send(JSON.stringify({setupComplete:{}}));socket.send(JSON.stringify({sessionResumptionUpdate:{newHandle:'mock-resume-handle',resumable:true}}));}
   if(m.realtimeInput?.audio)microphonePackets++;
   if(m.realtimeInput?.text?.includes('Hello.')){
    socket.send(JSON.stringify({serverContent:{outputTranscription:{text:'Hello, this is the local Nova voice test.'},modelTurn:{parts:[{inlineData:{mimeType:'audio/pcm;rate=24000',data:pcm.toString('base64')}}]},turnComplete:true}}));
    socket.send(JSON.stringify({toolCall:{functionCalls:[{id:'read-only-tool',name:'lookup_site_info',args:{kind:'service',key:'web'}}]}}));
   }
   if(m.toolResponse?.functionResponses?.some(x=>x.id==='read-only-tool'&&x.response?.result))toolResponses++;
  });
 });
 const response=await page.goto(base+'/services/brand',{waitUntil:'domcontentloaded',timeout:90000});assert.equal(response.status(),200);
 const start=page.getByRole('button',{name:'Start your brand',exact:true});await start.first().scrollIntoViewIfNeeded();await start.first().click();
 await page.getByRole('button',{name:'I understand — start',exact:true}).waitFor({timeout:30000});
 assert.equal(await page.evaluate(()=>window.__novaStreams.length),0);evidence.checks.push('Privacy consent precedes microphone capture');
 await page.getByRole('button',{name:'I understand — start',exact:true}).click();
 await page.getByRole('button',{name:'Mute microphone',exact:true}).waitFor({timeout:30000});
 for(let i=0;i<60 && (!microphonePackets||!toolResponses||!await page.evaluate(()=>window.__novaPlayback));i++)await page.waitForTimeout(250);
 assert.ok(microphonePackets>0,'microphone produces PCM frames');assert.ok(toolResponses>0,'authenticated read-only tool reply reaches Gemini');assert.ok(await page.evaluate(()=>window.__novaPlayback)>0,'returned PCM is played');
 evidence.checks.push('Microphone PCM, model audio playback, and authenticated read-only tool round trip');
 await page.getByRole('button',{name:'Mute microphone',exact:true}).click();await page.waitForTimeout(100);const mutedCount=microphonePackets;await page.waitForTimeout(300);assert.equal(microphonePackets,mutedCount);await page.getByRole('button',{name:'Unmute microphone',exact:true}).click();evidence.checks.push('Mute stops audio frames; unmute restores capture');
 firstSocket.send(JSON.stringify({goAway:{timeLeft:'10s'}}));
 for(let i=0;i<80&&connections<2;i++)await page.waitForTimeout(250);
 assert.equal(connections,2,'goAway reconnects');assert.equal(grants.length,2);assert.equal(grants[0].conversationId,grants[1].conversationId);assert.equal(grants[0].expiresAt,grants[1].expiresAt);
 assert.equal(await page.evaluate(()=>window.__novaStreams.length),1,'microphone reused during reconnect');evidence.checks.push('Reconnect preserves conversation, deadline, and microphone stream');
 await page.screenshot({path:artifacts+'/voice-connected.png'});
 await page.getByRole('button',{name:'End session',exact:true}).click();await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>window.__novaStreams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))),true);evidence.checks.push('End session releases every microphone track');
 // A server failure must stop capture and must not trigger an automatic retry loop.
 let failures=0;await page.route('**/api/strategist/session-token',route=>{failures++;return route.fulfill({status:503,contentType:'application/json',body:'{"error":"voice_not_configured"}'});});
 await start.first().click();await page.getByText("Couldn't start the session",{exact:true}).waitFor({timeout:30000});await page.waitForTimeout(1800);assert.equal(failures,1);assert.equal(await page.evaluate(()=>window.__novaStreams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))),true);evidence.checks.push('503 startup failure stops capture without an automatic retry loop');
 await page.screenshot({path:artifacts+'/voice-unavailable.png'});
 await context.close();
 const denied=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const deniedPage=await denied.newPage();
 await deniedPage.addInitScript(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Permission denied','NotAllowedError');};});
 await deniedPage.goto(base+'/services/brand',{waitUntil:'domcontentloaded',timeout:90000});const deniedStart=deniedPage.getByRole('button',{name:'Start your brand',exact:true}).first();await deniedStart.scrollIntoViewIfNeeded();await deniedStart.click();await deniedPage.getByRole('button',{name:'I understand — start',exact:true}).click();await deniedPage.getByText('Microphone access needed',{exact:true}).waitFor({timeout:30000});
 evidence.checks.push('Mobile microphone denial displays actionable guidance');await deniedPage.screenshot({path:artifacts+'/voice-microphone-denied-mobile.png'});await denied.close();
 await writeFile(artifacts+'/browser-results.json',JSON.stringify(evidence,null,2));console.log(`PASS: ${evidence.checks.length} browser scenarios with mocked Gemini and fake microphone`);
} finally {await browser.close();}
