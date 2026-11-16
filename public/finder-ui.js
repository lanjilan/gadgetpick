import {groups,matchesEntry} from './catalog.js';
import {priorityOptions} from './decision-config.js';
import {cleanAnswers,validationErrors,mapRecommendations} from './finder.js';
import {plainNote} from './content.js';
import {simulatePhoneProfile} from './phone-profile.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=x=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(x);
const rangeText=a=>a.unlimited?'Semua rentang harga':money(a.minPrice)+' – '+money(a.maxPrice);
const compactRange=r=>{const n=x=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(x);return r.min>=1000000?'Rp'+n(r.min/1000000)+'–'+n(r.max/1000000)+' juta':r.max<1000000?'Rp'+n(r.min/1000)+'–'+n(r.max/1000)+' ribu':money(r.min)+' – '+money(r.max);};
export const newProfile=()=>({answers:{minPrice:null,maxPrice:null,unlimited:false,priorities:[],constraints:{}},submitted:false,sort:'recommended',limit:3});
const options=(items,value)=>items.map(([id,label])=>`<option value="${id}" ${value===id?'selected':''}>${esc(label)}</option>`).join('');
const noPriorityLabel=entry=>entry.category==='Audio'?'Belum ada prioritas khusus':'Seimbang / bantu pilih';
function priorityHTML(entry,a){return [...priorityOptions(entry),...(entry.category==='HP'?[]:[{value:'any',label:noPriorityLabel(entry)}])].map(o=>{const rank=(a.priorities||[]).indexOf(o.value)+1;return `<label class="priority-option"><input type="checkbox" name="priorities" value="${o.value}" ${rank?'checked':''}><span><strong>${esc(o.label)}</strong>${o.note?`<small>${esc(o.note)}</small>`:''}</span><span class="priority-rank" aria-hidden="true" ${!rank||o.value==='any'?'hidden':''}>${rank||''}</span></label>`;}).join('');}
function priorityOrderHTML(entry,selected){
 if(!selected.length)return '<p class="field-help">Pilihan pertama menjadi prioritas utama. Pilihan kedua menjadi tambahan.</p>';
 if(selected[0]==='any')return '<p class="field-help">Belum ada satu prioritas yang didahulukan. Kami tampilkan pilihan awal beserta pertimbangannya.</p>';
 return '<ol class="selected-priorities">'+selected.map((id,i)=>{const item=priorityOptions(entry).find(o=>o.value===id);return `<li><span class="selected-priority-number">${i+1}</span><div><small>${i===0?'Prioritas utama':'Prioritas tambahan'}</small><strong>${esc(item?.label||id)}</strong></div>${i===1?'<button type="button" class="priority-promote" data-promote-priority>Jadikan utama</button>':''}</li>`;}).join('')+'</ol>';
}
function buyingNote(entry){
  if(entry.category==='Audio')return 'Cek koneksi, kenyamanan, dan review mikrofon jika ingin dipakai ngobrol.';
  if(entry.category==='Komponen PC')return ({ram:'Cek generasi DDR dan kapasitas yang didukung motherboard.',ssd:'Cek slot dan interface storage yang didukung PC-mu.',hdd:'Cek interface dan ruang drive di casing.',processor:'Cek socket motherboard dan dukungan BIOS.',gpu:'Cek ruang casing, daya PSU, dan konektornya.',motherboard:'Cocokkan socket processor, jenis RAM, dan ukuran casing.',psu:'Cek kebutuhan daya dan konektor komponenmu.',casing:'Cek ukuran motherboard, GPU, dan cooler.',cooler:'Cek mounting socket dan ruang di casing.'})[entry.kind]||'Cek kecocokannya dengan PC-mu sebelum membeli.';
  if(entry.category==='Monitor')return 'Cek port dan kemampuan output perangkatmu sebelum membeli monitor.';
  if(entry.category==='Tablet')return 'Butuh stylus atau aplikasi tertentu? Cek dukungannya dulu; tidak semua tablet bisa menggantikan laptop.';
  if(entry.category==='Laptop')return 'Untuk aplikasi atau game tertentu, cek review performanya. Periksa juga RAM, port, dan bobotnya.';
  return 'Cek varian, garansi, dan harga akhir di toko.';
}
export function renderQuickFinder(main,entry,profile,products,ctx){
 const a=profile.answers,draft=profile.draft||a,group=groups[entry.group],show=ctx.showResults&&profile.submitted;
 const parent=group?'#rekomendasi/'+entry.group:'#rekomendasi';
 const heading=`<div class="catalog-breadcrumb"><a href="#rekomendasi">Kategori</a>${group?`<span>/</span><a href="${parent}">${esc(group.label)}</a>`:''}<span>/</span><span>${esc(entry.label)}</span></div><section class="finder-intro"><h1>Rekomendasi ${esc(entry.label)}</h1><p>Tentukan rentang harga dan pilih apa yang paling penting buatmu. Kami bantu menimbang pilihannya, beserta kelebihan dan kekurangannya.</p></section>`;
 if(ctx.loadError){main.innerHTML=heading+'<section class="empty"><h2>Produknya belum bisa dimuat.</h2><p>Coba muat ulang sebentar lagi.</p><button class="secondary" id="retry-catalog">Coba lagi</button></section>';main.querySelector('#retry-catalog').onclick=ctx.onRetry;return;}
 if(ctx.loading){main.innerHTML=heading+'<p role="status">Memuat produk…</p>';return;}
 const available=products.filter(p=>matchesEntry(p,entry));
 if(!available.length&&entry.category!=='HP'){main.innerHTML=heading+`<section class="empty"><h2>Rekomendasi ${esc(entry.label)} belum tersedia.</h2><p>Kami belum punya data produk untuk jenis ini.</p><a class="secondary" href="${parent}">Pilih jenis lain</a></section>`;return;}
 const simulationOnly=entry.category==='HP'&&!available.length;
 const demoOnly=available.length>0&&available.every(p=>p.demo);
 main.innerHTML=heading+`${simulationOnly?'<aside class="phone-unavailable-note" role="status"><span class="phone-eyebrow">PANDUAN INTERAKTIF</span><h2>Belum ada rekomendasi produk Smartphone.</h2><p>Katalog HP asli masih disiapkan. Kamu tetap bisa mencoba simulasi profil sesuai budget dan prioritas tanpa produk atau skor rekaan.</p></aside>':''}${demoOnly?'<p class="demo-notice">Kategori ini masih memakai produk dan harga contoh. Kamu bisa mencoba cara memilih dan penjelasan hasilnya; belum untuk belanja.</p>':''}<form id="finder-form" class="quick-finder considered-finder${entry.category==='HP'?' phone-finder':''}" novalidate>
 <fieldset class="price-section"><legend>Rentang harga yang kamu cari</legend><div class="price-range-inputs"><label for="min-price">Dari<div class="guide-budget"><span>Rp</span><input id="min-price" aria-label="Harga dari" name="minPrice" type="number" inputmode="numeric" min="0" max="100000000" step="1" value="${esc(draft.minPrice??'')}" placeholder="Contoh: ${entry.priceRanges[0].min}" ${draft.unlimited?'disabled':''} aria-describedby="finder-error"></div></label><span class="price-range-dash">—</span><label for="max-price">Sampai<div class="guide-budget"><span>Rp</span><input id="max-price" aria-label="Harga sampai" name="maxPrice" type="number" inputmode="numeric" min="1" max="100000000" step="1" value="${esc(draft.maxPrice??'')}" placeholder="Contoh: ${entry.priceRanges[0].max}" ${draft.unlimited?'disabled':''} aria-describedby="finder-error"></div></label></div>
 <p class="field-help">Bisa isi sendiri atau pilih rentang di bawah. Kedua angkanya tetap bisa diubah.</p><div class="price-range-presets">${entry.priceRanges.map((r,i)=>`<button type="button" data-range="${i}" aria-pressed="${!draft.unlimited&&Number(draft.minPrice)===r.min&&Number(draft.maxPrice)===r.max}"><strong>${esc(r.label)}</strong>${!r.label.startsWith('Rp')?`<small>${compactRange(r)}</small>`:''}</button>`).join('')}</div><label class="quick-unlimited"><input type="checkbox" name="unlimited" ${draft.unlimited?'checked':''}> Lihat semua rentang harga</label>${entry.priceHelp?`<details class="price-help"><summary>Apa bedanya kelas harga ini?</summary><p>${esc(entry.priceHelp)}</p><p>Flagship generasi lama juga bisa turun harga. Untuk gambaran istilah, lihat <a href="https://www.samsung.com/uk/mobile-phone-buying-guide/samsung-phone-ranges-explained/" target="_blank" rel="noopener noreferrer">panduan lini smartphone Samsung ↗</a>.</p></details>`:''}</fieldset>
 <div class="decision-fields ordered-decision-fields${entry.category==='HP'?' phone-decision-fields':''}"><fieldset class="priority-section" id="question-priorities"><legend>${entry.category==='HP'?'Apa yang harus paling unggul dari HP barumu?':'Apa yang paling penting buatmu?'}</legend><p class="field-help">${entry.category==='HP'?'Pilih maksimal dua keunggulan. Pilihan pertama lebih diutamakan. Serba bisa dipilih sendiri.':'Pilih satu atau dua. Urutannya menentukan mana yang didahulukan ketika ada kompromi.'}</p><div id="priority-order" class="priority-order" aria-live="polite" aria-atomic="true" tabindex="-1">${priorityOrderHTML(entry,draft.priorities||[])}</div><div id="priority-options" class="priority-options">${priorityHTML(entry,draft)}</div></fieldset></div>
 ${entry.category==='HP'?'<section class="phone-profile" id="phone-profile" aria-label="Gambaran profil HP ideal" aria-live="polite"></section>':''}
 ${entry.constraints.length?`<details class="decision-constraints" ${Object.values(draft.constraints||{}).some(v=>v&&v!=='unknown')?'open':''}><summary>${entry.category==='HP'?'Preferensi tambahan':'Ada syarat khusus?'} <span>(opsional)</span></summary><div class="constraint-fields">${entry.constraints.map(f=>`<label>${esc(f.label)}<select class="control" name="constraint-${f.id}" aria-label="${esc(f.label)}">${options(f.options.map(o=>[o.value,o.label]),draft.constraints?.[f.id]||'unknown')}</select>${f.helper?`<small>${esc(f.helper)}</small>`:''}</label>`).join('')}</div><p class="field-help">Syarat yang belum punya data akan ditandai di hasil. Kami tidak menganggapnya sudah cocok.</p></details>`:''}
 <div id="finder-error" class="error-note" role="alert" tabindex="-1" hidden></div><p id="finder-dirty" class="question-helper" ${show&&profile.draft?'':'hidden'}>Jawaban berubah. Klik Perbarui rekomendasi untuk menerapkannya.</p>${simulationOnly?'<p class="phone-simulated-end">Belum ada produk Smartphone nyata untuk direkomendasikan. Grafik di atas hanya membantu memahami pilihanmu.</p>':`<button type="submit" class="primary">${show?'Perbarui rekomendasi':'Lihat rekomendasi'}</button>`}</form><div id="finder-results"></div>`;
 const form=main.querySelector('#finder-form'),min=form.elements.minPrice,max=form.elements.maxPrice,unlimited=form.elements.unlimited,error=main.querySelector('#finder-error');
 let selected=[...(draft.priorities||[])];
 const readForm=()=>({minPrice:min.value,maxPrice:max.value,unlimited:unlimited.checked,priorities:[...selected],constraints:Object.fromEntries(entry.constraints.map(f=>[f.id,form.elements['constraint-'+f.id].value]))});
 const updatePhoneProfile=()=>{
   const target=main.querySelector('#phone-profile');
   if(!target)return;
   const illustration=simulatePhoneProfile(readForm());
   if(!illustration){
     target.innerHTML='<span class="phone-eyebrow">GAMBARAN KEMAMPUAN</span><h2>Seperti apa profil HP idealmu?</h2><p class="phone-profile-prompt">Pilih rentang harga dan prioritas di atas untuk melihat simulasi. Untuk grafik, tentukan batas atas harga; opsi semua rentang tidak menghasilkan satu profil tertentu.</p>';
     return;
   }
   target.innerHTML=`<div class="phone-profile-header"><div><span class="phone-eyebrow">ILUSTRASI · BUKAN SKOR PRODUK</span><h2>Gambaran HP yang cocok untukmu</h2><p>Acuan budget sampai <strong>${esc(money(illustration.maxPrice))}</strong>. Semakin tinggi budget, semakin besar ruang untuk keunggulan di beberapa aspek.</p></div><span class="phone-profile-range">0–10</span></div><div class="phone-profile-grid">${illustration.scores.map(aspect=>`<div class="phone-meter"><span>${esc(aspect.label)}</span><div class="phone-meter-track" role="img" aria-label="${esc(aspect.label)}: ${aspect.score} dari 10, angka ilustrasi"><div class="phone-meter-fill" style="width:${aspect.score*10}%"></div></div><strong>${aspect.score.toFixed(1)}</strong></div>`).join('')}</div><p class="phone-profile-summary">${esc(illustration.summary)}</p><p class="phone-profile-disclaimer">${esc(illustration.disclaimer)}</p>`;
 };
 const remember=()=>{profile.draft=readForm();main.querySelector('#finder-dirty').hidden=!show;form.querySelectorAll('[data-range]').forEach(b=>{const r=entry.priceRanges[Number(b.dataset.range)];b.setAttribute('aria-pressed',String(!unlimited.checked&&min.value!==''&&max.value!==''&&Number(min.value)===r.min&&Number(max.value)===r.max));});updatePhoneProfile();};
 unlimited.onchange=()=>{min.disabled=max.disabled=unlimited.checked;remember();};
 form.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>{const r=entry.priceRanges[Number(b.dataset.range)];unlimited.checked=false;min.disabled=max.disabled=false;min.value=r.min;max.value=r.max;remember();});
 form.addEventListener('input',remember);
 const updatePriorityUI=()=>{
   form.querySelectorAll('[name=priorities]').forEach(input=>{const rank=selected.indexOf(input.value)+1;input.checked=rank>0;const badge=input.closest('label').querySelector('.priority-rank');badge.textContent=rank||'';badge.hidden=!rank||input.value==='any';});
   main.querySelector('#priority-order').innerHTML=priorityOrderHTML(entry,selected);
 };
 main.querySelector('#priority-order').onclick=e=>{if(!e.target.closest('[data-promote-priority]'))return;selected=[selected[1],selected[0]];updatePriorityUI();remember();main.querySelector('#priority-order').focus({preventScroll:true});};
 form.addEventListener('change',e=>{
   if(e.target.name==='priorities'){
     const id=e.target.value;
     if(e.target.checked){
       if(id==='any'||(entry.category==='HP'&&id==='allrounder')){selected=[id];error.hidden=true;}
       else if(selected.filter(v=>v!=='any'&&v!=='allrounder').length>=2){error.textContent='Sudah ada dua prioritas. Hapus salah satu dulu jika ingin menggantinya.';error.hidden=false;}
       else {selected=[...selected.filter(v=>v!=='any'&&v!=='allrounder'),id];error.hidden=true;}
     }else {selected=selected.filter(v=>v!==id);error.hidden=true;}
     updatePriorityUI();
   }
   remember();
 });
 form.onsubmit=e=>{e.preventDefault();const raw=readForm(),errors=validationErrors(entry,raw);form.querySelectorAll('[aria-invalid]').forEach(x=>x.removeAttribute('aria-invalid'));
   if(errors.length){error.innerHTML='<strong>Lengkapi pilihanmu</strong><ul>'+errors.map(e=>'<li>'+esc(e.message)+'</li>').join('')+'</ul>';error.hidden=false;const target=form.querySelector('#'+(errors[0].id==='priorities'?'question-priorities':errors[0].id));target?.setAttribute('aria-invalid','true');error.focus();return;}
   profile.answers=cleanAnswers(entry,raw);profile.submitted=true;profile.limit=3;delete profile.draft;ctx.onSubmit();
 };
 updatePhoneProfile();
 if(simulationOnly||!show)return;
 const result=mapRecommendations(products,entry,a);
 const priorities=a.priorities.map(id=>priorityOptions(entry).find(p=>p.value===id)).filter(Boolean);
 const applied=rangeText(a);
 let list=[...result.matches];if(profile.sort==='low')list.sort((x,y)=>(x.product.price??Infinity)-(y.product.price??Infinity));if(profile.sort==='high')list.sort((x,y)=>(y.product.price??-1)-(x.product.price??-1));
 const shown=list.slice(0,profile.limit||3),unknownAll=list.length&&priorities.length&&list.every(m=>!m.personalized);
 main.querySelector('#finder-results').innerHTML=`<section class="quick-results" aria-labelledby="finder-results-title"><div class="quick-results-head"><div><h2 id="finder-results-title" tabindex="-1">${list.length?'Pilihan '+esc(entry.label)+' untuk dibandingkan':'Belum ada pilihan yang memenuhi batasmu'}</h2><p>${esc(applied)}</p>${priorities.length?`<p class="applied-priority-order">${priorities.map((p,i)=>`<span><strong>${i+1}. ${esc(p.label)}</strong> — ${i===0?'utama':'tambahan'}</span>`).join('')}</p>`:'<p>Belum ada prioritas khusus; ini daftar awal untuk membantumu membandingkan.</p>'}</div>${list.length?'<label for="quick-sort">Urutkan<select class="control" id="quick-sort" aria-label="Urutkan"><option value="recommended">Dukungan untuk prioritasmu</option><option value="low">Harga termurah</option><option value="high">Harga tertinggi</option></select></label>':''}</div>${unknownAll?'<p class="decision-data-gap">Data untuk prioritas utamamu belum cukup. Produk di bawah sesuai jenis dan rentang harga, tetapi belum bisa disebut pilihan paling cocok.</p>':''}${entry.category==='Audio'&&!demoOnly?'<p class="quick-source">Catatan audio dari Kitab Audio Fernanda Gunsan. Harga bisa berubah; tautan pembelian tetap memakai affiliate asli Fernanda.</p>':''}${list.length?`<p class="quick-buying-note">${esc(buyingNote(entry))}</p><div class="quick-product-grid">${shown.map(m=>`<div class="quick-product">${ctx.cardHTML(m.product)}<div class="recommendation-explanation"><p class="decision-verdict">${esc(m.verdict)}</p><h4>Kenapa masuk pilihanmu?</h4><ul>${m.reasons.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>${m.checks.length?`<dl class="priority-checks">${m.checks.map(c=>`<div><dt><small>${c.rank===1?'Prioritas utama':'Prioritas tambahan'}</small>${esc(c.label)}</dt><dd>${c.status==='supported'?'Didukung catatan produk':c.status==='partial'?'Perlu bukti tambahan':'Belum cukup data'}</dd></div>`).join('')}</dl>`:''}<h4>Kekurangan yang perlu ditimbang</h4><p>${esc(plainNote(m.product.minus))}</p>${m.gaps.length?`<details><summary>Yang masih perlu dicek (${m.gaps.length})</summary><ul>${m.gaps.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></details>`:''}${demoOnly?'<p class="decision-footnote">Alasan ini memakai profil contoh, bukan hasil pengujian produk nyata.</p>':''}</div></div>`).join('')}</div><p class="quick-count">${shown.length} dari ${list.length} pilihan sesuai rentang dan syarat.</p>${list.length>shown.length?'<button class="secondary" id="more-results">Lihat pilihan lainnya</button>':''}`:`<div class="empty"><p>${result.withinBudget?'Belum ada data yang mendukung prioritas utama atau memenuhi syaratmu.':'Belum ada produk dengan harga tercatat di rentang ini.'}</p><p>Kami tidak memasukkan barang di luar batas harga atau mengganti jenisnya untuk mengisi hasil.</p><button class="secondary" id="change-budget">Tinjau rentang atau kebutuhan</button></div>`}</section>`;
 const sort=main.querySelector('#quick-sort');if(sort){sort.value=profile.sort;sort.onchange=()=>{profile.sort=sort.value;ctx.onSort();};}
 main.querySelector('#change-budget')?.addEventListener('click',()=>min.focus());
 main.querySelector('#more-results')?.addEventListener('click',()=>{profile.limit=list.length;ctx.onSort();});
 main.querySelector('.quick-product-grid')?.addEventListener('click',ctx.onCardClick);
}
