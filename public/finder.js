import {matchesEntry} from './catalog.js';
import {priorityOptions} from './decision-config.js';
const goalTags={gaming:['Gaming'],creative:['Desain'],coding:['Pemrograman']};
const amount=value=>value!==''&&value!=null&&['number','string'].includes(typeof value)&&Number.isSafeInteger(Number(value))?Number(value):null;
export function cleanAnswers(entry,raw={}){
 raw=raw&&typeof raw==='object'?raw:{};
 const available=priorityOptions(entry),valid=new Set(available.map(p=>p.value));
 let priorities=Array.isArray(raw.priorities)?[...new Set(raw.priorities.filter(p=>valid.has(p)||p==='any'))]:[];
 if(priorities.includes('any'))priorities=['any'];
 if(entry.category==='HP'&&priorities.includes('allrounder'))priorities=['allrounder'];
 const constraints={};for(const field of entry.constraints){const value=raw.constraints?.[field.id];constraints[field.id]=field.options.some(o=>o.value===value)?value:'unknown';}
 return {minPrice:amount(raw.minPrice),maxPrice:amount(raw.maxPrice),unlimited:raw.unlimited===true,priorities,constraints};
}
export function validationErrors(entry,raw){
 const a=cleanAnswers(entry,raw),errors=[];
 if(!a.unlimited){
   if(a.minPrice===null||a.minPrice<0||a.minPrice>100000000)errors.push({id:'min-price',message:'Isi harga awal, misalnya 2000000. Boleh 0 kalau tidak ada batas bawah.'});
   if(a.maxPrice===null||a.maxPrice<=0||a.maxPrice>100000000)errors.push({id:'max-price',message:'Isi harga sampai, misalnya 5000000.'});
   if(!errors.length&&a.minPrice>a.maxPrice)errors.push({id:'min-price',message:'Harga awal harus lebih kecil atau sama dengan harga sampai.'});
 }
 if(!a.priorities.length)errors.push({id:'priorities',message:'Pilih prioritas utama, atau pilih Seimbang / bantu pilih.'});
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
 const goals=goalTags[priority.value];
 if(verified&&goals?.some(tag=>product.needs.includes(tag)))return {id:priority.value,label:priority.label,status:'partial',note:'Ada catatan penggunaan untuk '+priority.label.toLowerCase()+'. Kebutuhan aplikasi, game, atau pengaturan tertentu tetap perlu dicek.',source};
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
 if(!isComplete(entry,raw))return {error:'Lengkapi rentang harga dan urutan prioritas.',matches:[],total:0,withinBudget:0};
 const answers=cleanAnswers(entry,raw),all=products.filter(p=>matchesEntry(p,entry));
 const priced=all.filter(p=>answers.unlimited||(p.price!=null&&p.price>=answers.minPrice&&p.price<=answers.maxPrice));
 const wanted=answers.priorities.map(id=>priorityOptions(entry).find(p=>p.value===id)).filter(Boolean);
 const matches=priced.flatMap(product=>{
   const constraints=constraintChecks(product,entry,answers);if(constraints.some(c=>c.status==='mismatch'))return [];
   const checks=wanted.map((p,i)=>({...priorityEvidence(product,p),rank:i+1}));
   // The main activity needs a recorded use or direct review evidence. Generic responsiveness is insufficient.
   if(goalTags[wanted[0]?.value]&&checks[0]?.status==='unknown')return [];
   const supported=checks.filter(c=>c.status==='supported'),partial=checks.filter(c=>c.status==='partial'),unknown=checks.filter(c=>c.status==='unknown');
   const reasons=checks.filter(c=>c.status!=='unknown').map(c=>(c.rank===1?'Untuk prioritas utama: ':'Untuk prioritas tambahan: ')+c.note);
   if(!reasons.length)reasons.push('Jenis dan harga sesuai pilihanmu. Data prioritasnya belum cukup untuk membedakan produk ini dari pilihan lain.');
   const gaps=[...unknown.map(c=>c.note),...constraints.filter(c=>c.status==='unknown').map(c=>c.note)];
   const strength=c=>c?.status==='supported'?2:c?.status==='partial'?1:0;
   // Lexicographic priority: even full support for the secondary goal cannot outweigh partial support for the main goal.
   const primaryStrength=strength(checks[0]),secondaryStrength=strength(checks[1]);
   const score=primaryStrength*3+secondaryStrength;
   const verdict=!wanted.length?'Pilihan awal untuk dibandingkan':primaryStrength===0?'Belum cukup data untuk prioritas utamamu':unknown.length||partial.length||gaps.length?'Ada yang sesuai; beberapa hal perlu dicek':'Catatan produk sesuai prioritasmu';
   return [{product,score,primaryStrength,secondaryStrength,reasons,checks,constraints,gaps,verdict,personalized:primaryStrength>0}];
 }).sort((a,b)=>b.score-a.score||(a.product.price??Infinity)-(b.product.price??Infinity)||a.product.name.localeCompare(b.product.name));
 return {matches,total:all.length,withinBudget:priced.length,answers};
}
