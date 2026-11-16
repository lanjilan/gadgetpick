// Fictional parts with explicit technical metadata. No real performance claims.
export const parts = [
  {id:'cpu-a',type:'cpu',name:'CPU A · 6 core + iGPU',price:1700000,socket:'S-A',memory:'DDR4',tdp:65,igpu:true,score:1},
  {id:'cpu-b',type:'cpu',name:'CPU B · 8 core',price:3000000,socket:'S-B',memory:'DDR5',tdp:105,igpu:false,score:2},
  {id:'board-a',type:'motherboard',name:'Board A · mATX DDR4',price:1100000,socket:'S-A',memory:'DDR4',form:'mATX',m2:true,maxRam:64,biosCpuIds:['cpu-a'],pcieX16:true},
  {id:'board-b',type:'motherboard',name:'Board B · mATX DDR5',price:1800000,socket:'S-B',memory:'DDR5',form:'mATX',m2:true,maxRam:128,biosCpuIds:['cpu-b'],pcieX16:true},
  {id:'ram-a',type:'ram',name:'RAM 16 GB · 2 × 8 DDR4',price:600000,memory:'DDR4',capacity:16,height:35},
  {id:'ram-b',type:'ram',name:'RAM 32 GB · 2 × 16 DDR4',price:1000000,memory:'DDR4',capacity:32,height:35},
  {id:'ram-c',type:'ram',name:'RAM 32 GB · 2 × 16 DDR5',price:1300000,memory:'DDR5',capacity:32,height:38},
  {id:'gpu-none',type:'gpu',name:'Grafis terintegrasi CPU',price:0,watts:0,length:0,slots:0,connectors:0,score:0},
  {id:'gpu-a',type:'gpu',name:'GPU A · 8 GB',price:2500000,watts:130,length:240,slots:2,connectors:1,score:1},
  {id:'gpu-b',type:'gpu',name:'GPU B · 12 GB',price:4200000,watts:200,length:290,slots:3,connectors:2,score:2},
  {id:'ssd-a',type:'storage',name:'SSD NVMe 500 GB',price:500000,interface:'M.2 NVMe'},
  {id:'ssd-b',type:'storage',name:'SSD NVMe 1 TB',price:850000,interface:'M.2 NVMe'},
  {id:'psu-a',type:'psu',name:'PSU 550 W · ATX',price:650000,watts:550,pcieConnectors:2,form:'ATX'},
  {id:'psu-b',type:'psu',name:'PSU 650 W · ATX',price:850000,watts:650,pcieConnectors:2,form:'ATX'},
  {id:'case-a',type:'case',name:'Casing Compact · mATX',price:450000,forms:['mATX'],maxGpu:270,gpuSlots:2,maxCooler:155,psuForm:'ATX'},
  {id:'case-b',type:'case',name:'Casing Airflow · ATX',price:700000,forms:['ATX','mATX'],maxGpu:330,gpuSlots:4,maxCooler:170,psuForm:'ATX'},
  {id:'cooler-a',type:'cooler',name:'Cooler Tower · 120 mm',price:250000,sockets:['S-A','S-B'],height:150,capacity:150,ramClearance:40}
];
export const partTypes = {cpu:'Processor',motherboard:'Motherboard',ram:'RAM',gpu:'GPU',storage:'Penyimpanan',psu:'Power supply',case:'Casing',cooler:'Pendingin CPU'};
export function checkCompatibility(build) {
  const checks = [];
  const add = (label, ok, detail) => checks.push({label,status:ok === null?'unknown':ok?'pass':'fail',detail});
  const {cpu,motherboard:m,ram,gpu,storage,psu,case:c,cooler} = build;
  if (Object.keys(partTypes).some(k=>!build[k])) return [{label:'Kelengkapan komponen',status:'fail',detail:'Delapan kelompok komponen wajib dipilih.'}];
  const known = (...v) => v.every(x=>x!==undefined && x!==null);
  add('Socket CPU & motherboard',known(cpu.socket,m.socket)?cpu.socket===m.socket:null,'Socket harus sama; versi BIOS diperiksa terpisah.');
  add('Generasi & kapasitas RAM',known(cpu.memory,m.memory,ram.memory,ram.capacity,m.maxRam)?cpu.memory===ram.memory&&m.memory===ram.memory&&ram.capacity<=m.maxRam:null,'Jenis DDR CPU, motherboard, dan RAM harus sesuai.');
  add('Dukungan BIOS',Array.isArray(m.biosCpuIds)?m.biosCpuIds.includes(cpu.id)?true:null:null,'Data contoh mencantumkan dukungan eksplisit. Produk nyata wajib memakai CPU support list dan versi BIOS pabrikan.');
  add('Output grafis',known(gpu.watts,cpu.igpu,m.pcieX16)?gpu.id==='gpu-none'?cpu.igpu:m.pcieX16:null,'Tanpa GPU terpisah, CPU harus memiliki grafis terintegrasi; port layar tetap perlu diperiksa.');
  add('Motherboard & casing',known(c.forms,m.form)?c.forms.includes(m.form):null,'Form factor motherboard harus didukung casing.');
  add('Ukuran & slot GPU',known(gpu.length,c.maxGpu,gpu.slots,c.gpuSlots)?gpu.length<=c.maxGpu&&gpu.slots<=c.gpuSlots:null,'Termasuk batas panjang kartu dan jumlah slot.');
  add('Cooler, socket & RAM',known(cooler.sockets,cooler.height,c.maxCooler,cooler.capacity,cpu.tdp,cooler.ramClearance,ram.height)?cooler.sockets.includes(cpu.socket)&&cooler.height<=c.maxCooler&&cooler.capacity>=cpu.tdp&&ram.height<=cooler.ramClearance:null,'Cek bracket, tinggi cooler, kapasitas pendinginan dan jarak RAM.');
  add('Slot penyimpanan',known(storage.interface,m.m2)?storage.interface==='M.2 NVMe'&&m.m2:null,'Produk nyata perlu memeriksa panjang M.2, protokol dan pembagian lane.');
  const estimated = known(cpu.tdp,gpu.watts)?cpu.tdp+gpu.watts+80:null;
  add('Daya, konektor & ukuran PSU',known(estimated,psu.watts,psu.pcieConnectors,gpu.connectors,psu.form,c.psuForm)?psu.watts>=estimated*1.35&&psu.pcieConnectors>=gpu.connectors&&psu.form===c.psuForm:null,estimated?`Perkiraan beban ${estimated} W + cadangan 35%. Mutu PSU, EPS/ATX dan kabel asli tetap harus diverifikasi.`:'Data daya belum lengkap.');
  return checks;
}
export function makeBuild(budget, purpose='gaming') {
  if (!Number.isFinite(budget)||budget<0) return {error:'Masukkan budget yang valid.'};
  const options = k => parts.filter(p=>p.type===k);
  let best=null, minimum=Infinity;
  for (const cpu of options('cpu')) for (const motherboard of options('motherboard')) for (const ram of options('ram')) for (const gpu of options('gpu')) for (const storage of options('storage')) for (const psu of options('psu')) for (const c of options('case')) {
    const build={cpu,motherboard,ram,gpu,storage,psu,case:c,cooler:options('cooler')[0]};
    if(checkCompatibility(build).some(c=>c.status!=='pass')) continue;
    const total=Object.values(build).reduce((s,p)=>s+p.price,0);minimum=Math.min(minimum,total);
    if(total>budget)continue;
    const score = purpose==='desain'?cpu.score*90+ram.capacity*4+gpu.score*35+(storage.id==='ssd-b'?25:0):purpose==='kerja'?cpu.score*45+ram.capacity*3+(storage.id==='ssd-b'?30:0)+gpu.score*2:gpu.score*150+cpu.score*35+ram.capacity+(storage.id==='ssd-b'?15:0);
    if(!best||score>best.score||(score===best.score&&total<best.total)) best={build,total,score};
  }
  return best || {error:'Belum ada konfigurasi contoh lengkap dalam budget ini.',minimum};
}
export function partReason(type,purpose){return ({cpu:purpose==='desain'?'Memprioritaskan ruang kerja CPU untuk aplikasi kreatif.':'Menyeimbangkan alokasi CPU dengan komponen lain.',motherboard:'Dipilih berdasarkan socket, DDR dan dukungan CPU pada data contoh.',ram:purpose==='desain'?'Kapasitas mendapat bobot lebih tinggi untuk multitasking desain.':'Kit dua modul; jenis DDR disesuaikan dengan platform.',gpu:purpose==='gaming'?'Porsi budget GPU mendapat prioritas untuk skenario gaming.':'Akselerasi GPU tergantung aplikasi yang digunakan.',storage:'Ruang sistem dan proyek; kapasitas dapat ditingkatkan.',psu:'Memenuhi perkiraan daya, cadangan dan konektor pada data contoh.',case:'Ukuran disesuaikan dengan motherboard, GPU dan cooler.',cooler:'Bracket, tinggi, jarak RAM dan kapasitas diperiksa.'})[type];}
