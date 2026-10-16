// Readiness is read-only by default. --live additionally spends one short Gemini
// session, uses a read-only NOVA tool, and does not create leads/send messages.
import assert from 'node:assert/strict';
import { GoogleGenAI } from '@google/genai';
const input=process.argv.find((v,i)=>i>1&&!v.startsWith('--'));
if(!input)throw new Error('Usage: node scripts/verify-nova-deployment.mjs https://actual-deployment.vercel.app [--live]');
const url=new URL(input);assert.equal(url.protocol,'https:','Deployment checks require HTTPS');
const base=url.origin;
const health=await fetch(base+'/api/health',{signal:AbortSignal.timeout(20000)});
assert.equal(health.status,200,'Deployment health endpoint responds');
const status=await health.json();assert.equal(status.voice?.transport,'gemini-direct','Migration build is deployed');
assert.equal(status.voice?.configured,true,'Required runtime configuration is present');
console.log('PASS: deployed application reports the direct Gemini transport and required configuration');
if(process.argv.includes('--live')){
 const response=await fetch(base+'/api/strategist/session-token',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({locale:'en'}),signal:AbortSignal.timeout(30000)});
 assert.equal(response.status,200,'Real session credential issuance succeeds');
 const grant=await response.json();assert.ok(grant.token?.startsWith('auth_tokens/'));
 const result=await fetch(base+'/api/strategist/tool',{method:'POST',headers:{Origin:base,'Content-Type':'application/json',Authorization:'Bearer '+grant.toolToken},body:JSON.stringify({conversation_id:grant.conversationId,name:'lookup_site_info',args:{kind:'service',key:'web'}}),signal:AbortSignal.timeout(30000)});
 assert.equal(result.status,200,'Authenticated read-only tool succeeds');assert.ok((await result.json()).result);
 let session,ready=false,finished=false;
 const client=new GoogleGenAI({apiKey:grant.token,httpOptions:{apiVersion:'v1alpha'}});
 let done,fail;const audio=new Promise((resolve,reject)=>{done=resolve;fail=reject;});
 const timer=setTimeout(()=>{finished=true;session?.close();fail(new Error('Live audio response timed out'));},25000);
 const greet=()=>{if(ready&&session&&!finished)session.sendRealtimeInput({text:'Please greet me briefly. This is a connection check; do not save a lead, book anything, or send any messages.'});};
 void client.live.connect({model:grant.model,callbacks:{
  onmessage(message){
   if(message.setupComplete){ready=true;greet();}
   if(message.serverContent?.modelTurn?.parts?.some(p=>p.inlineData?.mimeType?.startsWith('audio/pcm')&&p.inlineData.data)) {finished=true;done();}
   if(message.toolCall&&session)session.sendToolResponse({functionResponses:message.toolCall.functionCalls.map(call=>({id:call.id,name:call.name,response:{error:'Tool execution disabled in read-only voice smoke check'}}))});
  },
  onerror(){finished=true;fail(new Error('Live provider connection failed'));},
  onclose(){if(!finished){finished=true;fail(new Error('Live provider closed before sending audio'));}},
 }}).then(value=>{session=value;if(finished)session.close();else greet();}).catch(()=>{finished=true;fail(new Error('Live provider setup failed'));});
 try {await audio;console.log('PASS: real ephemeral credential, read-only tool, and Gemini PCM audio response');}
 finally {clearTimeout(timer);finished=true;session?.close();}
}
