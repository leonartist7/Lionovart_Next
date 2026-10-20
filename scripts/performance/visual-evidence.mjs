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
    console.log('PHASE3_IMAGE_JSON '+JSON.stringify({id:config.id,deployment:process.env.PERF_VERIFY_URL,errors,image:'data:image/jpeg;base64,'+image}));
    await page.close();
  }

  const page=await browser.newPage();
  await page.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.goto(new URL('/services/brand',process.env.PERF_VERIFY_URL).href,{waitUntil:'domcontentloaded',timeout:60000});
  await new Promise(r=>setTimeout(r,7000));
  const readings=[];
  for(const text of ["The look they'll recognize anywhere.","The words that sound like no one else.","Your vision, our craft","Logo suite"]){
    await page.evaluate(text=>{const el=[...document.querySelectorAll('h2,h3,span')].find(e=>e.textContent.trim()===text);if(!el)throw Error('Missing reading sample '+text);el.scrollIntoView({block:'center',behavior:'instant'});},text);
    await new Promise(r=>setTimeout(r,1000));
    readings.push(await page.evaluate(text=>{
      const el=[...document.querySelectorAll('h2,h3,span')].find(e=>e.textContent.trim()===text),hidden=[];
      for(let node=el;node;node=node.parentElement){const css=getComputedStyle(node);if(Number(css.opacity)<.01||css.visibility==='hidden'||css.display==='none')hidden.push({tag:node.tagName,opacity:css.opacity,visibility:css.visibility});}
      return {text,hidden,top:el.getBoundingClientRect().top};
    },text));
  }
  console.log('PHASE3_READING_JSON '+JSON.stringify(readings));
  if(readings.some(r=>r.hidden.length))process.exitCode=1;
  await page.close();
}finally{await browser.close()}
