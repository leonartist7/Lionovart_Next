import puppeteer from 'puppeteer-core';
import { prepareBrowser } from './browser.mjs';
const browser=await puppeteer.launch({...await prepareBrowser(),headless:true});
try{
  for(const config of [
    {id:'home-390',route:'/',width:390,height:844},
    {id:'careers-390',route:'/careers',width:390,height:844},
    {id:'brand-reduced-390',route:'/services/brand',width:390,height:844,reduce:true},
    {id:'about-1440',route:'/about',width:1440,height:900}
  ]){
    const page=await browser.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.setViewport({width:config.width,height:config.height,deviceScaleFactor:1,isMobile:config.width<768,hasTouch:config.width<768});
    if(config.reduce)await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
    await page.goto(new URL(config.route,process.env.PERF_VERIFY_URL).href,{waitUntil:'domcontentloaded',timeout:60000});
    await new Promise(resolve=>setTimeout(resolve,7000));
    await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Skip intro')?.click());
    await new Promise(resolve=>setTimeout(resolve,1000));
    const image=Buffer.from(await page.screenshot({type:'jpeg',quality:75})).toString('base64');
    console.log('PHASE3_IMAGE_JSON '+JSON.stringify({id:config.id,errors,image:'data:image/jpeg;base64,'+image}));
    await page.close();
  }
}finally{await browser.close()}
