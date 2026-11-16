export function parseCSV(text, delimiter=',') {
  if(![',',';','\t'].includes(delimiter))throw Error('Pemisah tidak didukung.');
  text=text.replace(/^\uFEFF/,'');
  const rows=[];let row=[],cell='',quoted=false,closed=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=ch;continue;}
    if(ch==='"'){if(cell||closed)throw Error('Tanda kutip CSV tidak valid.');quoted=true;continue;}
    if(ch===delimiter){row.push(cell);cell='';closed=false;continue;}
    if(ch==='\r'||ch==='\n'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';closed=false;continue;}
    if(closed)throw Error('Ada karakter setelah penutup kutip.');
    cell+=ch;
  }
  if(quoted)throw Error('Tanda kutip CSV belum ditutup.');
  row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
  if(rows.length<2)throw Error('CSV perlu header dan minimal satu baris data.');
  const headers=rows.shift().map(h=>h.trim());
  if(headers.some(h=>!h)||new Set(headers).size!==headers.length)throw Error('Header kosong atau duplikat.');
  if(rows.some(r=>r.length!==headers.length))throw Error('Jumlah kolom tidak konsisten. Periksa pemisah CSV.');
  if(rows.length>1000)throw Error('Maksimal 1.000 baris per impor.');
  return {headers,rows};
}
export function parsePrice(raw, format='integer') {
  let value=String(raw).trim().replace(/^Rp\s*/i,'');
  if(format==='id-ID'){
    if(!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,00)?$/.test(value))throw Error('Harga harus berupa rupiah penuh, misalnya 250.000 atau 250000.');
    value=value.replace(/\./g,'').replace(/,00$/,'');
  }else if(format==='integer'){
    if(!/^\d+$/.test(value))throw Error('Harga harus angka rupiah tanpa pemisah.');
  }else throw Error('Format harga tidak didukung.');
  const price=Number(value);if(!Number.isSafeInteger(price)||price<=0||price>1e12)throw Error('Harga di luar batas.');return price;
}
export function validAffiliateURL(raw) {
  try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&['shopee.co.id','www.shopee.co.id','shope.ee','s.shopee.co.id'].includes(u.hostname);}catch{return false;}
}
export function prepareImport(csv, config) {
  if(new TextEncoder().encode(csv).length>2e6)throw Error('CSV maksimal 2 MB.');
  const isKitab=config.sourceOrigin==='kitab_audio';
  if(!['shopee_csv','kitab_audio'].includes(config.sourceOrigin))throw Error('Asal sumber tidak didukung.');
  if(config.affiliateOwner!==(isKitab?'fernanda':'site'))throw Error('Pemilik affiliate tidak sesuai sumber: Kitab Audio wajib memakai affiliate Fernanda.');
  const {headers,rows}=parseCSV(csv,config.delimiter||',');
  const map=config.mapping||{};
  for(const k of ['externalId','name','price','affiliateUrl'])if(!headers.includes(map[k]))throw Error(`Pemetaan kolom ${k} belum benar.`);
  const seen=new Set(),valid=[],errors=[];
  rows.forEach((row,i)=>{
    const get=k=>row[headers.indexOf(map[k])]?.trim()||'';
    try{
      const externalId=get('externalId'), name=get('name'),affiliateUrl=get('affiliateUrl');
      if(!externalId||externalId.length>120||!name||name.length>250)throw Error('ID atau nama kosong/terlalu panjang.');
      if(seen.has(externalId))throw Error('ID produk duplikat dalam CSV.');seen.add(externalId);
      if(!validAffiliateURL(affiliateUrl))throw Error('Link affiliate harus HTTPS pada domain Shopee yang didukung.');
      const price=parsePrice(get('price'),config.priceFormat||'integer');
      valid.push({externalId,name,price,affiliateUrl,affiliateOriginalUrl:affiliateUrl,affiliateOwner:isKitab?'fernanda':'site',category:get('category')||null,sourceOrigin:config.sourceOrigin,status:'staged',stock:null});
    }catch(e){errors.push({row:i+2,message:e.message});}
  });
  return {valid,errors,total:rows.length};
}
