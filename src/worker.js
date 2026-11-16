import {demoProducts} from '../public/data.js';
import {prepareImport,validAffiliateURL} from '../public/importer.js';
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(value,status=200)=>Response.json(value,{status,headers});
const safeWebUrl = x => {try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    try{
      if(url.pathname==='/api/catalog'&&request.method==='GET'){
        if(env.DATA_MODE==='demo')return json({mode:'demo',products:demoProducts});
        if(!env.DB)return json({error:'Database belum tersedia.'},503);
        const {results}=await env.DB.prepare(`SELECT r.*,p.name,p.category,p.specs_json,s.creator,s.title,s.url AS source_url,s.origin,s.permission_status,s.permission_proof_url,
          (SELECT price FROM offers WHERE product_id=p.id ORDER BY observed_at DESC,id DESC LIMIT 1) AS price,
          (SELECT observed_at FROM offers WHERE product_id=p.id ORDER BY observed_at DESC,id DESC LIMIT 1) AS observed_at
          FROM recommendations r JOIN products p ON p.id=r.product_id JOIN sources s ON s.id=r.source_id
          WHERE r.status='published' AND r.reviewed_at IS NOT NULL AND p.is_demo=0 AND s.verification_status='verified'
          AND (s.permission_status IN ('granted','not_required'))
          AND (s.origin!='kitab_audio' OR (s.permission_status='granted' AND s.permission_proof_url IS NOT NULL AND r.affiliate_owner='fernanda' AND r.affiliate_url=r.affiliate_original_url))
          ORDER BY r.id LIMIT 500`).all();
        const products=results.filter(r=>safeWebUrl(r.source_url)&&(!r.affiliate_url||validAffiliateURL(r.affiliate_url))).map(r=>{
          const specs=JSON.parse(r.specs_json);
          if(specs.reviewUrl&&!safeWebUrl(specs.reviewUrl))specs.reviewUrl=null;
          return {id:r.id,name:r.name,category:r.category,price:r.price,priceObservedAt:r.observed_at,priceStatus:'snapshot',demo:false,stock:null,character:JSON.parse(r.character_json),needs:JSON.parse(r.needs_json),headline:r.reason,minus:r.drawbacks,tier:r.tier,visual:specs.visual||({Audio:'headphone',Monitor:'monitor',HP:'phone',Tablet:'tablet',Laptop:'laptop','Komponen PC':'ram'})[r.category]||'keyboard',color:specs.color||'mint',specs,affiliate:{owner:r.affiliate_owner,url:r.affiliate_url},permission:{status:r.permission_status},evidence:{status:'verified',sources:[{creator:r.creator,title:r.title,url:r.source_url,origin:r.origin}]}};
        });
        if(env.DATA_MODE==='preview')return json({mode:'preview',products:[...products,...demoProducts.filter(p=>p.category!=='Audio')]});
        return json({mode:'live',products});
      }
      if(url.pathname==='/api/admin/import'&&request.method==='POST'){
        // The write endpoint is disabled until a secret is explicitly configured.
        if(!env.ADMIN_TOKEN || request.headers.get('Authorization')!==`Bearer ${env.ADMIN_TOKEN}`)return json({error:'Akses admin diperlukan.'},401);
        if(!env.DB)return json({error:'Database belum tersedia.'},503);
        if(request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return json({error:'Origin tidak sesuai.'},403);
        if(Number(request.headers.get('Content-Length'))>2200000)return json({error:'Berkas terlalu besar.'},413);
        // Bound streaming reads too: Content-Length may be missing or falsified.
        const reader=request.body?.getReader();if(!reader)return json({error:'Body kosong.'},400);
        let size=0;const chunks=[];
        while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2200000){await reader.cancel();return json({error:'Berkas terlalu besar.'},413);}chunks.push(value);}
        const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
        const body=JSON.parse(new TextDecoder().decode(bytes));
        const result=prepareImport(body.csv,body.config);
        if(body.commit!==true)return json(result);
        if(result.errors.length)return json({error:'Perbaiki semua baris sebelum menyimpan.',...result},422);
        if(!result.valid.length)return json({error:'Tidak ada baris valid.'},422);
        // D1 batch limits: cap transactional commits; larger CSVs can be previewed then split.
        if(result.valid.length>90)return json({error:'Simpan maksimal 90 baris per batch; pecah CSV terlebih dahulu.'},422);
        const batchId=crypto.randomUUID();
        await env.DB.batch([env.DB.prepare('INSERT INTO import_batches(id,origin,source_origin,row_count) VALUES(?,?,?,?)').bind(batchId,'shopee_csv',body.config.sourceOrigin,result.valid.length),...result.valid.map(r=>env.DB.prepare('INSERT INTO import_rows(batch_id,external_id,payload_json) VALUES(?,?,?)').bind(batchId,r.externalId,JSON.stringify(r)))]);
        return json({batchId,staged:result.valid.length,published:0},201);
      }
      if(url.pathname.startsWith('/api/'))return json({error:'Endpoint tidak tersedia.'},404);
      const response=await env.ASSETS.fetch(request);
      const secured=new Response(response.body,response);
      secured.headers.set('X-Content-Type-Options','nosniff');
      secured.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
      secured.headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
      return secured;
    }catch(e){console.error('Request failed:',e.message);return json({error:url.pathname==='/api/admin/import'?e.message:'Data belum dapat dimuat. Coba lagi nanti.'},url.pathname==='/api/admin/import'?400:503);}
  }
};
