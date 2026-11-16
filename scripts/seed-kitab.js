import {readFile,writeFile} from 'node:fs/promises';
import {validAffiliateURL} from '../public/importer.js';
const data=JSON.parse(await readFile(new URL('./kitab-selection.json',import.meta.url),'utf8'));
const q=x=>x==null?'NULL':`'${String(x).replaceAll("'","''")}'`;
const statements=['PRAGMA foreign_keys = ON;'];
for(const p of data){
 if(p.affiliateOwner!=='fernanda'||p.affiliateUrl!==p.affiliateOriginalUrl||!validAffiliateURL(p.affiliateUrl))throw Error('Affiliate ownership/original URL invariant failed.');
 const sourceId='source-'+p.id;
 const specs={subtype:p.subtype,visual:p.visual,color:p.color,priceSource:p.priceSource,sourceVersion:p.sourceVersion,sourceSheet:p.sourceSheet,sourceRow:p.sourceRow,retrievedAt:p.retrievedAt,soundTier:p.soundTier,valueTier:p.valueTier,tuningOriginal:p.tuningOriginal,reviewUrl:p.reviewUrl,affiliateLinks:p.affiliateLinks};
 statements.push(`INSERT INTO products(id,name,category,specs_json,is_demo) VALUES(${q(p.id)},${q(p.name)},'Audio',${q(JSON.stringify(specs))},0) ON CONFLICT(id) DO UPDATE SET name=excluded.name,specs_json=excluded.specs_json;`);
 statements.push(`INSERT INTO sources(id,creator,title,url,origin,verification_status,permission_status,permission_proof_url,verified_at,permission_confirmation) VALUES(${q(sourceId)},'Fernanda Gunsan',${q(p.sourceTitle)},${q(p.sourceUrl)},'kitab_audio','verified','granted','codex://threads/01a1e2d4-5cb1-79c0-844d-54d92635d411',${q(p.retrievedAt)},${q(p.permissionConfirmation)}) ON CONFLICT(id) DO UPDATE SET url=excluded.url,verified_at=excluded.verified_at,permission_status='granted',permission_confirmation=excluded.permission_confirmation;`);
 statements.push(`INSERT INTO recommendations(id,product_id,source_id,tier,reason,drawbacks,needs_json,character_json,affiliate_owner,affiliate_url,affiliate_original_url,status,reviewed_at) VALUES(${q(p.id)},${q(p.id)},${q(sourceId)},${q(p.tier)},${q(p.reason)},${q(p.drawbacks)},${q(JSON.stringify(p.needs))},${q(JSON.stringify(p.character))},'fernanda',${q(p.affiliateUrl)},${q(p.affiliateOriginalUrl)},'published',${q(p.retrievedAt)}) ON CONFLICT(id) DO UPDATE SET tier=excluded.tier,reason=excluded.reason,drawbacks=excluded.drawbacks,needs_json=excluded.needs_json,character_json=excluded.character_json,affiliate_url=excluded.affiliate_url,affiliate_original_url=excluded.affiliate_original_url,status=excluded.status;`);
 statements.push(`INSERT INTO offers(id,product_id,price,observed_at,source,stock_status) VALUES(${q('offer-'+p.id)},${q(p.id)},${p.price},${q(p.retrievedAt)},${q(p.priceSource)},'unknown') ON CONFLICT(id) DO UPDATE SET price=excluded.price,observed_at=excluded.observed_at,source=excluded.source;`);
}
await writeFile(new URL('./kitab-seed.sql',import.meta.url),statements.join('\n')+'\n');
console.log(`SQL prepared for ${data.length} audio profiles. Original Fernanda links preserved.`);
