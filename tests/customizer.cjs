// Run with Node and Playwright installed: node tests/customizer.cjs
// All Formspree requests are intercepted; this test sends no real inquiries.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/href="([^"#]+\.html)"/g)].map(match => match[1]);
const tick = () => new Promise(resolve => setTimeout(resolve, 20));
(async () => {
  for (const file of pages) {
  const browser = await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--no-zygote','--single-process','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']} : {})});
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      // Avoid decoding the large gallery images during behavior tests.
      await page.route('**/*', route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
      let responseMode = 'error', requests = [];
      await page.route('https://formspree.io/**', async route => {
        requests.push({body:route.request().postData(),method:route.request().method(),headers:route.request().headers()});
        if (responseMode === 'network') return route.abort('failed');
        await route.fulfill({status:responseMode === 'success' ? 200 : 422,contentType:'application/json',body:responseMode === 'success' ? '{"ok":true}' : '{"errors":[{"message":"Test rejection"}]}'});
      });
      await page.goto('file://' + path.join(root, file));
      await page.waitForFunction(() => document.querySelector('form').dataset.customizerReady === 'true');
      const snapshot = await page.evaluate(() => {
        const form = document.querySelector('form');
        const byIds = (...ids) => ids.map(id=>document.getElementById(id)).find(Boolean);
        window.testControls = {form, frame:byIds('preview-frame','frame-preview','framePreview','frame'),mat:byIds('preview-mat','mat-preview','matPreview','mat'),finish:byIds('frame-choice','frame-finish','frameFinish'),matting:byIds('mat-choice','matting','matChoice'),size:byIds('print-size','printSize')};
        return {artwork:form.querySelector('[name="artwork"], [name="Artwork"]').value,action:form.action};
      });
      assert.equal(await page.locator('.helmamay-guide').count(),1,file);
      assert.equal(await page.locator('.helmamay-guide').getAttribute('open'),null,file);
      await page.locator('.helmamay-guide summary').click();
      assert.equal(await page.locator('.helmamay-finish-grid button').count(),9,file);
      const finishes = ['Natural wood','Black','White','Walnut','Dark wood','Brass','Chrome','Gold','Ornate gold'];
      for (const finish of finishes) {
        const swatch = page.getByRole('button',{name:'Preview '+finish+' frame',exact:true});
        await swatch.click();
        assert.equal(await swatch.getAttribute('aria-pressed'),'true',file);
        const selected = await page.evaluate(()=>({
          label:testControls.finish.selectedOptions[0].textContent,
          value:new FormData(testControls.form).get(testControls.finish.name),
          expected:testControls.finish.value,
          background:testControls.frame.style.background
        }));
        assert.equal(selected.label,finish,file);
        assert.equal(selected.value,selected.expected,file);
        assert(selected.background.length>0,file);
        assert.equal(requests.length,0,file+' swatches must never submit a quote');
      }
      await page.selectOption('#print-medium','Canvas with floating frame');
      assert.equal(await page.getByRole('button',{name:'Preview Ornate gold frame',exact:true}).isDisabled(),true,file);
      assert.equal(await page.evaluate(()=>testControls.finish.selectedOptions[0].textContent),'Natural wood',file);
      await page.selectOption('#print-medium','Fine-art paper');
      const walnut = page.getByRole('button',{name:'Preview Walnut frame',exact:true});
      await walnut.focus();await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(()=>testControls.finish.value),'Walnut',file);
      assert.equal(requests.length,0,file);
      await page.evaluate(()=>testControls.form.reset());
      await page.waitForFunction(()=>document.querySelector('#canvas-sides').disabled);
      assert.equal(await page.evaluate(()=>testControls.finish.selectedIndex),0,file);
      await page.locator('.helmamay-guide summary').click();
      assert.equal(snapshot.action, 'https://formspree.io/f/xeaewlqp');
      assert.equal(await page.locator('#print-medium option').count(),4);
      assert.equal(await page.locator('#canvas-sides option').count(),2);
      for (const medium of ['Fine-art paper','Gallery-wrapped canvas','Canvas with floating frame','Unstretched canvas']) {
        await page.selectOption('#print-medium',medium);
        const state = await page.evaluate(() => {
          const {form,frame,mat,finish,matting}=window.testControls;
          return {matDisabled:matting.disabled,frameDisabled:finish.disabled,sideDisabled:document.getElementById('canvas-sides').disabled,padding:mat.style.padding,framePadding:frame.style.padding,keys:[...new FormData(form).keys()],matName:matting.name,frameName:finish.name};
        });
        assert.equal(state.matDisabled,medium!=='Fine-art paper',file);
        assert.equal(state.frameDisabled,!['Fine-art paper','Canvas with floating frame'].includes(medium),file);
        assert.equal(state.sideDisabled,medium!=='Gallery-wrapped canvas',file);
        assert.equal(await page.getByRole('button',{name:'Preview Walnut frame',exact:true,includeHidden:true}).isDisabled(),!['Fine-art paper','Canvas with floating frame'].includes(medium),file);
        assert.equal(state.keys.includes(state.matName),!state.matDisabled,file);
        assert.equal(state.keys.includes(state.frameName),!state.frameDisabled,file);
        assert.equal(state.keys.includes('canvas_side_color'),!state.sideDisabled,file);
        if (medium!=='Fine-art paper') assert.equal(state.padding,'0px',file);
        if (medium==='Gallery-wrapped canvas') {
          await page.selectOption('#canvas-sides','Black');
          assert.equal(await page.evaluate(()=>testControls.frame.style.border),'6px solid rgb(34, 34, 34)');
        }
      }
      await page.selectOption('#print-medium','Fine-art paper');
      await page.evaluate(()=>{
        const {finish,matting}=testControls;
        finish.selectedIndex=1;finish.dispatchEvent(new Event('change'));
        matting.selectedIndex=1;matting.dispatchEvent(new Event('change'));
      });
      assert.deepEqual(await page.evaluate(()=>[testControls.frame.style.background,testControls.mat.style.background,testControls.frame.style.border]),['rgb(37, 37, 37)','rgb(233, 223, 201)','']);
      await page.evaluate(()=>{testControls.matting.selectedIndex=2;testControls.matting.dispatchEvent(new Event('change'));});
      assert.equal(await page.evaluate(()=>testControls.mat.style.padding),'0px');
      // Native required-field validation must prevent any network request.
      await page.locator('button[type="submit"]').click();
      assert.equal(requests.length,0,file);
      await page.evaluate(()=>{
        for (const input of testControls.form.querySelectorAll('input[required]')) {
          if(input.type==='email') input.value='test@example.com';
          else if(input.type==='number') input.value='2';
          else input.value='Test Designer';
        }
      });
      const expectedFinish = await page.evaluate(()=>testControls.finish.value);
      for (const mode of ['error','network','success']) {
        responseMode=mode;
        await page.locator('button[type="submit"]').click();
        await page.waitForFunction(()=>!document.querySelector('button[type="submit"]').disabled || /Thank you/.test(document.querySelector('[role="status"]').textContent));
        await tick();
        const status=await page.locator('[role="status"]').textContent();
        assert.match(status,mode==='success'?/Thank you/:/could not|couldn.t|connection/i,file+' '+mode);
        if(mode!=='success') assert.equal(await page.locator('button[type="submit"]').isDisabled(),false,file);
      }
      assert.equal(requests.length,3,file);
      assert.equal(requests[2].method,'POST');
      assert.match(requests[2].headers.accept,/application\/json/);
      assert(requests[2].body.includes(snapshot.artwork),file);
      assert(requests[2].body.includes('Fine-art paper'),file);
      assert(requests[2].body.includes(expectedFinish),file);
      assert(!requests[2].body.includes('name="canvas_side_color"'),file);
      // Existing pages that reset on success must restore enabled paper controls.
      if(!await page.locator('button[type="submit"]').isDisabled()) {
        assert.equal(await page.locator('#print-medium').inputValue(),'Fine-art paper',file);
        assert.equal(await page.locator('#canvas-sides').isDisabled(),true,file);
      }
      assert.deepEqual(errors,[],file);
      console.log('PASS',snapshot.artwork,'— media, preview, validation, failure, retry, successful quote');
      await context.close();
    } finally {await browser.close();}
  }
    console.log(`${pages.length} artwork pages passed. No real quote requests sent.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
