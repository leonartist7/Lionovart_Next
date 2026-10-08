const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {works,publishedWorks}=require('./test-work-inventory.cjs'),fixture=require('./opening-order-fixture.json');
const {reviewNumber}=require('./src/components/generated/work-review-data.ts');
assert.deepEqual(publishedWorks.slice(0,9).map(w=>Number(reviewNumber(w.assetId))),[12,16,7,15,22,1,10,4,36]);
assert.deepEqual(publishedWorks.slice(9).map(w=>w.assetId),fixture.remainingAssetIds);
assert.equal(works.length,53);assert.equal(new Set(works.map(w=>w.assetId)).size,53);assert.equal(publishedWorks.length,40);assert.equal(publishedWorks.filter(w=>reviewNumber(w.assetId)==='16').length,1);
const html=fs.readFileSync(path.join(__dirname,'LIONOVART-results-preview.html'),'utf8');fs.mkdirSync(path.join(__dirname,'review'),{recursive:true});
(async()=>{const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port+'/work',browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of[320,390,768,1440]){
const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'}),page=await context.newPage();
await page.goto(base);await page.locator('.lv-work').first().waitFor();await page.evaluate(()=>document.fonts.ready);
assert.deepEqual(await page.locator('.lv-work').evaluateAll(es=>es.map(e=>e.dataset.assetId)),publishedWorks.slice(0,12).map(w=>w.assetId));
assert.equal(await page.locator('[data-work="blastup"]').count(),1);
await page.screenshot({path:path.join(__dirname,'review/opening-order-'+width+'.png')});
for(const expected of[24,36,40]){await page.getByRole('button',{name:'More work',exact:false}).click();await page.waitForFunction(n=>document.querySelectorAll('.lv-work').length===n,expected);}
assert.deepEqual(await page.locator('.lv-work').evaluateAll(es=>es.map(e=>e.dataset.assetId)),publishedWorks.map(w=>w.assetId));
await page.goto(base+'?show=60&review=tags');assert.deepEqual((await page.locator('.lv-tag-review-card').evaluateAll(es=>es.slice(0,9).map(e=>Number(e.dataset.reviewNumber)))),fixture.openingNumbers);
assert((await page.locator('.lv-review-toolbar').innerText()).includes('40 of 40 confirmed'));
await page.getByRole('tab',{name:'Industry',exact:true}).click();await page.getByRole('radio',{name:'Finance',exact:true}).click();
assert.deepEqual(await page.locator('.lv-tag-review-card').evaluateAll(es=>es.map(e=>Number(e.dataset.reviewNumber))),[12,7,13,14,46]);
await context.close();console.log('PASS '+width+': opening sequence, one Blastup, remaining order, pagination, saved review numbers/confirmation and filtered editorial order');
}}finally{await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
