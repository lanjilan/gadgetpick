import {decisionConfig} from './decision-config.js';
const audio=(id,label,description,art)=>({id:'audio/'+id,category:'Audio',kind:id,label,description,art,color:'mint',group:'audio'});
const pc=(id,label,description,art='ram')=>({id:'komponen-pc/'+id,category:id==='monitor'?'Monitor':'Komponen PC',kind:id,label,description,art,color:'sand',group:'komponen-pc'});
export const entries=[
  audio('tws','TWS','Tanpa kabel, dengan charging case.','tws'),
  audio('iem','IEM','Masuk ke telinga, biasanya memakai eartips.','iem'),
  audio('earphone','Earphone','Earphone dan earbuds berkabel lainnya.','iem'),
  audio('headphone','Headphone','Dipakai di kepala, fokus untuk mendengarkan.','headphone'),
  audio('headset','Headset','Headphone dengan mikrofon untuk ngobrol.','headphone'),
  audio('ows','OWS / Open-ear','Mendengarkan dengan telinga tetap terbuka.','tws'),
  {id:'smartphone-tablet/smartphone',category:'HP',label:'Smartphone',description:'Untuk harian, foto, kerja, atau gaming.',art:'phone',color:'blue',group:'smartphone-tablet'},
  {id:'smartphone-tablet/tablet',category:'Tablet',label:'Tablet',description:'Untuk belajar, menggambar, kerja, atau hiburan.',art:'tablet',color:'peach',group:'smartphone-tablet'},
  {id:'laptop',category:'Laptop',label:'Laptop',description:'Untuk kuliah, kerja, desain, atau gaming.',art:'laptop',color:'lilac'},
  {...pc('monitor','Monitor','Layar untuk kerja, desain, atau gaming.','monitor')},
  pc('processor','Processor','CPU untuk PC-mu.'),
  pc('ram','RAM','Memori untuk aplikasi dan multitasking.'),
  pc('ssd','SSD','Storage untuk sistem, aplikasi, dan file.','ssd'),
  pc('hdd','HDD','Storage untuk menyimpan banyak file.','ssd'),
  pc('gpu','GPU','Untuk grafis, game, dan aplikasi yang mendukung.'),
  pc('motherboard','Motherboard','Board yang menghubungkan komponen PC.'),
  pc('psu','PSU','Power supply untuk PC.'),
  pc('casing','Casing','Tempat komponen dan pengaturan airflow.'),
  pc('cooler','CPU Cooler','Pendingin untuk processor.')
].map(entry=>({...entry,...decisionConfig(entry)}));
export const groups={
  audio:{label:'Audio',title:'Mau cari audio apa?',description:'Pilih jenis yang kamu cari.'},
  'smartphone-tablet':{label:'Smartphone & Tablet',title:'Smartphone atau tablet?',description:'Pilih perangkatnya dulu.'},
  'komponen-pc':{label:'Komponen PC',title:'Mau cari komponen apa?',description:'Pilih langsung barang yang kamu cari.'}
};
export const findEntry=id=>entries.find(e=>e.id===id);
export function audioType(product){
  const type=String(product.specs?.subtype||product.visual||'').toLowerCase();
  if(/\bows\b|open[ -]?ear/.test(type))return 'ows';
  if(/\btws\b/.test(type))return 'tws';
  if(/headset/.test(type))return 'headset';
  if(/headphone/.test(type))return 'headphone';
  if(/\biem\b/.test(type))return 'iem';
  if(/earphone|earbud/.test(type))return 'earphone';
  return null;
}
export function matchesEntry(product,entry){
  if(!entry||product.category!==entry.category)return false;
  if(entry.category==='Audio')return audioType(product)===entry.kind;
  if(entry.category!=='Komponen PC')return true;
  const type=String(product.specs?.componentType||product.specs?.type||product.visual||'').toLowerCase();
  const aliases={cpu:'processor',case:'casing',power_supply:'psu',storage_ssd:'ssd',storage_hdd:'hdd'};
  return (aliases[type]||type)===entry.kind;
}
