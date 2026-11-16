import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile} from 'node:fs/promises';
import {parts,makeBuild,checkCompatibility,partTypes} from '../public/builder.js';
import {parseCSV,parsePrice,prepareImport,validAffiliateURL} from '../public/importer.js';
import worker from '../src/worker.js';
const baseConfig={sourceOrigin:'shopee_csv',affiliateOwner:'site',priceFormat:'integer',mapping:{externalId:'id',name:'name',price:'price',affiliateUrl:'url'}};
// These URLs only exercise validation; never shown as real product/affiliate data.
const testURL='https://s.shopee.co.id/test-only?tracking=keep%2Fexact&owner=fixture';
test('CSV: BOM, quoted separators, newlines, escaped quotes and CRLF',()=>{
 const {headers,rows}=parseCSV('\uFEFFid;name;price\r\n1;"A;B\nC ""Q""";250000\r\n',';');
 assert.deepEqual(headers,['id','name','price']);assert.deepEqual(rows,[['1','A;B\nC "Q"','250000']]);
 assert.throws(()=>parseCSV('a,a\nx,y'),/duplikat/);assert.throws(()=>parseCSV('a,b\n"broken,b'),/belum ditutup/);assert.throws(()=>parseCSV('a,b\nx,y,z'),/konsisten/);
});
test('Prices: explicit locale; no accidental thousand/decimal coercion',()=>{
 assert.equal(parsePrice('Rp250.000,00','id-ID'),250000);assert.equal(parsePrice('250000'),250000);
 for(const value of ['250.50','1,500','-1','NaN','2e5','0'])assert.throws(()=>parsePrice(value));
 assert.throws(()=>parsePrice('25.50','id-ID'));assert.throws(()=>parsePrice('250.000,50','id-ID'));
});
test('CSV staging: original links preserved, duplicates rejected, no invented stock/reviews',()=>{
 const result=prepareImport(`id,name,price,url\n1,Product,250000,${testURL}\n1,Duplicate,1,${testURL}`,baseConfig);
 assert.equal(result.valid.length,1);assert.equal(result.errors.length,1);assert.equal(result.valid[0].affiliateUrl,testURL);assert.equal(result.valid[0].affiliateOriginalUrl,testURL);assert.equal(result.valid[0].stock,null);assert.equal(result.valid[0].status,'staged');
});
test('Kitab is authorized; owner must remain Fernanda',()=>{
 const csv=`id,name,price,url\n1,Audio,250000,${testURL}`;
 const result=prepareImport(csv,{...baseConfig,sourceOrigin:'kitab_audio',affiliateOwner:'fernanda'});
 assert.equal(result.valid[0].affiliateOwner,'fernanda');assert.equal(result.valid[0].affiliateUrl,testURL);
 assert.throws(()=>prepareImport(csv,{...baseConfig,sourceOrigin:'kitab_audio'}),/Fernanda/);
 assert.throws(()=>prepareImport(csv,{...baseConfig,affiliateOwner:'fernanda'}),/Pemilik/);
});
test('Affiliate URL validation rejects lookalikes, javascript and credential URLs',()=>{
 assert.equal(validAffiliateURL(testURL),true);
 for(const x of ['javascript:alert(1)','http://s.shopee.co.id/test','https://s.shopee.co.id.evil.com/test','https://x@s.shopee.co.id/test','https://s.shopee.co.id:8080/test'])assert.equal(validAffiliateURL(x),false);
});
test('Builds: every budget and purpose returns complete compatible parts within budget',()=>{
 for(const purpose of ['gaming','desain','kerja'])for(const budget of [5350000,6500000,8000000,12000000,20000000]){
  const result=makeBuild(budget,purpose);assert.ok(result.build);assert.equal(Object.keys(result.build).length,Object.keys(partTypes).length);assert.ok(result.total<=budget);assert.ok(checkCompatibility(result.build).every(c=>c.status==='pass'));
 }
 assert.ok(makeBuild(1).error);assert.equal(makeBuild(1).minimum,5250000);assert.ok(makeBuild(NaN).error);
});
test('Compatibility detects socket, DDR, graphics, length/slots, power and cooling failures',()=>{
 const base=makeBuild(8000000).build;
 for(const [key,value,label] of [
  ['cpu',{...base.cpu,socket:'other'},'Socket'],
  ['ram',{...base.ram,memory:'DDR-X'},'Generasi'],
  ['gpu',{...base.gpu,length:999,slots:10},'Ukuran'],
  ['psu',{...base.psu,watts:1},'Daya'],
  ['psu',{...base.psu,pcieConnectors:0},'Daya'],
  ['cooler',{...base.cooler,height:999},'Cooler']
 ]){const checks=checkCompatibility({...base,[key]:value});assert.equal(checks.find(c=>c.label.startsWith(label)).status,'fail');}
 const noGraphics={...base,cpu:{...base.cpu,igpu:false},gpu:parts.find(p=>p.id==='gpu-none')};assert.equal(checkCompatibility(noGraphics).find(c=>c.label==='Output grafis').status,'fail');
});
test('Incomplete specifications are unknown rather than silently approved',()=>{
 const base=makeBuild(8000000).build;
 const checks=checkCompatibility({...base,motherboard:{...base.motherboard,biosCpuIds:undefined},psu:{...base.psu,watts:undefined}});
 assert.equal(checks.find(c=>c.label==='Dukungan BIOS').status,'unknown');assert.equal(checks.find(c=>c.label.startsWith('Daya')).status,'unknown');assert.equal(checkCompatibility({})[0].status,'fail');
});
test('D1 migrations and real audio seed preserve creator, permission and original URLs',async()=>{
 const db=new DatabaseSync(':memory:');
 for(const f of ['0001_initial.sql','0002_source_confirmation.sql'])db.exec(await readFile(new URL('../migrations/'+f,import.meta.url),'utf8'));
 db.exec(await readFile(new URL('../scripts/kitab-seed.sql',import.meta.url),'utf8'));
 const records=db.prepare('SELECT r.*,s.permission_status,s.permission_confirmation FROM recommendations r JOIN sources s ON s.id=r.source_id').all();
 assert.equal(records.length,12);assert.ok(records.every(r=>r.affiliate_owner==='fernanda'&&r.affiliate_url===r.affiliate_original_url&&r.permission_status==='granted'&&r.permission_confirmation));
 assert.throws(()=>db.prepare("UPDATE recommendations SET affiliate_owner='site' WHERE id='kitab-1'").run(),/Kitab Audio/);
 assert.throws(()=>db.prepare("UPDATE recommendations SET affiliate_url='https://s.shopee.co.id/wrong-test' WHERE id='kitab-1'").run());
 assert.throws(()=>db.prepare("INSERT INTO recommendations(id,product_id,source_id,tier,reason,drawbacks,affiliate_owner,status) VALUES('bad','kitab-1','source-kitab-1','x','x','x','site','draft')").run(),/Kitab Audio/);
 // Seed can be rerun without duplicating products or price snapshots.
 db.exec(await readFile(new URL('../scripts/kitab-seed.sql',import.meta.url),'utf8'));assert.equal(db.prepare('SELECT count(*) AS n FROM offers').get().n,12);db.close();
});
test('Worker: disabled admin writes, no demo fallback in live mode, safe filtering',async()=>{
 assert.equal((await worker.fetch(new Request('https://local/api/admin/import',{method:'POST',body:'{}'}),{})).status,401);
 const noDB=await worker.fetch(new Request('https://local/api/catalog'),{DATA_MODE:'live'});assert.equal(noDB.status,503);
 const demo=await worker.fetch(new Request('https://local/api/catalog'),{DATA_MODE:'demo'});
 const fixtures=(await demo.json()).products;
 assert.ok(fixtures.length>0&&fixtures.every(p=>p.demo&&!p.affiliate.url));
 assert.ok(fixtures.some(p=>p.category==='Laptop'));assert.ok(fixtures.some(p=>p.category==='Tablet'));
 assert.equal(fixtures.some(p=>p.category==='Aksesori'),false);
 const db={prepare(){return{all:async()=>({results:[]})};}};
 const live=await worker.fetch(new Request('https://local/api/catalog'),{DATA_MODE:'live',DB:db});assert.deepEqual((await live.json()).products,[]);
});
test('Worker admin: dry-run, all-or-nothing validation and staged-only commit',async()=>{
 const bound=[];const db={prepare(sql){return{bind(...args){bound.push({sql,args});return this;}};},async batch(statements){assert.equal(statements.length,2);}};
 const call=async(body)=>worker.fetch(new Request('https://local/api/admin/import',{method:'POST',headers:{Authorization:'Bearer local-test-only','Content-Type':'application/json'},body:JSON.stringify(body)}),{DB:db,ADMIN_TOKEN:'local-test-only'});
 const body={csv:`id,name,price,url\n1,Product,250000,${testURL}`,config:baseConfig};
 const dry=await call(body);assert.equal(dry.status,200);assert.equal(bound.length,0);
 const bad=await call({...body,csv:body.csv+'\n2,Bad,not-price,'+testURL,commit:true});assert.equal(bad.status,422);assert.equal(bound.length,0);
 const committed=await call({...body,commit:true});assert.equal(committed.status,201);assert.equal((await committed.json()).published,0);assert.ok(bound.every(b=>!b.sql.includes('recommendations')));
});
