// Only load explicitly into the local regression server. Never imported by the app.
import assert from 'node:assert/strict';
if (process.env.NOVA_LOCAL_TEST !== '1') throw new Error('NOVA fixture requires explicit local test mode');
const originalFetch = globalThis.fetch;
globalThis.fetch = async function(input, init) {
  const url = String(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (url.startsWith('https://generativelanguage.googleapis.com/')) {
    const request = new Request(input, init);
    assert.match(url,/auth_tokens/);
    const body = await request.json();
    assert.equal(body.uses,1);
    assert.ok(body.bidiGenerateContentSetup.systemInstruction.parts[0].text);
    assert.ok(body.bidiGenerateContentSetup.tools.length);
    assert.equal(body.fieldMask,undefined,'entire server-built config is locked');
    assert.deepEqual(body.bidiGenerateContentSetup.generationConfig.responseModalities,['AUDIO']);
    return Response.json({name:'auth_tokens/local-regression-fixture'});
  }
  return originalFetch(input, init);
};
