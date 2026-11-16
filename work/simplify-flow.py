from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'public/app.js'
s=p.read_text(encoding='utf-8')
card_start=s.index('function cardHTML(')
rest=s[card_start:s.index('function route(){')]
prefix='''import {characterLabel,plainNote,recordedDate,productTypeLabel} from './content.js';
import {restoreGuides,saveGuides} from './finder-state.js';
import {entries,groups,findEntry} from './catalog.js';
import {newProfile,renderQuickFinder} from './finder-ui.js';
import {renderHelp} from './help.js';
import {icon,productArt} from './art.js';
import {parts,partTypes,makeBuild,checkCompatibility,partReason} from './builder.js';
import {parseCSV,prepareImport,validAffiliateURL} from './importer.js';
const $=(s,r=document)=>r.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rupiah=x=>x==null?'Harga belum tersedia':new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(x);
let guideStorage=null;try{guideStorage=sessionStorage;guideStorage.setItem('gadgetpick.storage-check','1');guideStorage.removeItem('gadgetpick.storage-check');}catch{guideStorage=null;}
const state={products:[],mode:'demo',entry:null,compare:[],guides:restoreGuides(guideStorage),build:null,budgetPC:null,purpose:null,csv:'',headers:[]};
const main=$('#main'),dialog=$('#detail-dialog');
history.scrollRestoration='manual';
let toastTimer,loadError=false,catalogLoading=true;
const demoNotice=(text='ผลิตภัณฑ์ตัวอย่าง')=>`<div class="demo-notice">${icon('info',15)}<span>${text}</span></div>`;
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3500);}
function showDialog(html){$('#dialog-content').innerHTML=html;if(!dialog.open)dialog.showModal();}
$('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
const mainCards=[
 {label:'Audio',id:'audio',art:'headphone',color:'mint',description:'TWS, IEM, earphone, headphone, dan headset.'},
 {label:'Smartphone & Tablet',id:'smartphone-tablet',art:'phone',color:'blue',description:'Smartphone dan tablet untuk keseharianmu.'},
 {label:'Laptop',id:'laptop',art:'laptop',color:'lilac',description:'Untuk kuliah, kerja, desain, atau gaming.'},
 {label:'Komponen PC',id:'komponen-pc',art:'ram',color:'sand',description:'Monitor, processor, GPU, RAM, SSD, HDD, dan lainnya.'}
];
function rootCard(c){return `<a class="category-choice ${c.color}" href="#rekomendasi/${c.id}"><span class="choice-art" aria-hidden="true">${productArt(c.art)}</span><span class="choice-arrow">${icon('arrow',18)}</span><div class="choice-copy"><h2>${esc(c.label)}</h2><p>${esc(c.description)}</p></div></a>`;}
function renderCategoryChooser(){
 main.innerHTML=`<section class="category-intro"><h1>Mau cari <em>apa?</em></h1><p>Pilih barangnya, lalu sesuaikan budget.</p></section><section class="category-choices main-category-choices" aria-label="Kategori">${mainCards.map(rootCard).join('')}</section><section class="special-category" aria-label="Rakit PC"><a class="category-choice builder-choice" href="#builder"><span class="choice-art pc-choice-art">${icon('pc',75)}</span><span class="choice-arrow">${icon('arrow',18)}</span><div class="choice-copy"><h2>Rakit PC</h2><p>Bantu susun satu PC sesuai kebutuhan dan budget.</p></div></a></section><p class="chooser-foot">Belum kenal istilahnya? <a href="#panduan">Buka panduan memilih →</a></p>`;
}
function renderCategoryGroup(id){
 const group=groups[id],items=entries.filter(e=>e.group===id);
 main.innerHTML=`<div class="catalog-breadcrumb"><a href="#rekomendasi">← Semua kategori</a><span>/</span><span>${esc(group.label)}</span></div><section class="category-intro"><h1>${esc(group.title)}</h1><p>${esc(group.description)}</p></section><section class="type-choices" aria-label="Jenis ${esc(group.label)}">${items.map(e=>`<a class="type-choice" href="#rekomendasi/${e.id}"><span class="type-icon">${icon(e.category==='Audio'?'audio':e.kind==='monitor'?'monitor':e.category==='HP'||e.category==='Tablet'?'phone':'pc',24)}</span><div><h2>${esc(e.label)}</h2><p>${esc(e.description)}</p></div><span class="type-arrow">${icon('arrow',17)}</span></a>`).join('')}</section>${id==='audio'?'<p class="group-builder-link"><a href="#panduan">Apa bedanya IEM, earphone, dan headset?</a></p>':id==='komponen-pc'?'<p class="group-builder-link">Mau susun satu PC lengkap? <a href="#builder">Buka Rakit PC →</a></p>':''}`;
}
function persistNeeds(){if(!saveGuides(guideStorage,state.guides))guideStorage=null;}
function renderFinder(showResults){
 const entry=state.entry,profile=state.guides[entry.id]||(state.guides[entry.id]=newProfile());
 const focusResults=()=>{const result=$('#finder-results-title');result?.scrollIntoView({block:'start'});result?.focus({preventScroll:true});};
 renderQuickFinder(main,entry,profile,state.products,{showResults,loading:catalogLoading,loadError,cardHTML,onCardClick:handleCardClick,onRetry:loadCatalog,onSort:()=>{renderFinder(true);focusResults();},onSubmit:()=>{persistNeeds();const hash='#rekomendasi/'+entry.id+'/hasil';if(location.hash!==hash)history.pushState(null,'',hash);route();focusResults();}});
}
'''
prefix=prefix.replace('ผลิตภัณฑ์ตัวอย่าง','Produk dan harga ini masih contoh untuk mencoba alurnya.')
rest=rest.replace("${p.demo?'Data contoh':'Sumber tercantum'}", "${p.demo?'Contoh':'Kitab Audio'}")
rest=rest.replace('Skenario kurasi · belum dinilai','Produk contoh')
rest=rest.replace('Alasan & sumber','Lihat detail')
rest=rest.replace("function handleCardClick(e){const detail=e.target.closest('[data-detail]'),compare=e.target.closest('[data-compare]');if(detail)openProduct(detail.dataset.detail);if(compare)toggleCompare(compare.dataset.compare);if(e.target.closest('[data-reset]'))resetFilters();if(e.target.closest('[data-retry]'))loadCatalog();}", "function handleCardClick(e){const detail=e.target.closest('[data-detail]'),compare=e.target.closest('[data-compare]');if(detail)openProduct(detail.dataset.detail);if(compare)toggleCompare(compare.dataset.compare);}")
start=rest.index('function openProduct(')
end=rest.index('function comparisonType(')
rest=rest[:start]+'''function openProduct(id){
 const p=state.products.find(p=>p.id===id);if(!p)return;
 const sources=p.evidence.sources.map(s=>`<p><strong>${esc(s.creator)}</strong> · <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a></p>`).join('');
 const owner=p.affiliate.owner==='fernanda'?'Fernanda':p.affiliate.owner==='site'?'pengelola situs':null;
 showDialog(`<div class="dialog-heading"><div class="art-wrap ${esc(p.color)}">${productArt(p.visual)}</div><div><div class="eyebrow">${esc(productTypeLabel(p.specs.subtype||p.category))}${p.demo?' · CONTOH':''}</div><h2 id="dialog-title">${esc(p.name)}</h2><div class="product-price">${rupiah(p.price)}<span class="price-caption">${p.demo?'harga simulasi':'dicatat '+recordedDate(p.priceObservedAt)}</span></div></div></div>${p.demo?demoNotice('Produk ini fiktif. Dipakai untuk mencoba alur, bukan sebagai rekomendasi belanja.'):''}<div class="dialog-block"><h3>Gambaran singkat</h3><p>${esc(plainNote(p.headline))}</p></div><div class="dialog-block"><h3>Yang perlu kamu tahu</h3><p>${esc(plainNote(p.minus))}</p></div><div class="dialog-block"><h3>Review & sumber</h3>${sources||'<p>Belum ada review untuk produk contoh ini.</p>'}${!p.demo?`<p>Ringkasan ini mengikuti penilaian Fernanda. ${esc(p.tier)} · Value: ${esc(p.specs.valueTier||'belum tercatat')}. Bandingkan penilaian dalam jenis audio yang sama.</p><p>${esc(p.specs.priceSource||'Harga dari sumber')}. Harga di Shopee bisa berbeda karena toko, varian, atau promo.</p>${p.specs.reviewUrl?`<p><a href="${esc(p.specs.reviewUrl)}" target="_blank" rel="noopener noreferrer">Tonton / baca review ↗</a></p>`:''}`:''}</div><div class="dialog-block">${owner?`<p>Komisi dari tautan ini diterima oleh ${owner}.${p.affiliate.owner==='fernanda'?' Kami memakai tautan asli Fernanda.':''}</p>`:'<p>Produk contoh ini belum punya tautan pembelian.</p>'}${p.affiliate.url&&!p.demo&&validAffiliateURL(p.affiliate.url)?`<a class="primary" href="${esc(p.affiliate.url)}" target="_blank" rel="sponsored noopener noreferrer">Cek di Shopee ↗</a>`:''}</div>`);
}
''' + rest[end:]
rest=rest.replace("if($('#cards')){renderCards();$(`[data-compare=\"${id}\"]`)?.focus({preventScroll:true});}if($('#guided-cards'))renderNeedsResults();renderTray();", 'updateCompareButtons();renderTray();')
rest=rest.replace("if($('#cards'))renderCards();if($('#guided-cards'))renderNeedsResults();", 'updateCompareButtons();')
rest=rest.replace('function renderTray(){', '''function updateCompareButtons(){document.querySelectorAll('[data-compare]').forEach(b=>{const p=state.products.find(p=>p.id===b.dataset.compare);const chosen=state.compare.includes(b.dataset.compare);b.setAttribute('aria-pressed',String(chosen));b.setAttribute('aria-label',(chosen?'Hapus dari':'Tambahkan ke')+' perbandingan: '+p.name);b.innerHTML=icon(chosen?'check':'plus',16);});}
function renderTray(){''')
rest=rest.replace('Mulai dari budget.<br>Jadi satu <em>rakitan.</em>','Rakit PC sesuai <em>budgetmu.</em>')
rest=rest.replace('Tentukan kebutuhan, lihat alokasi komponennya, lalu pahami komprominya. Pemeriksaan memakai aturan teknis yang bisa ditelusuri.','Isi budget dan pilih pemakaian utamanya. Kami bantu susun daftar komponennya.')
rest=rest.replace('Semua nama komponen, spesifikasi, dan harga di builder ini adalah data contoh fiktif. Hasil ini untuk menguji alur, bukan panduan membeli komponen nyata.','Builder ini masih memakai komponen dan harga contoh. Hasilnya belum untuk belanja.')
rest=rest.replace('Kebutuhan dulu, rakitan kemudian.','Rakitanmu akan muncul di sini.')
rest=rest.replace('Isi budget dan pilih penggunaan utama. Susunan komponen baru muncul setelah kamu menekan Susun rakitan.','Isi budget dan pilih pemakaian, lalu klik Susun rakitan.')
start=rest.index('function renderMethod(){')
end=rest.index('function renderData(){')
rest=rest[:start]+'''function renderMethod(){main.innerHTML=`<section class="page-intro"><h1>Dari mana rekomendasinya?</h1><p>Kami merangkum review agar kamu lebih mudah memilih. Sumber aslinya bisa dibuka di detail produk.</p></section><div class="two-columns"><section class="panel method-panel"><h2>Sumber audio</h2><p>Rekomendasi audio berasal dari Kitab Audio Fernanda Gunsan. Ringkasan mengikuti catatan dan penilaiannya, bukan hasil pengujian kami.</p><p>Tier dan value bersifat subjektif. Bandingkan dalam jenis audio yang sama: penilaian IEM tidak langsung disamakan dengan TWS atau headphone.</p><p><a href="https://docs.google.com/spreadsheets/d/1KXDCrMErS1ZjjJhxjTYqNax1bjWWl4peXv0eaLMlxVc/edit" target="_blank" rel="noopener noreferrer">Buka Kitab Audio ↗</a> · <a href="https://lynk.id/fernandagunsan" target="_blank" rel="noopener noreferrer">Profil Fernanda ↗</a></p></section><section class="panel method-panel"><h2>Harga bisa berubah</h2><p>Harga audio dicatat dari Kitab pada 16 November 2026. Sebagian harga merujuk ke toko atau varian yang berbeda dari link Shopee.</p><p>Cek harga akhir, stok, garansi, dan ongkir di toko sebelum membeli.</p></section><section class="panel method-panel"><h2>Komisi pembelian</h2><p>Tautan dari Kitab Audio tetap memakai affiliate asli Fernanda. Komisi dari pembelian melalui tautan itu menjadi miliknya.</p><p>Untuk sumber lain, pemilik affiliate dicantumkan di detail produk.</p></section><section class="panel method-panel"><h2>Yang masih contoh</h2><p>Kategori selain audio dan Rakit PC masih memakai data fiktif untuk mencoba alurnya. Produk contoh diberi label dan tidak memiliki tautan pembelian.</p><p>Jenis produk yang belum punya data akan ditampilkan apa adanya, tanpa rekomendasi pengganti dari jenis lain.</p></section></div>`;}
''' + rest[end:]
rest=rest.replace('RUANG KERJA KURASI','KELOLA PRODUK').replace('Dari CSV.<br>Siap <em>diperiksa.</em>','Impor produk dari <em>CSV.</em>')
suffix='''function route(){
 if(dialog.open)dialog.close();
 let page=(location.hash.slice(1)||'rekomendasi').split('?')[0];
 const aliases={'rekomendasi/hp':'rekomendasi/smartphone-tablet/smartphone','rekomendasi/tablet':'rekomendasi/smartphone-tablet/tablet','rekomendasi/monitor':'rekomendasi/komponen-pc/monitor','rekomendasi/komponen-pc/upgrade':'rekomendasi/komponen-pc'};
 const oldBase=page.replace(/\\/(hasil|katalog)$/,'');
 if(aliases[oldBase]){page=aliases[oldBase];history.replaceState(null,'','#'+page);}
 if(['rekomendasi/audio/hasil','rekomendasi/audio/katalog'].includes(page)){page='rekomendasi/audio';history.replaceState(null,'','#'+page);}
 const showResults=page.endsWith('/hasil'),id=page.replace(/^rekomendasi\\//,'').replace(/\\/hasil$/,''),entry=findEntry(id),group=groups[id];
 document.title=(entry?'Rekomendasi '+entry.label:group?group.label:({builder:'Rakit PC',metode:'Sumber rekomendasi',panduan:'Panduan memilih',data:'Kelola produk'})[page]||'Mau cari apa?')+' — pilih.';
 const nav=entry||group?'rekomendasi':page;
 document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===nav)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 if(page==='builder')renderBuilder();
 else if(page==='metode')renderMethod();
 else if(page==='panduan')renderHelp(main);
 else if(page==='data')renderData();
 else if(group)renderCategoryGroup(id);
 else if(entry){
   state.entry=entry;const p=state.guides[id]||(state.guides[id]=newProfile());
   if(showResults&&!p.submitted)history.replaceState(null,'','#rekomendasi/'+id);
   renderFinder(showResults&&p.submitted);
 }else renderCategoryChooser();
 renderTray();
}
window.addEventListener('hashchange',()=>{if(location.hash==='#main'){main.focus();return;}route();window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});});
document.addEventListener('click',e=>{const a=e.target.closest('a[href="#rekomendasi"]');if(a&&location.hash==='#rekomendasi'){e.preventDefault();route();window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});}});
async function loadCatalog(){loadError=false;catalogLoading=true;try{const response=await fetch('/api/catalog');if(!response.ok)throw Error('Catalog unavailable');const data=await response.json();state.products=data.products;state.mode=data.mode;}catch{loadError=true;state.products=[];}catalogLoading=false;route();}
route();loadCatalog();
'''
p.write_text(prefix+rest+suffix,encoding='utf-8')

p=root/'public/index.html'
s=p.read_text(encoding='utf-8').replace('TECH, MADE SIMPLE','GADGET & PC').replace('Lebih sedikit bingung.<br>Lebih banyak yang pas.','Rekomendasi gadget dan PC.').replace('Nama & identitas sementara.','Preview lokal.').replace('Audio dikreditkan ke Fernanda Gunsan. Profil bertanda CONTOH & PC builder memakai simulasi.','Audio dari Kitab Audio Fernanda Gunsan. Produk berlabel CONTOH dan Rakit PC masih memakai data fiktif.').replace('Sumber, cara kurasi, dan komisi ↗','Sumber rekomendasi & komisi ↗')
p.write_text(s,encoding='utf-8')

p=root/'public/content.js'
s=p.read_text(encoding='utf-8')
s=s.replace("export const productTypeLabel=value=>({'Headphone wireless':'Headphone tanpa kabel',IEM:'Earphone berkabel (IEM)',TWS:'Earphone tanpa kabel (TWS)'})[value]||value;", "export const productTypeLabel=value=>value==='HP'?'Smartphone':value;")
p.write_text(s,encoding='utf-8')
