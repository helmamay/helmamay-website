// Regression for the canvas strip: use real artwork dimensions and inspect bounds.
// Run with Playwright installed: node tests/preview-layout.cjs
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const pages = [...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/href="([^"#]+\.html)"/g)].map(m=>m[1]);
(async()=>{
 for(const file of pages){
  const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--no-zygote','--single-process','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}: {})});
  try{
   const page=await browser.newPage();
   const html=fs.readFileSync(path.join(root,file),'utf8');
   const source=decodeURIComponent(html.match(/<img(?=[^>]*class="original")[^>]*src="([^"]+)"/)[1]);
   await page.route('**/*',route=>route.request().resourceType()==='image'&&!decodeURIComponent(route.request().url()).endsWith('/'+source)?route.abort():route.continue());
   await page.goto('file://'+path.join(root,file));
   await page.waitForFunction(()=>{const img=document.querySelector('.mat img');return img.complete&&img.naturalWidth>0});
   for(const width of [1200,390,320]){
    await page.setViewportSize({width,height:900});
    // Start with a dark frame to expose any spare container space on canvas.
    await page.selectOption('#print-medium','Fine-art paper');
    await page.locator('#frame-choice,#frame-finish,#frameFinish').selectOption({label:'Black'});
    for(const medium of ['Gallery-wrapped canvas','Unstretched canvas','Canvas with floating frame']){
     await page.selectOption('#print-medium',medium);
     if(medium==='Gallery-wrapped canvas') await page.selectOption('#canvas-sides','White');
     await page.waitForFunction(()=>{
      const mat=document.querySelector('.mat'),img=mat.querySelector('img');
      return Math.abs(mat.getBoundingClientRect().width-img.getBoundingClientRect().width)<1;
     },null,{timeout:3000});
     const bounds=await page.evaluate(()=>{
      const img=document.querySelector('.mat img'),mat=img.parentElement,frame=mat.parentElement;
      const ir=img.getBoundingClientRect(),mr=mat.getBoundingClientRect(),fr=frame.getBoundingClientRect(),style=getComputedStyle(frame);
      return {gap:mr.width-ir.width,inset:ir.x-fr.x,expectedInset:parseFloat(style.paddingLeft)+parseFloat(style.borderLeftWidth),right:fr.right,viewport:innerWidth};
     });
     assert(Math.abs(bounds.gap)<1,file+' '+width+' '+medium+' spare strip');
     assert(Math.abs(bounds.inset-bounds.expectedInset)<1,file+' artwork is flush with its container');
     assert(bounds.right<=bounds.viewport+1,file+' preview overflow');
    }
   }
   console.log('PASS',file,'— no spare strip at desktop, mobile and narrow-mobile sizes');
  }finally{await browser.close()}
 }
})().catch(error=>{console.error(error);process.exitCode=1});
