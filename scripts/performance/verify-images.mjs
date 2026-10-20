import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { prepareBrowser } from './browser.mjs';

const base = process.env.PERF_VERIFY_URL;
if (!base || new URL(base).protocol !== 'https:') throw new Error('Set PERF_VERIFY_URL to the HTTPS review deployment.');
const output = path.resolve(process.env.PERF_VERIFY_OUTPUT || '../../reports/performance/image-verification');
await fs.mkdir(output, { recursive: true });
const browser = await puppeteer.launch({ ...await prepareBrowser(), headless: 'shell' });
const results = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const imageState = () => {
  const images = [...document.images];
  const data = images.map(image => {
    const rect = image.getBoundingClientRect();
    return { alt: image.alt, src: image.currentSrc, fallback: image.getAttribute('src'),
      loaded: image.complete && image.naturalWidth > 0,
      broken: !!image.currentSrc && image.complete && image.naturalWidth === 0,
      visible: rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth,
      width: rect.width, naturalWidth: image.naturalWidth, owner: image.tagName, parent: image.parentElement?.tagName };
  });
  return { viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
    overflow: document.documentElement.scrollWidth > innerWidth + 2,
    pictures: document.querySelectorAll('picture').length,
    broken: data.filter(image => image.broken), visible: data.filter(image => image.visible),
    decodedPictures: data.filter(image => image.parent === 'PICTURE' && image.loaded),
    gates: { partnership: document.querySelectorAll('[data-partnership-tile] img').length,
      closingActive: document.querySelectorAll('[data-closing-media-wall] img[src]').length,
      closingDecoded: [...document.querySelectorAll('[data-closing-media-wall] img')].filter(image => image.complete && image.naturalWidth).length,
      closingVisibleTiles: [...document.querySelectorAll('[data-closing-media-wall] [data-media-wall-plane] > div')].filter(tile => getComputedStyle(tile).display !== 'none').length },
    videos: [...document.querySelectorAll('video')].map(video => ({ src: video.currentSrc, paused: video.paused, time: video.currentTime,
      top: video.getBoundingClientRect().top, height: video.getBoundingClientRect().height, preload: video.preload })),
    canvases: document.querySelectorAll('canvas').length,
    longTasks: window.__lionovartAuditTasks ? { count: window.__lionovartAuditTasks.length,
      totalMs: window.__lionovartAuditTasks.reduce((sum,duration)=>sum+duration,0),
      maxMs: Math.max(0,...window.__lionovartAuditTasks) } : null,
    animationOwners: [...document.querySelectorAll('[data-animation-active],[data-lion-active]')].map(element=>({
      section:element.closest('section')?.id||null,
      active:element.getAttribute('data-animation-active')||element.getAttribute('data-lion-active'),
    })),
    filmRequested: document.querySelector('[data-opening-transition]')?.getAttribute('data-film-requested'),
    animations: document.getAnimations().map(animation => {
      const target=animation.effect?.target;
      if (!(target instanceof Element)) return null;
      const rect=target.getBoundingClientRect();
      return {state:animation.playState,name:animation.animationName||null,
        visible:rect.width>0&&rect.height>0&&rect.bottom>0&&rect.top<innerHeight&&rect.right>0&&rect.left<innerWidth,
        section:target.closest('section')?.id||null};
    }).filter(Boolean),
  };
};
try {
  for (const viewport of [{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true},
    {width:768,height:1024,deviceScaleFactor:2,isMobile:true,hasTouch:true},
    {width:1440,height:900,deviceScaleFactor:1,isMobile:false,hasTouch:false}]) {
    for (const webpOnly of [false,true]) {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport(viewport);
      await page.evaluateOnNewDocument(()=>{
        window.__lionovartAuditTasks=[];
        try { new PerformanceObserver(list=>{
          for(const entry of list.getEntries())window.__lionovartAuditTasks.push(entry.duration);
        }).observe({type:'longtask',buffered:true}); } catch { window.__lionovartAuditTasks=null; }
      });
      const client = await page.createCDPSession();
      if (webpOnly) await client.send('Emulation.setDisabledImageTypes', { imageTypes: ['avif'] });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const route of ['/', '/about', '/services']) {
        const response = await page.goto(new URL(route,base).href, {waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(() => [...document.images].some(image=>image.currentSrc.includes('/images/optimized/') && image.complete && image.naturalWidth>0), {timeout:30000});
        await page.evaluate(() => [...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='Skip intro')?.click());
        await delay(5000);
        const initial = await page.evaluate(imageState);
        const checkpoints = [];
        if (route === '/') {
          await page.evaluate(()=>window.scrollTo({top:innerHeight*.65,behavior:'instant'}));
          await delay(1800);
          checkpoints.push({selector:'film-approach',state:await page.evaluate(imageState)});
          for (const selector of ['[data-partnership-tiles]','#selected-work','#process','#closing-cta']) {
            await page.evaluate(selector=>{
              const element=document.querySelector(selector);
              if(element) {
                const journey=selector==='#closing-cta'?element.closest('[data-process-lion-journey]'):null;
                const top=journey?scrollY+journey.getBoundingClientRect().bottom-innerHeight:scrollY+element.getBoundingClientRect().top;
                window.scrollTo({top,behavior:'instant'});
              }
            },selector);
            await delay(1500);
            checkpoints.push({selector,state:await page.evaluate(imageState)});
          }
        } else if (route === '/about') {
          await page.evaluate(()=>document.getElementById('founder')?.scrollIntoView());
          await delay(1200);
          checkpoints.push({selector:'#founder',state:await page.evaluate(imageState)});
        }
        const allStates=[initial,...checkpoints.map(checkpoint=>checkpoint.state)];
        const wrongFormat=webpOnly?allStates.flatMap(state=>state.decodedPictures.filter(image=>!(/f_webp/.test(image.src)||(/\.webp(?:$|[?#])/.test(image.src)&&!/f_avif/.test(image.src))))):[];
        const record={route,status:response.status(),viewport,webpOnly,initial,checkpoints,
          wrongFormat,errors:[...new Set(errors)],
          passed:response.ok()&&allStates.every(state=>state.broken.length===0&&!state.overflow)&&wrongFormat.length===0};
        if(route==='/'&&process.env.PERF_EXPECT_DEFERRED_FILM==='1'){
          const approach=checkpoints.find(checkpoint=>checkpoint.selector==='film-approach').state;
          record.filmGatePassed=initial.filmRequested==='false'&&initial.videos[0]?.src===''&&approach.filmRequested==='true'&&!!approach.videos[0]?.src;
          record.passed&&=record.filmGatePassed;
        }
        results.push(record);
        await page.screenshot({path:path.join(output,`${viewport.width}-${webpOnly?'webp':'avif'}-${route.replaceAll('/','')||'home'}.png`)});
        await fs.writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2)+'\n');
        console.log(JSON.stringify({route,width:viewport.width,webpOnly,passed:record.passed,broken:allStates.reduce((sum,state)=>sum+state.broken.length,0),wrongFormat:wrongFormat.length,errors:record.errors}));
      }
      await context.close();
    }
  }
} finally { await browser.close(); }
if(results.some(result=>!result.passed))process.exitCode=1;
