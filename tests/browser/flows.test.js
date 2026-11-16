import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const base=process.env.GADGETPICK_BASE_URL||'http://127.0.0.1:8787';
let browser;
before(async()=>{
 await mkdir('test-results',{recursive:true});
 let ready=false;
 for(let i=0;i<90;i++){
  try{const r=await fetch(base+'/api/catalog');if(r.ok){ready=true;break;}}catch{}
  await new Promise(r=>setTimeout(r,1000));
 }
 assert.ok(ready,'Worker/catalog must be ready');
 browser=await chromium.launch();
});
after(async()=>{await browser?.close();});
async function visit(page,route='rekomendasi'){
 await page.goto(base+'/#'+route);
 await page.locator('main h1').waitFor();
 await page.waitForFunction(route=>document.querySelector('main')?.dataset.route===route&&!document.querySelector('main')?.textContent.includes('Memuat produk'),route);
}
async function withPage(width,fn){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>{document.addEventListener('securitypolicyviolation',e=>console.error('CSP violation: '+e.violatedDirective));});
 try{await fn(page);assert.deepEqual(errors,[],'No browser errors or CSP violations');}
 finally{await context.close();}
}
async function emitVisual(page,name){
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 const bytes=await page.screenshot({type:'jpeg',quality:50,fullPage:true});
 const encoded=bytes.toString('base64');
 console.log('VISUAL_START '+name);
 for(let i=0;i<encoded.length;i+=6000)console.log(encoded.slice(i,i+6000));
 console.log('VISUAL_END '+name);
}
const phone='rekomendasi/smartphone-tablet/smartphone';
async function openFilters(page){const panel=page.locator('#finder-filter-panel');if(await panel.count()&&!await panel.getAttribute('open').then(v=>v!==null))await panel.locator('summary').click();}
async function audioResults(page,type='tws'){
 await visit(page,'rekomendasi/audio/'+type);
 await openFilters(page);
 await page.getByLabel('Lihat semua rentang harga',{exact:true}).check();
 await page.getByRole('checkbox',{name:'Belum ada prioritas khusus',exact:true}).check();
 await page.getByRole('button',{name:'Lihat rekomendasi',exact:true}).click();
 await page.locator('.product-card').first().waitFor();
}
for(const width of [320,360,390,768,1280]){
 test('All routes fit viewport '+width,{timeout:120000},async()=>{
  await withPage(width,async page=>{
   const routes=['rekomendasi','rekomendasi/audio','rekomendasi/smartphone-tablet','rekomendasi/komponen-pc',phone,'builder','panduan','metode','data'];
   const entryRoutes=['audio/tws','audio/iem','audio/earphone','audio/headphone','audio/headset','audio/ows','smartphone-tablet/tablet','laptop','komponen-pc/monitor','komponen-pc/processor','komponen-pc/ram','komponen-pc/ssd','komponen-pc/hdd','komponen-pc/gpu','komponen-pc/motherboard','komponen-pc/psu','komponen-pc/casing','komponen-pc/cooler'];
   for(const route of [...routes,...entryRoutes.map(x=>'rekomendasi/'+x)]){
    await visit(page,route);
    const sizes=await page.evaluate(()=>({content:document.documentElement.scrollWidth,viewport:innerWidth}));
    assert.ok(sizes.content<=sizes.viewport+1,route+' overflows '+width+': '+JSON.stringify(sizes));
    const small=await page.locator('input:not([type=checkbox]):not([type=radio]):not([type=file]),select').evaluateAll(els=>els.filter(e=>e.getClientRects().length&&parseFloat(getComputedStyle(e).fontSize)<16).map(e=>e.id));
    assert.deepEqual(small,[],'Controls avoid mobile focus zoom');
   }
   await visit(page);
   await page.waitForFunction(()=>!document.querySelector('.availability')?.textContent.includes('Memuat'));
   await page.screenshot({path:'test-results/home-'+width+'.png',fullPage:true});
   if(width===390||width===1280)await emitVisual(page,'home-'+width);
   await visit(page,phone);
   await page.getByRole('button',{name:/Premium/}).click();
   await page.getByRole('checkbox',{name:/Gaming & performa/}).check();
   assert.equal(await page.locator('meter').count(),5);
   assert.equal(await page.locator('[style]').count(),0,'No blocked inline chart styles');
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   await page.screenshot({path:'test-results/phone-'+width+'.png',fullPage:true});
   if(width===390)await emitVisual(page,'phone-'+width);
  });
 });
}
test('Phone limits, priority order, budget validation, session and reset',{timeout:120000},async()=>{
 await withPage(390,async page=>{
  await visit(page,phone);
  await page.getByRole('button',{name:/Entry-level/}).click();
  await page.getByRole('checkbox',{name:/Gaming & performa/}).check();
  const low=Number(await page.locator('meter').nth(1).getAttribute('value'));
  await page.getByRole('button',{name:/Premium/}).click();
  const high=Number(await page.locator('meter').nth(1).getAttribute('value'));
  assert.ok(high>8&&high>low,'Flagship simulation keeps strong secondary aspects');
  await page.getByRole('checkbox',{name:/Kamera foto/}).check();
  await page.getByRole('checkbox',{name:/Daya tahan baterai/}).click();
  assert.equal(await page.locator('[name=priorities]:checked').count(),2);
  assert.ok(await page.locator('#priority-feedback').isVisible());
  await page.getByRole('button',{name:'Jadikan utama',exact:true}).click();
  assert.match(await page.locator('.selected-priorities li').first().innerText(),/Kamera/);
  await page.getByRole('checkbox',{name:/Serba bisa/}).check();
  assert.equal(await page.locator('[name=priorities]:checked').count(),1);
  await page.getByLabel('Harga dari',{exact:true}).fill('40000000');
  assert.ok(await page.locator('#budget-feedback').isVisible());
  assert.equal(await page.locator('meter').count(),0);
  await page.getByRole('button',{name:/Premium/}).click();
  await page.reload();
  await page.locator('meter').first().waitFor();
  assert.equal(await page.getByLabel('Harga sampai',{exact:true}).inputValue(),'30000000');
  assert.ok(await page.getByRole('checkbox',{name:/Serba bisa/}).isChecked());
  await page.getByLabel('Lihat semua rentang harga',{exact:true}).check();
  assert.equal(await page.locator('meter').count(),0);
  assert.ok(await page.getByLabel('Harga dari',{exact:true}).isDisabled());
  await page.getByRole('button',{name:'Reset pilihan',exact:true}).click();
  assert.equal(await page.locator('[name=priorities]:checked').count(),0);
  assert.equal(await page.getByLabel('Harga dari',{exact:true}).inputValue(),'');
  await page.reload();
  await page.locator('#finder-form').waitFor();
  assert.equal(await page.locator('[name=priorities]:checked').count(),0);
 });
});
test('Real audio, filters, sorting, details, sources, comparison and empty result',{timeout:120000},async()=>{
 await withPage(360,async page=>{
  const catalog=await (await page.request.get(base+'/api/catalog')).json();
  assert.equal(catalog.mode,'live');
  assert.ok(catalog.products.length>0&&catalog.products.every(p=>!p.demo));
  assert.ok(catalog.products.every(p=>p.category==='Audio'&&p.affiliate.owner==='fernanda'));
  await audioResults(page);
  assert.equal(await page.locator('.product-card').count(),3);
  await page.getByRole('button',{name:'Lihat pilihan lainnya',exact:true}).click();
  assert.equal(await page.locator('.product-card').count(),4);
  await page.getByLabel('Urutkan',{exact:true}).selectOption('low');
  const names=await page.locator('.card-title').allTextContents();
  const ordered=names.map(name=>catalog.products.find(p=>p.name===name).price);
  assert.deepEqual(ordered,[...ordered].sort((a,b)=>a-b));
  await page.locator('[data-detail]').first().click();
  await page.locator('dialog[open]').waitFor();
  const product=catalog.products.find(p=>p.name===names[0]);
  assert.equal(await page.getByRole('link',{name:'Cek di Shopee ↗',exact:true}).getAttribute('href'),product.affiliate.url);
  assert.ok(await page.getByRole('link',{name:'Cek di Shopee ↗',exact:true}).getAttribute('rel').then(r=>r.includes('sponsored')));
  assert.match(await page.locator('#dialog-content').innerText(),/Fernanda/);
  await page.getByRole('button',{name:'Tutup dialog',exact:true}).click();
  for(let i=0;i<4;i++)await page.locator('[data-compare]').nth(i).click();
  assert.equal(await page.locator('[data-compare][aria-pressed=true]').count(),3);
  await page.locator('#open-compare').click();
  await page.locator('dialog[open]').waitFor();
  assert.equal(await page.locator('.dialog-compare thead th').count(),4);
  await page.getByRole('button',{name:'Tutup dialog',exact:true}).click();
  await audioResults(page,'iem');
  await page.locator('[data-compare]').first().click();
  assert.match(await page.locator('#toast').innerText(),/Bandingkan sesama/);
  await page.getByRole('button',{name:'Hapus',exact:true}).click();
  assert.ok(await page.locator('#compare-tray').isHidden());
  await openFilters(page);
  await page.getByRole('checkbox',{name:'Lihat semua rentang harga',exact:true}).uncheck();
  await page.getByLabel('Harga dari',{exact:true}).fill('0');
  await page.getByLabel('Harga sampai',{exact:true}).fill('1');
  await page.getByRole('button',{name:'Perbarui rekomendasi',exact:true}).click();
  assert.equal(await page.locator('.product-card').count(),0);
  assert.match(await page.locator('#finder-results').innerText(),/Belum ada/);
 });
});
test('Builder budget, manual incompatibility, reset and clipboard fallback',{timeout:120000},async()=>{
 await withPage(390,async page=>{
  await visit(page,'builder');
  await page.getByRole('button',{name:'8 juta',exact:true}).click();
  await page.getByRole('radio',{name:'Gaming',exact:true}).check();
  await page.getByRole('button',{name:/Susun rakitan/}).click();
  await page.locator('.part-row').first().waitFor();
  assert.equal(await page.locator('.part-row').count(),8);
  assert.equal(await page.locator('.check').count(),9);
  const cpu=await page.locator('#part-cpu').inputValue();
  await page.locator('#part-motherboard').selectOption(cpu==='cpu-a'?'board-b':'board-a');
  assert.ok(await page.locator('.check.fail').count()>0);
  await page.getByRole('button',{name:'Susun ulang',exact:true}).click();
  assert.equal(await page.locator('.check.fail').count(),0);
  await page.screenshot({path:'test-results/builder-390.png',fullPage:true});
  await page.context().grantPermissions(['clipboard-read','clipboard-write']);
  await page.getByRole('button',{name:'Salin daftar rakitan',exact:true}).click();
  const text=await page.evaluate(()=>navigator.clipboard.readText());
  assert.match(text,/RAKITAN SIMULASI/);
  assert.match(text,/fiktif/);
  await page.getByLabel('Budget unit PC (rupiah)',{exact:true}).fill('1');
  await page.getByRole('button',{name:/Susun rakitan/}).click();
  assert.ok(await page.locator('.error-box').isVisible());
 });
});
test('CSV preview and help keep drafts and simulation boundaries clear',{timeout:120000},async()=>{
 await withPage(320,async page=>{
  await visit(page,'data');
  await page.getByRole('button',{name:'Coba CSV sintetis',exact:true}).click();
  await page.getByRole('button',{name:/Periksa baris/}).click();
  assert.match(await page.locator('#import-results').innerText(),/0 valid · 2 perlu diperbaiki/);
  assert.match(await page.locator('#import-results').innerText(),/Belum ada yang disimpan/);
  await visit(page,'panduan');
  await page.getByText('Tier dan value',{exact:true}).click();
  assert.match(await page.locator('details[open]').innerText(),/subjektif|reviewer/);
  await visit(page,'rekomendasi/komponen-pc/hdd');
  assert.equal(await page.locator('#finder-form').count(),0);
  assert.match(await page.locator('main').innerText(),/belum tersedia/);
 });
});
test('Catalog failure retries without substituting fake products',{timeout:120000},async()=>{
 await withPage(390,async page=>{
  await page.route('**/api/catalog',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"Temporary test failure"}'}));
  // Expected test-injected network errors are inspected separately in this case.
  page.removeAllListeners('console');
  await visit(page,'rekomendasi/audio/tws');
  await page.getByRole('button',{name:'Coba lagi',exact:true}).waitFor();
  assert.equal(await page.locator('.product-card').count(),0);
  await page.unroute('**/api/catalog');
  await page.getByRole('button',{name:'Coba lagi',exact:true}).click();
  await page.locator('#finder-form').waitFor();
  assert.equal(await page.locator('.demo-notice').count(),0);
 });
});

test('Header search finds real products, categories and honest empty results',{timeout:120000},async()=>{
 await withPage(390,async page=>{
  await visit(page);
  await page.waitForFunction(()=>document.querySelectorAll('.home-product-grid .product-card').length>0);
  const name=await page.locator('.home-product-grid .card-title').first().innerText();
  await page.getByLabel('Cari produk atau kategori',{exact:true}).fill(name);
  await page.getByRole('button',{name:'Cari',exact:true}).click();
  await page.getByRole('heading',{name:'Hasil pencarian',exact:true}).waitFor();
  assert.ok(await page.locator('[data-search-product]').count()>0);
  await page.locator('[data-search-product]').first().click();
  assert.equal(await page.locator('#dialog-title').innerText(),name);
  assert.ok(await page.getByRole('link',{name:'Cek di Shopee ↗',exact:true}).isVisible());
  await page.getByRole('button',{name:'Tutup dialog',exact:true}).click();
  await page.getByLabel('Cari produk atau kategori',{exact:true}).fill('Smartphone');
  await page.getByRole('button',{name:'Cari',exact:true}).click();
  await page.locator('.search-category-list').getByRole('link',{name:'Smartphone',exact:true}).click();
  await page.locator('#finder-form').waitFor();
  assert.equal(await page.locator('main h1').innerText(),'Simulasi Smartphone');
  await page.getByLabel('Cari produk atau kategori',{exact:true}).fill('zz-no-real-product-123');
  await page.getByRole('button',{name:'Cari',exact:true}).click();
  assert.match(await page.locator('.search-empty').innerText(),/Belum ada yang cocok/);
  assert.equal(await page.locator('[data-search-product]').count(),0);
  await page.getByRole('button',{name:'Tutup dialog',exact:true}).click();
 });
});
test('Home budget goes to simulation; mobile filters collapse without losing draft',{timeout:120000},async()=>{
 await withPage(360,async page=>{
  await visit(page);
  const budget=page.getByLabel('Budget Smartphone',{exact:true});
  await budget.press('Home');
  for(let i=0;i<18;i++)await budget.press('ArrowRight');
  assert.match(await page.locator('#hero-budget-value').innerText(),/10.000.000/);
  await page.getByRole('button',{name:/Coba simulasi Smartphone/}).click();
  await page.locator('#finder-form').waitFor();
  assert.equal(await page.getByLabel('Harga sampai',{exact:true}).inputValue(),'10000000');
  assert.equal(await page.locator('.product-card').count(),0);
  await visit(page,'rekomendasi/audio/tws');
  assert.ok(await page.locator('#finder-form').isHidden());
  assert.equal(await page.locator('.catalog-preview .product-card').count(),4);
  await openFilters(page);
  await page.getByLabel('Harga dari',{exact:true}).fill('200000');
  await page.getByLabel('Harga sampai',{exact:true}).fill('900000');
  await page.locator('#finder-filter-panel>summary').click();
  assert.ok(await page.locator('#finder-form').isHidden());
  await openFilters(page);
  assert.equal(await page.getByLabel('Harga sampai',{exact:true}).inputValue(),'900000');
  await page.setViewportSize({width:1280,height:900});
  await page.locator('#finder-form').waitFor({state:'visible'});
  await page.screenshot({path:'test-results/catalog-1280.png',fullPage:true});
  await emitVisual(page,'catalog-1280');
 });
});
