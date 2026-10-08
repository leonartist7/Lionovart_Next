const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {works,publishedWorks,count}=require('./test-work-inventory.cjs');
const {reviewNumber}=require('./src/components/generated/work-review-data.ts');
const {serviceTagLabel}=require('./src/components/generated/work-services.ts');
const {formatTagReview}=require('./src/components/generated/work-tag-review-data.ts');
const approved=require('./src/components/generated/work-approved-tags.json');
assert.equal(works.length,53);assert.equal(publishedWorks.length,40);assert.equal(Object.keys(approved).length,40);
assert.deepEqual(new Set(Object.keys(approved)),new Set(publishedWorks.map(w=>w.assetId)));
assert.deepEqual(publishedWorks.filter(w=>w.status==='concept').map(w=>Number(reviewNumber(w.assetId))),[17,18,20,31,47,48]);
assert(publishedWorks.every(w=>w.services.includes('web-app-dev')));
assert.equal(publishedWorks.filter(w=>w.services.includes('ai-os')).length,14);
assert.equal(publishedWorks.filter(w=>w.services.includes('motion')).length,16);
assert.deepEqual(publishedWorks.find(w=>reviewNumber(w.assetId)==='23').services,['web-app-dev']);
assert.deepEqual(publishedWorks.find(w=>reviewNumber(w.assetId)==='48').services,['motion','web-app-dev']);
assert.equal(formatTagReview({}).split('\n')[1],'40 of 40 confirmed');
const html=fs.readFileSync(path.join(__dirname,'LIONOVART-results-preview.html'),'utf8');fs.mkdirSync(path.join(__dirname,'review'),{recursive:true});
(async()=>{const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port+'/work',browser=await chromium.launch({channel:'msedge',headless:true});
try{
for(const width of[320,390,768,1440]){
const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'?show=60');await page.locator('.lv-work').first().waitFor();await page.evaluate(()=>document.fonts.ready);
assert.equal(await page.locator('.lv-work').count(),40);assert.equal(await page.locator('.lv-work-kind').count(),6);
assert.equal(await page.locator('.lv-review-card,.lv-review-toolbar,.lv-work input').count(),0);
for(const work of publishedWorks){
const card=page.locator('[data-asset-id="'+work.assetId+'"]');assert.equal(await card.getAttribute('data-status'),work.status);
assert.deepEqual(await card.locator('.lv-service-labels li').allTextContents(),approved[work.assetId].services.map(serviceTagLabel));
assert.equal(await card.locator('.lv-work-kind').count(),work.status==='concept'?1:0);
}
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
assert(await page.locator('.lv-service-labels').evaluateAll(es=>es.every(e=>{const r=e.getBoundingClientRect(),frame=e.parentElement.getBoundingClientRect();return r.left>=frame.left&&r.right<=frame.right+1&&r.top>=frame.top&&r.bottom<=frame.bottom+1;})));
await page.screenshot({path:path.join(__dirname,'review/approved-tags-'+width+'.png')});
for(const service of['web-app-dev','web-dev','app-dev','ai-os','motion','identity','event-branding']){
await page.goto(base+'?show=60&service='+service);assert.equal(await page.locator('.lv-work').count(),count({service},100));
}
await page.goto(base+'?industry=automotive&service=event-branding');assert.equal(await page.locator('.lv-work').count(),0);assert(await page.locator('.lv-empty').isVisible());
await page.goto(base+'?show=60&review=tags');assert((await page.locator('.lv-review-toolbar').innerText()).includes('40 of 40 confirmed'));
const concept=page.getByRole('checkbox',{name:'Concept #17 — AI high-tech',exact:true});assert(await concept.isChecked());
await concept.focus();await page.keyboard.press('Space');assert((await page.locator('.lv-review-toolbar').innerText()).includes('39 of 40 confirmed'));
await page.getByRole('button',{name:'Exit review',exact:true}).click();assert.equal(await page.locator('[data-work="ai-hightech"] .lv-work-kind').count(),1);assert.equal(await page.locator('.lv-work-kind').count(),6);
assert.deepEqual(errors,[]);await context.close();console.log('PASS '+width+': all 40 exact labels, six Concepts, containment, legacy/combined filters, empty results, fresh confirmation and isolated local edits');
}
}finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
