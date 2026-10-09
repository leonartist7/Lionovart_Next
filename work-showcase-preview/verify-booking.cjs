const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const{chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(pathToFileURL(path.join(__dirname,'LIONOVART-results-preview.html')).href);
const actions=page.locator('.lv-header .lv-cta,.lv-gallery-next .lv-cta,.lv-closing-primary .lv-cta');
assert.equal(await actions.count(),3);for(const action of await actions.all()){
assert.equal(await action.getAttribute('href'),'https://calendar.app.google/vjKnyMFNsjjRGZSn6');
assert.equal(await action.getAttribute('target'),'_blank');assert((await action.getAttribute('rel')).includes('noopener'));assert.equal(await action.isEnabled(),true);
}
const popupPromise=page.waitForEvent('popup');await actions.first().click();const popup=await popupPromise;
await popup.waitForURL(/calendar\.google\.com\/calendar\/appointments\/schedules\//,{timeout:60000});
await popup.getByText('Select an appointment time',{exact:true}).waitFor({timeout:60000});
assert((await popup.title()).includes('Creative Discovery Call'));console.log('PASS all three native booking links enabled; actual click-through opens Google Calendar appointment scheduling.');
await popup.close();assert.deepEqual(errors,[]);console.log('No appointment time selected, form completed, booking reserved or message sent.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
