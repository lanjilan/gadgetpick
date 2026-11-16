import {matchesEntry} from './catalog.js';
import {priorityOptions} from './decision-config.js';
const useTags={music:['Musik'],gaming:['Gaming'],meeting:['Meeting'],work:['Kerja','Kuliah'],study:['Kuliah'],design:['Desain'],daily:['Kuliah','Kerja'],creator:['Foto','Video','Konten'],coding:['Pemrograman'],entertainment:['Hiburan']};
const amount=value=>value!==''&&value!=null&&['number','string'].includes(typeof value)&&Number.isSafeInteger(Number(value))?Number(value):null;
export function cleanAnswers(entry,raw={}){
 raw=raw&&typeof raw==='object'?raw:{};
 const use=entry.uses?(entry.uses.some(([id])=>id===raw.use)?raw.use:''):'any';
 const available=priorityOptions(entry,{use}),valid=new Set(available.map(p=>p.value));
 let priorities=Array.isArray(raw.priorities)?[...new Set(raw.priorities.filter(p=>valid.has(p)||p==='any'))]:[];
 if(priorities.includes('any'))priorities=['any'];
 const constraints={};for(const field of entry.constraints){const value=raw.constraints?.[field.id];constraints[field.id]=field.options.some(o=>o.value===value)?value:'unknown';}
 return {minPrice:amount(raw.minPrice),maxPrice:amount(raw.maxPrice),unlimited:raw.unlimited===true,use,priorities,constraints};
}
export function validationErrors(entry,raw){
 const a=cleanAnswers(entry,raw),errors=[];
 if(!a.unlimited){
   if(a.minPrice===null||a.minPrice<0||a.minPrice>100000000)errors.push({id:'min-price',message:'Isi harga awal, misalnya 2000000. Boleh 0 kalau tidak ada batas bawah.'});
   if(a.maxPrice===null||a.maxPrice<=0||a.maxPrice>100000000)errors.push({id:'max-price',message:'Isi harga sampai, misalnya 5000000.'});
   if(!errors.length&&a.minPrice>a.maxPrice)errors.push({id:'min-price',message:'Harga awal harus lebih kecil atau sama dengan harga sampai.'});
 }
 if(entry.uses&&!a.use)errors.push({id:'use',message:'Pilih pemakaian utama. Ada pilihan campuran kalau belum punya fokus.'});
 if(!a.priorities.length)errors.push({id:'priorities',message:'Pilih satu atau dua prioritas, atau pilih Belum tahu.'});
 if(a.priorities.length>2)errors.push({id:'priorities',message:'Pilih paling banyak dua prioritas agar yang terpenting tetap jelas.'});
 return errors;
}
export const isComplete=(entry,raw)=>!!entry&&validationErrors(entry,raw).length===0;
const tagFacts={
 balanced:[['Balanced','Neutral'],'Catatan suaranya cenderung seimbang atau netral.'],bass:[['Bass'],'Catatan review menonjolkan bass.'],vocal:[['Vokal'],'Catatan review menonjolkan vokal.'],
 battery:[['Baterai awet'],'Daya tahan baterai menjadi salah satu catatan positif.'],portable:[['Ringkas'],'Ukuran ringkas menjadi salah satu catatan positif.'],
 performance:[['Responsif'],'Ada catatan respons aplikasi yang baik; belum membuktikan FPS atau performa aplikasi tertentu.'],
 display:[['Warna natural'],'Ada catatan warna natural; belum ada ukuran akurasi warna atau gamut.'],workspace:[['Layar lega'],'Ada catatan layar lega untuk ruang kerja.']
};
function priorityEvidence(product,priority){
 const source=product.demo?'Profil contoh':product.evidence?.sources?.[0]?.creator||'Catatan sumber';
 const verified=product.demo||product.evidence?.status==='verified'||!!product.sourceUrl;
 const explicit=product.specs?.decisionEvidence?.[priority.value];
 if(verified&&explicit?.note&&['supported','partial'].includes(explicit.status))return {id:priority.value,label:priority.label,status:explicit.status,note:explicit.note,source};
 const fact=tagFacts[priority.value];
 if(verified&&fact&&fact[0].some(tag=>product.character.includes(tag)))return {id:priority.value,label:priority.label,status:['balanced','bass','vocal'].includes(priority.value)?'supported':'partial',note:fact[1],source};
 if(priority.value==='capacity'){
   const size=product.specs?.capacityGB??product.specs?.storageGB;
   if(verified&&Number.isFinite(size))return {id:priority.value,label:priority.label,status:'supported',note:'Kapasitas tercatat '+size+' GB.',source};
 }
 return {id:priority.value,label:priority.label,status:'unknown',note:'Belum ada bukti yang cukup untuk menilai '+priority.label.toLowerCase()+'.',source:null};
}
function constraintChecks(product,entry,answers){
 return entry.constraints.flatMap(field=>{
   const wanted=answers.constraints[field.id];if(!wanted||wanted==='unknown')return [];
   const value=product.specs?.[field.id],label=field.options.find(o=>o.value===wanted)?.label;
   if(value==null)return [{id:field.id,status:'unknown',note:field.label+' ('+label+') belum tercatat pada produk ini.'}];
   const okay=['memoryGB','storageGB'].includes(field.id)?Number(value)>=Number(wanted):Array.isArray(value)?value.some(v=>String(v).toLowerCase()===wanted.toLowerCase()):String(value).toLowerCase()===wanted.toLowerCase();
   return [{id:field.id,status:okay?'supported':'mismatch',note:field.label+': '+(okay?'data mendukung pilihan '+label:'tidak sesuai pilihan '+label)+'.'}];
 });
}
export function mapRecommendations(products,entry,raw){
 if(!isComplete(entry,raw))return {error:'Lengkapi rentang harga, pemakaian, dan prioritas.',matches:[],total:0,withinBudget:0};
 const answers=cleanAnswers(entry,raw),all=products.filter(p=>matchesEntry(p,entry));
 const priced=all.filter(p=>answers.unlimited||(p.price!=null&&p.price>=answers.minPrice&&p.price<=answers.maxPrice));
 const uses=useTags[answers.use]||[],wanted=priorityOptions(entry,answers).filter(p=>answers.priorities.includes(p.value));
 const matches=priced.filter(p=>!uses.length||uses.some(tag=>p.needs.includes(tag))).flatMap(product=>{
   const constraints=constraintChecks(product,entry,answers);if(constraints.some(c=>c.status==='mismatch'))return [];
   const checks=wanted.map(p=>priorityEvidence(product,p));
   const supported=checks.filter(c=>c.status==='supported'),partial=checks.filter(c=>c.status==='partial'),unknown=checks.filter(c=>c.status==='unknown');
   const reasons=[...supported,...partial].map(c=>c.note);
   if(uses.length)reasons.unshift((product.demo?'Profil contoh ini ditujukan':'Sumber mencatat penggunaan')+' untuk '+uses.filter(t=>product.needs.includes(t)).join(' / ').toLowerCase()+'.');
   if(!reasons.length)reasons.push('Jenis dan harga sesuai pilihanmu. Data prioritasnya belum cukup untuk membedakan produk ini dari pilihan lain.');
   const gaps=[...unknown.map(c=>c.note),...constraints.filter(c=>c.status==='unknown').map(c=>c.note)];
   const score=supported.length*2+partial.length;
   const verdict=!wanted.length?'Pilihan awal untuk dibandingkan':score===0?'Belum cukup data untuk prioritasmu':unknown.length||partial.length||gaps.length?'Ada yang sesuai; beberapa hal perlu dicek':'Catatan produk sesuai prioritasmu';
   return [{product,score,reasons,checks,constraints,gaps,verdict,personalized:score>0}];
 }).sort((a,b)=>b.score-a.score||(a.product.price??Infinity)-(b.product.price??Infinity)||a.product.name.localeCompare(b.product.name));
 return {matches,total:all.length,withinBudget:priced.length,answers};
}
