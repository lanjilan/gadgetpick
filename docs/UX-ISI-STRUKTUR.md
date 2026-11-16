# Fondasi UX, isi, dan struktur GadgetPick

Tanggal: 16 November 2026. Nama visual “pilih.” masih sementara. Dokumen ini menjadi acuan pengembangan, bukan hasil riset pengunjung yang sudah dilaksanakan.

## Sasaran produk

Pengunjung datang dengan kebutuhan, batas uang, dan tingkat pengetahuan yang berbeda. Website perlu membantu mereka menjawab: “Pilihan mana yang patut saya pertimbangkan, mengapa, apa komprominya, dan apa yang masih perlu saya cek?”

Selesai mengisi formulir belum berarti pengalaman berhasil. Pengunjung juga harus bisa menjelaskan keputusan yang dihasilkan. Kecepatan menyelesaikan alur dan pemahaman hasil dinilai terpisah.

Fokus fase ini adalah isi pertanyaan, urutan keputusan, hubungan konten, penjelasan, dan pemulihan kesalahan. Identitas merek, warna, gambar, dan dekorasi tidak dikembangkan pada fase ini.

## Dasar yang dipelajari dan penerapannya

### 1. Mental model: mulai dari cara pengunjung memikirkan kebutuhannya

Pengetahuan dan harapan pengunjung membentuk cara mereka menggunakan sebuah sistem. Struktur internal pengelola belum tentu sama dengan pemahaman pengunjung. Dasar: [NN/g — Mental Models](https://www.nngroup.com/articles/mental-models/).

Keputusan untuk website ini: pengunjung memilih barang yang sudah mereka cari, baru budget. IEM, TWS, processor, dan istilah umum lain tetap menjadi label utama. Bantuan istilah tersedia tanpa menghalangi alur. Pernyataan kebutuhan di bawah adalah hipotesis kerja dari brief, belum temuan wawancara:

- Pengunjung yang belum tahu jenis produk ingin dibantu tanpa harus belajar seluruh istilah terlebih dahulu.
- Pengunjung yang punya batas budget ingin batas itu dihormati, termasuk ketika belum ada hasil.
- Pengunjung yang sudah paham ingin bisa mempersempit hasil dan membaca sumber aslinya.
- Pengunjung yang membandingkan ingin memahami perbedaan yang terasa dalam pemakaian, bukan hanya huruf tier.

### 2. Recognition rather than recall dan kendali pengguna

Nielsen menganjurkan pilihan yang dapat dikenali, istilah yang sesuai dunia pengguna, status yang jelas, dan jalan untuk memperbaiki tindakan. Ini pedoman evaluasi, bukan jaminan bahwa suatu antarmuka sudah mudah digunakan. Dasar: [NN/g — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/).

Penerapan: jenis barang terlihat sebagai card; filter yang aktif tercantum di hasil; budget bisa diubah pada halaman yang sama. Tidak ada halaman pemeriksaan jawaban. Tombol kembali browser tetap digunakan untuk kembali ke pilihan sebelumnya.

### 3. Progressive disclosure: bantuan tersedia saat diperlukan

Pilihan lanjutan tidak harus mendominasi tugas utama. Informasi sekunder dapat dibuka ketika pengguna memerlukannya. Dasar: [NN/g — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/).

Penerapan: urutan prioritas terlihat dalam satu form. Syarat teknis opsional dan bantuan istilah dapat dibuka saat dibutuhkan. Kekurangan produk, sumber, pemilik komisi, dan keterbatasan harga tetap terlihat tanpa mewajibkan pertanyaan teknis tambahan.

### 4. Question protocol: setiap pertanyaan harus punya pekerjaan

GOV.UK menyarankan mengetahui alasan menanyakan setiap informasi, memberi ruang untuk “belum tahu”, menggunakan judul yang sesuai halaman, serta memulai dengan pertanyaan yang terfokus. Pengelompokan pertanyaan perlu alasan yang jelas. Dasar: [Question pages](https://design-system.service.gov.uk/patterns/question-pages/) dan [Designing good questions](https://www.gov.uk/service-manual/design/designing-good-questions).

Penerapan: satu form mengelompokkan rentang harga, satu atau dua prioritas yang diurutkan. Komponen PC ditanya prioritas dan syarat spesifik, tanpa diagnosis masalah atau memilih ulang jenis barang. Pertanyaan yang tidak mengubah rekomendasi dihapus. Tidak ada stepper atau konfirmasi sebelum hasil.

### 5. Information architecture: hubungan isi lebih luas dari menu

Arsitektur informasi mencakup pengelompokan, penamaan, hubungan konten, dan cara menemukannya. Peta halaman hanya satu gambaran dari struktur tersebut. Dasar: [NN/g — Information Architecture vs. Sitemaps](https://www.nngroup.com/articles/information-architecture-sitemaps/).

Penerapan: kebutuhan, produk, catatan reviewer, harga, istilah, dan tautan pembelian menjadi jenis informasi yang berbeda. Panduan menjelaskan istilah, halaman kurasi menjelaskan sumber dan komisi, dan detail produk menghubungkan hasil ke bukti. Produk tidak disusun menurut pemilik affiliate.

### 6. Bahasa yang jelas dan aksesibilitas kognitif

W3C menganjurkan kata yang mudah dimengerti, kalimat singkat, potongan isi yang jelas, dan isi yang tidak ambigu. Panduan kognitif ini melengkapi WCAG; penerapannya sendiri bukan bukti kepatuhan penuh. Dasar: [W3C — Clear and Understandable Content](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/).

Penerapan: instruksi singkat dan langsung. Istilah umum tidak diterjemahkan secara paksa. Penjelasan tambahan tersedia ketika dibutuhkan. Ringkasan tidak mengubah penilaian subjektif sumber menjadi fakta objektif.

## Struktur informasi yang digunakan

```text
Empat card utama
  Audio → TWS / IEM / Earphone / Headphone / Headset / OWS
  Smartphone & Tablet → Smartphone / Tablet
  Laptop
  Komponen PC → Monitor / Processor / RAM / SSD / HDD / GPU /
                Motherboard / PSU / Casing / CPU Cooler

Jenis yang punya data → satu form pertimbangan → hasil langsung
  Rentang harga Dari–Sampai + 1 prioritas utama dan 1 tambahan
  Syarat khusus opsional sesuai jenis barang; tidak ada diagnosis masalah
  Tanpa halaman periksa jawaban
  Filter tambahan dan urutan tetap di halaman hasil
Jenis tanpa data → keterangan langsung; tidak meminta budget

Card khusus Rakit PC
  “Bantu susun satu PC sesuai kebutuhan dan budget.”
  Budget + pemakaian → rakitan contoh + cek kompatibilitas
```

## Pertimbangan dalam satu halaman

| Pertimbangan | Fungsi |
| --- | --- |
| Rentang harga | Dua batas eksplisit; preset mengisi keduanya dan tetap dapat diedit |
| Satu atau dua prioritas berurutan | Yang pertama utama, kedua tambahan; tombol Jadikan utama menukar urutan |
| Syarat khusus opsional | OS, storage, RAM, koneksi, DDR, interface, atau platform sesuai jenis barang |

Tidak ada halaman konfirmasi, pertanyaan masalah PC, atau pertanyaan pemakaian terpisah. Gaming, kamera, baterai, dan pilihan lain berada dalam satu kelompok prioritas. Dukungan prioritas tambahan tidak dapat mengalahkan dukungan untuk prioritas utama. Bantuan boleh dibuka tanpa melewati tahap tambahan. Kamera/baterai/performa/update untuk smartphone, mobilitas/layar/upgrade untuk laptop, serta karakter suara/mikrofon/kenyamanan untuk audio tidak disamaratakan.

Preset kelas harga adalah panduan buatan situs, bukan standar industri. Flagship adalah posisi lini produk suatu brand dan tidak diturunkan otomatis dari harga. Produk di luar kedua batas tidak dimasukkan untuk mengisi daftar.

## Kedalaman hasil

Setiap pilihan mempunyai alasan yang menghubungkan jawaban dengan catatan sumber, status dukungan untuk tiap prioritas, kekurangan, dan bagian yang belum diketahui. Dukungan sebagian tidak dinyatakan sebagai bukti penuh. Tag warna layar tidak membuktikan kualitas kamera; tag respons aplikasi tidak membuktikan FPS. Hasil tanpa bukti prioritas diberi keterangan sebagai pilihan awal dalam rentang, bukan rekomendasi personal yang sudah terbukti cocok.

## Aturan isi dan bahasa

- Judul menjelaskan tugas atau jenis barang. Hindari slogan abstrak dan kalimat berpasangan yang terasa seperti iklan.
- Instruksi singkat: “Budgetmu berapa?”, “Lihat pilihan”, “Lihat detail”.
- Istilah umum tetap dipakai: TWS, IEM, processor, GPU, RAM, SSD, HDD, motherboard. Penjelasan ada di panduan, tidak dipaksakan sebagai pengganti istilah.
- Kekurangan produk dan sumber asli tetap terlihat. Perbedaan preferensi tidak disebut sebagai kecocokan penuh.
- Produk contoh diberi label dan tidak memiliki link belanja. Jenis yang belum punya data tidak diisi rekomendasi dari jenis lain.

## Aturan data

Katalog lokal memuat 12 produk audio dari Kitab Audio dan 13 produk contoh di kategori lain. Tautan affiliate Fernanda dipertahankan persis seperti sumber. Tidak ada data harga, stok, FPS, atau kompatibilitas nyata yang dibuat-buat.

IEM, earphone, headphone, dan headset disaring terpisah berdasarkan metadata. Audio personal tidak mencakup speaker atau DAC. SSD tidak dipakai sebagai hasil HDD. Pemakaian gaming atau meeting tidak diisi produk yang hanya memiliki catatan musik.

## Pemeriksaan

Uji alur nyata: Audio → TWS → pilih budget → Lihat pilihan; Komponen PC → RAM → pilih budget → Lihat pilihan. Hasil muncul tanpa konfirmasi atau pertanyaan tambahan. Uji juga tipe yang belum punya data, budget rendah, filter pemakaian tanpa dukungan review, reload, tombol kembali browser, detail, perbandingan, dan layar kecil.

Ini rancangan berdasarkan brief dan pemeriksaan lokal, bukan hasil riset pengguna. Pemahaman pengunjung nyata masih perlu diuji.
