import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {entries,findEntry,audioType,matchesEntry} from '../public/catalog.js';
import {mapRecommendations,cleanAnswers,isComplete,validationErrors} from '../public/finder.js';
import {saveGuides,restoreGuides} from '../public/finder-state.js';
import {demoProducts} from '../public/data.js';
const real=JSON.parse(await readFile(new URL('../scripts/kitab-selection.json',import.meta.url),'utf8')).map(p=>({...p,specs:{subtype:p.subtype}}));
const base={minPrice:0,maxPrice:5000000,priorities:['any']};
const phone=findEntry('smartphone-tablet/smartphone'),tws=findEntry('audio/tws');
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};};
test('Direct product routes stay unique and separate from recommendation questions',()=>{
 assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
 assert.deepEqual(entries.filter(e=>e.group==='audio').map(e=>e.kind),['tws','iem','earphone','headphone','headset','ows']);
 for(const id of ['monitor','processor','ram','ssd','hdd','gpu','motherboard','psu','casing','cooler'])assert.ok(findEntry('komponen-pc/'+id));
 assert.equal(findEntry('komponen-pc/upgrade'),undefined);
});
test('Audio types are distinct and exclude speakers/DACs',()=>{
 const types={IEM:'iem',Earphone:'earphone',Earbuds:'earphone',TWS:'tws','Headphone wireless':'headphone',Headset:'headset',OWS:'ows',Speaker:null,DAC:null};
 for(const [subtype,expected]of Object.entries(types))assert.equal(audioType({specs:{subtype}}),expected);
 assert.equal(matchesEntry({category:'Audio',specs:{subtype:'IEM'}},findEntry('audio/earphone')),false);
});
test('Ranges require both explicit endpoints; old upper-limit-only answers do not pass',()=>{
 assert.equal(isComplete(phone,{budget:5000000,priorities:['any']}),false);
 for(const a of [{...base,minPrice:null},{...base,maxPrice:null},{...base,minPrice:6000000},{...base,minPrice:-1},{...base,maxPrice:0},{...base,maxPrice:100000001}])assert.equal(isComplete(phone,a),false);
 assert.equal(isComplete(phone,base),true);assert.equal(isComplete(phone,{...base,minPrice:5000000}),true);
 assert.equal(isComplete(phone,{...base,unlimited:true,minPrice:null,maxPrice:null}),true);
 assert.equal(isComplete(phone,{...base,use:''}),true); // Legacy purpose no longer affects the single priority question.
 assert.equal(isComplete(phone,{...base,priorities:[]}),false);
});
test('Both price bounds apply, including exact endpoints; cheaper products are not inserted',()=>{
 const low=mapRecommendations(demoProducts,phone,{...base,minPrice:2000000,maxPrice:3000000});
 assert.deepEqual(low.matches.map(m=>m.product.id),['phone-01']);
 const high=mapRecommendations(demoProducts,phone,{...base,minPrice:3000000,maxPrice:5000000});
 assert.deepEqual(high.matches.map(m=>m.product.id),['phone-02']);
 assert.equal(mapRecommendations(demoProducts,phone,{...base,minPrice:6000000,maxPrice:8000000}).matches.length,0);
});
test('Price presets set intervals and remain browsing guidance rather than product tiers',()=>{
 assert.deepEqual(phone.priceRanges[0],{label:'Entry-level',min:1000000,max:3000000});
 for(const entry of entries)assert.ok(entry.priceRanges.every(r=>r.min>=0&&r.max>=r.min));
 assert.match(phone.priceHelp,/bukan batas resmi/);
 assert.equal(cleanAnswers(phone,{...base,priceTier:'flagship'}).priceTier,undefined);
});
test('Missing prices cannot satisfy a range, but explicit all-price browsing is allowed',()=>{
 const missing={...real.find(p=>p.subtype==='TWS'),id:'missing',price:null};
 assert.equal(mapRecommendations([missing],tws,base).matches.length,0);
 assert.equal(mapRecommendations([missing],tws,{...base,unlimited:true}).matches.length,1);
});
test('No priority silently becomes a personal recommendation',()=>{
 const result=mapRecommendations(real,tws,base);
 assert.ok(result.matches.length&&result.matches.every(m=>!m.personalized&&m.checks.length===0));
 assert.ok(result.matches.every(m=>m.verdict.includes('Pilihan awal')));
});
test('Only two ordered priorities are accepted and legacy purpose is discarded',()=>{
 assert.ok(validationErrors(phone,{...base,priorities:['camera','battery','gaming']}).some(e=>e.id==='priorities'));
 const clean=cleanAnswers(phone,{...base,use:'gaming',priorities:['battery','camera']});
 assert.deepEqual(clean.priorities,['battery','camera']);assert.equal(clean.use,undefined);
});
test('Camera capability is never inferred from display color or generic creator use',()=>{
 const result=mapRecommendations(demoProducts,phone,{...base,priorities:['camera']});
 assert.ok(result.matches.length&&result.matches.every(m=>m.score===0&&!m.personalized));
 assert.ok(result.matches.every(m=>m.checks[0].status==='unknown'&&m.gaps.some(g=>g.includes('kamera'))));
});
test('A removed purpose cannot silently filter results or return as a stored requirement',()=>{
 const result=mapRecommendations(demoProducts,phone,{...base,use:'creator',priorities:['camera']});
 assert.deepEqual(result.matches.map(m=>m.product.id),mapRecommendations(demoProducts,phone,{...base,priorities:['camera']}).matches.map(m=>m.product.id));
 assert.equal(result.answers.use,undefined);
});
test('Recorded battery notes rank a phone with qualified reasons, not invented measurements',()=>{
 const result=mapRecommendations(demoProducts,phone,{...base,priorities:['battery']});
 assert.equal(result.matches[0].product.id,'phone-01');
 assert.equal(result.matches[0].checks[0].status,'partial');
 assert.ok(result.matches[0].reasons.some(r=>r.includes('Daya tahan')));
 assert.equal(result.matches[0].personalized,true);
});
test('Known incompatible requirements exclude records; unknown specifications stay explicitly conditional',()=>{
 const android={...demoProducts.find(p=>p.id==='phone-01'),specs:{os:'android',storageGB:128}};
 const ios={...android,id:'ios',specs:{os:'ios',storageGB:256}};
 const unknown={...android,id:'unknown',specs:{}};
 const result=mapRecommendations([android,ios,unknown],phone,{...base,constraints:{os:'android',storageGB:'256'}});
 assert.deepEqual(result.matches.map(m=>m.product.id),['unknown']);
 assert.ok(result.matches[0].gaps.some(g=>g.includes('Storage')));
 assert.ok(result.matches[0].constraints.every(c=>c.status==='unknown'));
});
test('Optional constraints and priorities only retain recognized fields',()=>{
 const clean=cleanAnswers(phone,{...base,priorities:['battery','fake'],constraints:{os:'android',tracking:'secret'},tracking:'secret'});
 assert.deepEqual(clean.priorities,['battery']);assert.equal(clean.constraints.tracking,undefined);assert.equal(clean.tracking,undefined);
});
test('A main gaming priority cannot use music-only reviews or generic responsiveness as proof',()=>{
 const result=mapRecommendations(real,tws,{...base,priorities:['gaming']});
 assert.equal(result.matches.length,0);assert.ok(result.withinBudget>0);
 assert.equal(mapRecommendations(demoProducts,phone,{...base,priorities:['gaming']}).matches.length,0);
});
test('Actual audio tone notes support reasons while affiliate records remain untouched',()=>{
 const before=JSON.stringify(real),result=mapRecommendations(real,findEntry('audio/headphone'),{...base,priorities:['balanced']});
 assert.equal(result.matches[0].product.name,'Fiio EH11');assert.equal(result.matches[0].checks[0].status,'supported');
 for(const {product}of result.matches){assert.equal(product.affiliateOwner,'fernanda');assert.equal(product.affiliateUrl,product.affiliateOriginalUrl);}
 assert.equal(JSON.stringify(real),before);
});
test('RAM and SSD stay separate; an empty HDD category is not filled using SSD records',()=>{
 assert.deepEqual(mapRecommendations(demoProducts,findEntry('komponen-pc/ram'),base).matches.map(m=>m.product.id),['component-02']);
 assert.deepEqual(mapRecommendations(demoProducts,findEntry('komponen-pc/ssd'),base).matches.map(m=>m.product.id),['component-01']);
 assert.equal(mapRecommendations(demoProducts,findEntry('komponen-pc/hdd'),base).total,0);
});
test('Device categories and explicit use do not mix',()=>{
 assert.equal(mapRecommendations(demoProducts,findEntry('laptop'),{...base,maxPrice:10000000,priorities:['gaming']}).matches.length,0);
 const tablet=mapRecommendations(demoProducts,findEntry('smartphone-tablet/tablet'),{...base,priorities:['battery']});
 assert.ok(tablet.matches.every(m=>m.product.category==='Tablet'));
});
test('Session state keeps ranges and priorities per product type; invalid results cannot reopen',()=>{
 const s=storage();saveGuides(s,{'audio/tws':{answers:{...base,minPrice:500000,maxPrice:1000000},submitted:true},'audio/iem':{answers:{...base,minPrice:1000000,maxPrice:2000000,priorities:['balanced']},submitted:true},'laptop':{answers:{...base,minPrice:9000000},submitted:true}});
 const saved=restoreGuides(s);assert.equal(saved['audio/tws'].answers.minPrice,500000);assert.deepEqual(saved['audio/iem'].answers.priorities,['balanced']);assert.equal(saved.laptop.submitted,false);
 assert.equal(saved['audio/tws'].submitted,true);
 assert.deepEqual(restoreGuides({getItem(){return '{broken';}}),{});assert.equal(saveGuides(null,{}),false);
});

const evidencePhone=(id,price,evidence)=>({...demoProducts.find(p=>p.id==='phone-01'),id,price,specs:{decisionEvidence:evidence}});
test('Swapping main and additional priorities changes ranking before price is considered',()=>{
 const camera=evidencePhone('camera',4500000,{camera:{status:'supported',note:'Camera evidence fixture'}});
 const battery=evidencePhone('battery',3500000,{battery:{status:'supported',note:'Battery evidence fixture'}});
 // Remove the inherited battery tag so the controlled records isolate priority order.
 camera.character=[];battery.character=[];
 const cameraFirst=mapRecommendations([battery,camera],phone,{...base,priorities:['camera','battery']});
 const batteryFirst=mapRecommendations([camera,battery],phone,{...base,priorities:['battery','camera']});
 assert.equal(cameraFirst.matches[0].product.id,'camera');assert.equal(batteryFirst.matches[0].product.id,'battery');
 assert.deepEqual(cameraFirst.matches[0].checks.map(c=>[c.id,c.rank]),[['camera',1],['battery',2]]);
});
test('Secondary evidence cannot outrank partial evidence for the main priority or pretend the main one is verified',()=>{
 const primary=evidencePhone('primary',4500000,{camera:{status:'partial',note:'Partial camera fixture'}});
 const secondary=evidencePhone('secondary',3000000,{battery:{status:'supported',note:'Battery evidence fixture'}});
 primary.character=[];secondary.character=[];
 const result=mapRecommendations([secondary,primary],phone,{...base,priorities:['camera','battery']});
 assert.equal(result.matches[0].product.id,'primary');
 const other=result.matches.find(m=>m.product.id==='secondary');assert.equal(other.personalized,false);assert.equal(other.checks[0].status,'unknown');
});
test('A recorded main gaming use can keep a secondary camera preference without inventing camera evidence',()=>{
 const gaming={...evidencePhone('gaming',4000000,{}),needs:['Gaming'],character:['Responsif']};
 const result=mapRecommendations([gaming],phone,{...base,priorities:['gaming','camera']});
 assert.equal(result.matches.length,1);assert.equal(result.matches[0].checks[0].status,'partial');assert.equal(result.matches[0].checks[1].status,'unknown');
});
test('Older unordered choices keep their price range but do not silently become a main priority',()=>{
 const s=storage();s.setItem('gadgetpick.finder.v4',JSON.stringify({'smartphone-tablet/smartphone':{answers:{...base,priorities:['camera','battery'],constraints:{os:'android'}},submitted:true}}));
 const restored=restoreGuides(s)['smartphone-tablet/smartphone'];
 assert.equal(restored.answers.minPrice,base.minPrice);assert.equal(restored.answers.maxPrice,base.maxPrice);assert.deepEqual(restored.answers.priorities,[]);assert.equal(restored.submitted,false);assert.equal(restored.answers.constraints.os,'android');
});
