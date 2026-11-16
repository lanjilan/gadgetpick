const option=(value,label,note='')=>({value,label,note});
const field=(id,label,values,helper='')=>({id,label,options:values.map(([value,label])=>({value,label})),helper});
const ranges=(rows)=>rows.map(([label,min,max])=>({label,min,max}));
const tone=[option('balanced','Suara seimbang','Bass, vokal, dan treble tidak terlalu saling menutupi.'),option('bass','Bass lebih terasa'),option('vocal','Vokal lebih menonjol'),option('comfort','Nyaman dipakai lama')];
export function decisionConfig(entry){
  const common={priorities:[],constraints:[],intro:'Pilih rentang harga dan urutan prioritasmu. Kami jelaskan alasan tiap pilihan, termasuk yang masih perlu dicek.'};
  if(entry.category==='HP')return {...common,
    priceRanges:ranges([['Entry-level',1000000,3000000],['Mid-range',3000000,6000000],['Upper mid-range',6000000,10000000],['High-end',10000000,15000000],['Premium',15000000,30000000]]),
    priceHelp:'Rentang ini panduan belanja di web ini, bukan batas resmi industri. Web ini memakai istilah mid-range untuk kelas menengah. High-end dan flagship sering tumpang tindih; flagship adalah lini unggulan suatu brand, jadi harganya tidak selalu masuk satu rentang tertentu.',
    priorities:[option('gaming','Gaming & performa','Performa game, kestabilan, dan pengendalian panas.'),option('camera','Kamera foto & video','Kualitas foto dan rekaman video.'),option('battery','Daya tahan baterai','Lebih lama digunakan tanpa sering mengisi daya.'),option('allrounder','Serba bisa (all-rounder)','Kualitas menyeluruh tanpa satu aspek yang terlalu dikorbankan.')],
    constraints:[field('os','Sistem operasi',[['unknown','Fleksibel / belum tahu'],['android','Android'],['ios','iOS']]),field('storageGB','Storage minimal',[['unknown','Belum ada patokan'],['128','128 GB'],['256','256 GB'],['512','512 GB']]),field('phoneSize','Ukuran smartphone',[['unknown','Belum menentukan'],['compact','Lebih ringkas'],['large','Layar lebih besar']]),field('displayPreference','Kualitas layar',[['unknown','Fleksibel'],['important','Penting untuk saya']],'Dipertimbangkan jika ada data pengujian layar yang memadai.'),field('softwareUpdates','Dukungan pembaruan',[['unknown','Fleksibel'],['important','Penting untuk saya']],'Informasi update perlu dipastikan dari dukungan resmi tiap produk.')]};
  if(entry.category==='Laptop')return {...common,
    priceRanges:ranges([['Terjangkau',3000000,6000000],['Menengah',6000000,10000000],['Menengah atas',10000000,15000000],['Premium',15000000,25000000]]),
    priorities:[option('gaming','Gaming'),option('creative','Desain / editing'),option('coding','Coding'),option('portable','Ringan dan mudah dibawa'),option('battery','Baterai awet'),option('display','Layar untuk pekerjaan visual'),option('upgrade','RAM / storage bisa di-upgrade'),option('quiet','Suhu dan suara kipas')],
    constraints:[field('memoryGB','RAM minimal',[['unknown','Belum ada patokan'],['8','8 GB'],['16','16 GB'],['32','32 GB']]),field('os','Sistem operasi',[['unknown','Fleksibel / belum tahu'],['windows','Windows'],['macos','macOS']])]};
  if(entry.category==='Tablet')return {...common,
    priceRanges:ranges([['Terjangkau',1000000,3000000],['Menengah',3000000,6000000],['Menengah atas',6000000,10000000],['Premium',10000000,20000000]]),
    priorities:[option('stylus','Menulis / menggambar dengan stylus'),option('gaming','Gaming'),option('display','Kualitas dan ruang layar'),option('portable','Mudah dibawa'),option('battery','Baterai awet')],
    constraints:[field('os','Sistem operasi',[['unknown','Fleksibel / belum tahu'],['android','Android'],['ipados','iPadOS']]),field('storageGB','Storage minimal',[['unknown','Belum ada patokan'],['128','128 GB'],['256','256 GB']])]};
  if(entry.category==='Audio')return {...common,
    priceRanges:ranges([['Rp200–500 ribu',200000,500000],['Rp500 ribu–1 juta',500000,1000000],['Rp1–2 juta',1000000,2000000],['Rp2–5 juta',2000000,5000000]]),
    priorities:[option('gaming','Gaming'),...tone,...(['tws','headphone','ows'].includes(entry.kind)?[option('anc','Meredam suara sekitar')]:[]),option('mic','Mikrofon / meeting')],
    constraints:[field('connection','Koneksi yang ingin dipakai',[['unknown','Fleksibel / belum tahu'],['bluetooth','Bluetooth'],['jack','Jack 3,5 mm'],['usbc','USB-C']],'Dukungan koneksi tetap diperiksa dari data produk, bukan ditebak dari namanya.')]};
  if(entry.category==='Monitor')return {...common,
    priceRanges:ranges([['Rp1–2 juta',1000000,2000000],['Rp2–3,5 juta',2000000,3500000],['Rp3,5–5 juta',3500000,5000000],['Rp5–10 juta',5000000,10000000]]),
    priorities:[option('display','Warna untuk desain'),option('refresh','Refresh rate untuk gaming'),option('workspace','Ruang layar lebih luas'),option('portable','Pas di meja kecil')],
    constraints:[field('connection','Koneksi layar',[['unknown','Fleksibel / belum tahu'],['hdmi','HDMI'],['displayport','DisplayPort'],['usbc','USB-C untuk layar']])]};
  const priorities={
    processor:[option('performance','Performa aplikasi / game'),option('efficiency','Daya dan suhu'),option('upgrade','Pilihan upgrade platform')],
    ram:[option('capacity','Kapasitas'),option('speed','Kecepatan'),option('compatibility','Kecocokan dengan PC')],
    ssd:[option('capacity','Kapasitas'),option('speed','Kecepatan transfer'),option('endurance','Daya tahan tulis')],
    hdd:[option('capacity','Kapasitas'),option('quiet','Suara dan getaran'),option('endurance','Daya tahan')],
    gpu:[option('performance','Performa game / aplikasi'),option('efficiency','Daya dan suhu'),option('quiet','Suara kipas')],
    motherboard:[option('connectivity','Port dan slot'),option('upgrade','Ruang upgrade'),option('compatibility','Kecocokan platform')],
    psu:[option('reliability','Proteksi dan kualitas'),option('efficiency','Efisiensi'),option('quiet','Suara kipas')],
    casing:[option('cooling','Airflow'),option('workspace','Ruang komponen'),option('quiet','Suara')],
    cooler:[option('cooling','Kemampuan pendinginan'),option('quiet','Suara kipas'),option('compatibility','Kecocokan socket / casing')]
  };
  const contexts={
    ram:[field('memoryType','Jenis RAM',[['unknown','Belum tahu / belum menentukan'],['DDR4','DDR4'],['DDR5','DDR5']])],
    ssd:[field('storageInterface','Interface SSD',[['unknown','Belum tahu / belum menentukan'],['nvme','M.2 NVMe'],['sata','SATA']])],
    hdd:[field('driveSize','Ukuran drive',[['unknown','Belum menentukan'],['2.5','2,5 inci'],['3.5','3,5 inci']])],
    processor:[field('cpuBrand','Platform processor',[['unknown','Belum menentukan'],['amd','AMD'],['intel','Intel']])]
  };
  return {...common,priorities:priorities[entry.kind]||[],constraints:contexts[entry.kind]||[],priceRanges:ranges([['Rp200–500 ribu',200000,500000],['Rp500 ribu–1 juta',500000,1000000],['Rp1–2 juta',1000000,2000000],['Rp2–5 juta',2000000,5000000]])};
}
export function priorityOptions(entry){return entry.priorities;}
