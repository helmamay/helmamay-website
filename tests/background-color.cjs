const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','background-color.js'),'utf8');
async function test(fail=false){
 const elements={};function el(id){return elements[id]||=( {id,value:'',checked:false,disabled:false,dataset:{},style:{},listeners:{},attrs:{},addEventListener(n,f){this.listeners[n]=f},setAttribute(n,v){this.attrs[n]=v},setCustomValidity(v){this.validity=v},getAttribute(n){return this.attrs[n]},querySelectorAll(){return swatches}} );}
 const swatches=['#FFFFFF','#3F86B8','#3F677A','#D7DCD2','#E9DFCE'].map((color,i)=>{const e=el('swatch'+i);e.dataset.backgroundColor=color;return e});
 const targets=[el('original'),el('preview')];targets.forEach(t=>t.attrs.src='Theia.png');
 el('background-controls').dataset.mask='theia-background-mask.json';el('background-controls').disabled=true;
 const pixels=new Uint8ClampedArray([253,254,255,255,201,54,127,255,255,255,255,255]);let result;
 const context={drawImage(){},getImageData(){return {data:pixels}},putImageData(p){result=Array.from(p.data)}};
 class Image{constructor(){this.naturalWidth=3;this.naturalHeight=1}decode(){return Promise.resolve()}}
 const sandbox={document:{getElementById:el,querySelectorAll:()=>targets,createElement:()=>({getContext:()=>context,toDataURL:()=> 'data:image/png;test'})},Image,fetch:async()=>({ok:!fail,json:async()=>({width:3,height:1,runs:[[0,1],[2,1]]})}),setTimeout:f=>f()};
 vm.runInNewContext(source,sandbox);await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));
 if(fail){assert.equal(el('background-value').value,'Original white background');assert.equal(el('background-controls').disabled,true);assert.match(el('background-status').textContent,/unavailable/);return}
 assert.deepEqual(result,[253,254,255,0,201,54,127,255,255,255,255,0]);
 assert.equal(el('background-value').value,'Original white background');assert.equal(el('background-picker').disabled,true);
 swatches[2].listeners.click();assert.equal(el('background-value').value,'#3F677A');assert.equal(targets[0].style.backgroundColor,'#3F677A');assert.equal(targets[1].src,'data:image/png;test');assert.equal(el('background-reference').disabled,false);
 el('background-hex').value='#aabbcc';el('background-hex').listeners.input();assert.equal(el('background-value').value,'#AABBCC');
 el('background-hex').value='bad';el('background-hex').listeners.input();assert.ok(el('background-hex').validity);assert.equal(el('background-value').value,'#AABBCC');
 el('background-reset').listeners.click();assert.equal(el('background-value').value,'Original white background');assert.equal(targets[0].src,'Theia.png');assert.equal(el('background-hex').validity,'');
 swatches[1].listeners.click();el('background-custom').checked=false;el('quote-form').listeners.reset();assert.equal(el('background-value').value,'Original white background');
}
(async()=>{await test();await test(true);console.log('PASS: mask preserves foreground RGB, both previews update, swatches/HEX synchronize, invalid input rejected, quote value/reset/failure fallback work')})().catch(e=>{console.error(e);process.exit(1)});
