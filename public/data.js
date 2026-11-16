// All products, prices and editorial notes here are fictional interface fixtures.
export const categories = ['Audio', 'HP', 'Tablet', 'Laptop', 'Monitor', 'Komponen PC'];
const item = (id, name, category, price, character, needs, headline, minus, visual, color, tier = 'Pilihan utama') => ({
  id, name, category, price, character, needs, headline, minus, visual, color, tier,
  demo: true, priceStatus: 'simulasi', stock: null,
  evidence: { status: 'demo', sources: [], note: 'Skenario editorial buatan untuk menguji antarmuka. Bukan kutipan atau hasil pengujian produk nyata.' },
  affiliate: { owner: null, url: null }, permission: { status: 'not_applicable', proofUrl: null },
  specs: { category, character: character.join(', '), use: needs.join(', ') }
});
export const demoProducts = [
  item('audio-01', 'IEM Balanced 01', 'Audio', 250000, ['Balanced', 'Vokal'], ['Musik', 'Kuliah'], 'Untuk yang ingin instrumen dan vokal terasa sama menonjol.', 'Skenario: kurang cocok untuk pencari bass yang dominan.', 'iem', 'mint'),
  item('monitor-01', 'Monitor IPS 24', 'Monitor', 1600000, ['Warna natural', 'Ringkas'], ['Desain', 'Kuliah'], 'Ruang kerja cukup lega, tetap nyaman di meja kecil.', 'Skenario: bukan pilihan untuk pekerjaan warna profesional.', 'monitor', 'peach'),
  item('audio-02', 'Headphone Bass 02', 'Audio', 550000, ['Bass', 'Hangat'], ['Musik', 'Gaming'], 'Skenario suara hangat untuk menikmati musik santai.', 'Skenario: bass dapat menutupi detail vokal.', 'headphone', 'sand'),
  item('phone-01', 'HP Harian 01', 'HP', 2500000, ['Baterai awet', 'Ringkas'], ['Kuliah', 'Kerja'], 'Skenario ponsel harian dengan prioritas daya tahan.', 'Skenario: kemampuan kamera malam terbatas.', 'phone', 'blue'),
  item('component-01', 'SSD NVMe 1 TB', 'Komponen PC', 850000, ['Responsif', 'Ringkas'], ['Gaming', 'Desain'], 'Skenario ruang penyimpanan untuk aplikasi dan proyek.', 'Skenario: ketahanan tulis perlu diperiksa dari spesifikasi asli.', 'ssd', 'mint'),
  item('audio-03', 'IEM Vokal 03', 'Audio', 180000, ['Vokal', 'Terang'], ['Musik', 'Kuliah'], 'Untuk mencoba fokus vokal dengan anggaran lebih kecil.', 'Skenario: treble bisa terasa tajam bagi sebagian orang.', 'iem', 'peach', 'Alternatif hemat'),
  item('audio-04', 'TWS Santai 04', 'Audio', 400000, ['Bass', 'Wireless'], ['Musik', 'Kerja'], 'Skenario audio praktis untuk berpindah tempat.', 'Skenario: latensi belum cocok untuk permainan kompetitif.', 'tws', 'lilac'),
  item('monitor-02', 'Monitor QHD 27', 'Monitor', 3200000, ['Warna natural', 'Responsif'], ['Desain', 'Gaming'], 'Skenario layar lebih luas untuk beberapa jendela kerja.', 'Skenario: gaming QHD menuntut GPU lebih kuat.', 'monitor', 'blue'),
  item('phone-02', 'HP Kreator 02', 'HP', 5000000, ['Warna natural', 'Responsif'], ['Desain', 'Kerja'], 'Skenario ponsel dengan fokus pekerjaan visual.', 'Skenario: daya tahan saat merekam video belum diverifikasi.', 'phone', 'lilac'),
  item('component-02', 'RAM Kit 32 GB', 'Komponen PC', 1200000, ['Responsif'], ['Desain', 'Gaming'], 'Skenario kapasitas untuk bekerja dengan banyak aplikasi.', 'Skenario: generasi DDR harus sesuai motherboard.', 'ram', 'peach'),
  item('tablet-01', 'Tablet Belajar 01', 'Tablet', 3000000, ['Baterai awet', 'Layar lega'], ['Kuliah', 'Hiburan'], 'Skenario tablet untuk membaca materi dan menonton.', 'Skenario: dukungan pena dan aplikasi kuliah belum diperiksa.', 'tablet', 'peach'),
  item('tablet-02', 'Tablet Ringkas 02', 'Tablet', 4000000, ['Ringkas', 'Baterai awet'], ['Kuliah', 'Kerja', 'Hiburan'], 'Skenario tablet ringkas untuk berpindah tempat.', 'Skenario: ruang layar lebih terbatas untuk beberapa jendela.', 'tablet', 'blue'),
  item('tablet-03', 'Tablet Kreatif 03', 'Tablet', 7000000, ['Warna natural', 'Responsif', 'Layar lega'], ['Desain', 'Kerja', 'Gaming'], 'Skenario tablet dengan fokus pekerjaan visual.', 'Skenario: pena, aplikasi, dan game tertentu belum diverifikasi.', 'tablet', 'lilac'),
  item('laptop-01', 'Laptop Harian 01', 'Laptop', 6000000, ['Responsif'], ['Kuliah', 'Kerja'], 'Skenario laptop untuk dokumen, belajar, dan browser.', 'Skenario: kemampuan aplikasi berat dan upgrade RAM belum diperiksa.', 'laptop', 'mint'),
  item('laptop-02', 'Laptop Mobilitas 02', 'Laptop', 9000000, ['Ringkas', 'Baterai awet'], ['Kuliah', 'Kerja', 'Pemrograman'], 'Skenario laptop dengan prioritas mudah dibawa.', 'Skenario: bobot, daya tahan baterai, dan dukungan aplikasi masih simulasi.', 'laptop', 'blue'),
  item('laptop-03', 'Laptop Kreatif 03', 'Laptop', 12000000, ['Warna natural', 'Responsif'], ['Desain', 'Kerja'], 'Skenario laptop untuk pekerjaan visual.', 'Skenario: akurasi layar dan kecepatan aplikasi belum dibuktikan.', 'laptop', 'peach'),
  item('laptop-04', 'Laptop Gaming 04', 'Laptop', 13000000, ['Responsif'], ['Gaming', 'Pemrograman'], 'Skenario laptop dengan fokus bermain game.', 'Skenario: belum ada data FPS, suhu, atau pengujian game tertentu.', 'laptop', 'sand')
];
