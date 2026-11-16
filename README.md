# pilih. — preview rekomendasi tech & PC builder

Nama dan identitas visual masih sementara. Implementasi di folder ini berdiri sendiri, tanpa mengubah Akunly atau Nomorly. Belum dipublikasikan ke produksi.

## Buka preview

Alamat saat server berjalan: **http://127.0.0.1:8787**.

Di folder proyek, gunakan Node.js 24 atau versi yang didukung Wrangler:

```powershell
npm ci
npm run db:local
node scripts/seed-kitab.js
node node_modules/wrangler/bin/wrangler.js d1 execute pilih-db --local --file scripts/kitab-seed.sql
npm run dev
```

`database_id` nol di `wrangler.jsonc` adalah penanda untuk lingkungan lokal. Semua langkah di atas memakai D1 lokal, tidak membuat database cloud atau memublikasikan situs. Jika ada masalah dengan `npx` pada Windows, gunakan pemanggilan `node node_modules/wrangler/bin/wrangler.js` seperti contoh.

## Alur pengunjung

1. Pilih kategori dan jenis barang lewat card. Audio langsung membuka TWS, IEM, earphone, headphone, headset, dan OWS. Komponen PC langsung membuka monitor dan jenis komponennya. Rakit PC tetap card khusus.
2. Dalam satu form, isi rentang harga Dari–Sampai dan satu bagian “Apa yang paling penting buatmu?”. Pilihan pertama menjadi prioritas utama, pilihan kedua tambahan. Ada opsi Seimbang / bantu pilih. Pertanyaan pemakaian terpisah dihapus. Tidak ada stepper atau halaman periksa jawaban.
3. Syarat spesifik seperti OS, storage, RAM, koneksi, atau DDR tersedia secara opsional sesuai jenis barang. Tidak ada diagnosis masalah PC.
4. Hasil menampilkan alasan, dukungan data untuk setiap prioritas sesuai urutannya, kekurangan, dan hal yang belum terverifikasi. Prioritas utama didahulukan dalam pengurutan; dukungan prioritas tambahan tidak bisa menutupi ketidakjelasan prioritas utama. Tiga pilihan awal ditampilkan; sisanya dapat dibuka di halaman yang sama. Rentang dan preferensi bisa diubah langsung.

Preset smartphone: Entry-level Rp1–3 juta, Mid-range Rp3–6 juta, Upper mid-range Rp6–10 juta, High-end Rp10–15 juta, Premium Rp15–30 juta. Ini panduan navigasi buatan situs yang bisa diubah, bukan klasifikasi resmi. Flagship menjelaskan posisi lini produk suatu brand, bukan satu batas harga. Preset kategori lain memakai rentang yang berbeda.

Kedua batas harga diterapkan secara inklusif. Produk lebih murah dari batas bawah tidak diselipkan sebagai hasil. Harga yang belum tercatat tidak dianggap memenuhi rentang. Mode semua harga harus dipilih secara eksplisit.

Prioritas dinilai dari metadata yang tersedia. Tag seperti Responsif atau Warna natural hanya mendukung catatan sebagian, tidak membuktikan FPS, kualitas kamera, gamut, atau performa aplikasi tertentu. Tidak ada persentase kecocokan. Klaim kamera tidak diturunkan dari tag warna layar. Spesifikasi yang diketahui bertentangan dengan syarat disisihkan; spesifikasi yang belum ada ditandai belum terverifikasi.

Sesi disimpan per jenis barang. Format sesi v5 menyimpan urutan prioritas. Sesi v4 mempertahankan rentang dan syarat, tetapi pilihan yang tadinya tidak berurutan tidak otomatis dianggap sebagai prioritas utama. Kategori tanpa produk langsung memberi keterangan sebelum form. Smartphone, laptop, tablet, monitor, dan komponen PC masih data contoh; belum rekomendasi belanja nyata. Audio memakai sumber dan affiliate Fernanda yang dipertahankan.

## Yang sudah bisa dipakai

- Pilihan jenis produk langsung, satu form rentang harga dan urutan prioritas, syarat opsional, serta penjelasan hasil pada halaman yang sama.
- Detail alasan, kompromi, tanggal catatan harga, sumber sampai ke baris sheet, dan pemilik affiliate.
- Perbandingan maksimal tiga profil. Tier/value tidak disetarakan lintas jenis audio.
- PC builder berdasarkan budget dan gaming/desain/kerja, delapan kelompok komponen lengkap, total harga, penjelasan alokasi, penggantian manual, dan penyalinan hasil.
- Sembilan pemeriksaan aturan: socket; jenis/kapasitas RAM; dukungan BIOS; grafis; motherboard/casing; ukuran/slot GPU; cooler/bracket/RAM; slot penyimpanan; dan kapasitas/konektor/ukuran PSU. Metadata yang hilang menghasilkan status belum diketahui.
- Pratinjau CSV lokal dengan pemetaan header, koma/titik koma/tab, harga rupiah utuh/format Indonesia, serta rincian kesalahan per baris.
- Alat impor staging D1 dan endpoint admin dengan autentikasi. Impor tidak otomatis menerbitkan rekomendasi.

## Data nyata dan data contoh

**12 profil audio nyata** sudah dimasukkan dari [Kitab Audio Fernanda Gunsan](https://docs.google.com/spreadsheets/d/1KXDCrMErS1ZjjJhxjTYqNax1bjWWl4peXv0eaLMlxVc/edit), yang ditemukan melalui [profil Fernanda](https://lynk.id/fernandagunsan). Sheet berjudul “Update 6-11-26” dibaca pada 16 November 2026. Pemilihan awal mencakup 4 IEM, 4 TWS, dan 4 headphone wireless. Ini bukan salinan seluruh Kitab.

Izin dicatat berdasarkan konfirmasi pengguna di chat pada 16 November 2026. Konfirmasi ini menggantikan status lama yang belum mendapat izin. `sources.permission_confirmation` menyimpan dasar tersebut; `permission_proof_url` menunjuk chat, bukan bukti percakapan dengan Fernanda yang diklaim sudah kami lihat.

Catatan produk adalah ringkasan editorial dari penilaian subjektif Fernanda. Situs tidak mengaku menguji produk itu sendiri. Tag suara menyederhanakan catatan; bukan konversi skor kualitas bass menjadi kuantitas bass. Tier suara dan value disimpan terpisah; kolom value IEM tidak disebut tier suara jika kolom suara kosong.

Harga merupakan referensi yang tercantum di Kitab pada saat dibaca. Sebagian berasal dari kolom harga/Toped dan dapat berbeda dari toko/varian Shopee yang ditautkan. Jika kolom Shopee memiliki angka harga yang jelas, angka itu didahulukan. Tidak ada klaim stok atau harga checkout terkini. URL affiliate diambil dari sel Shopee asli, tetap milik Fernanda, tanpa penggantian tag.

Tujuh belas profil contoh bertanda **CONTOH** (13 di antaranya tampil di mode preview; 4 contoh Audio tidak ditampilkan karena Audio memakai data Kitab asli), seluruh harga/spesifikasi PC builder, dan ilustrasi kategori masih simulasi. Ilustrasi bukan foto model produk yang ditampilkan. CSV Shopee Affiliate asli milik pengelola belum diterima. Belum ada data GTID, GadgetIn, atau JagatReview yang dimasukkan.

Daftar audio terstruktur ada di `scripts/kitab-selection.json`; SQL disiapkan ulang dengan `node scripts/seed-kitab.js`. Memuat ulang seed tidak menggandakan produk. Perubahan harga saat ini memperbarui snapshot awal; pengumpulan riwayat harga berkelanjutan belum dijadwalkan.

## Struktur

```text
public/           HTML, CSS, JavaScript polos; tanpa framework dan font eksternal
src/worker.js     Cloudflare Worker: API katalog dan impor admin
migrations/       Skema D1: produk, sumber, rekomendasi, harga, staging
scripts/          Seed audio dan importer CSV yang bisa dipetakan
tests/            Uji aturan builder, impor, affiliate, database dan API
wrangler.jsonc    Konfigurasi Worker + Static Assets + D1 lokal
```

`DATA_MODE=preview` menggabungkan audio D1 nyata dan profil kategori lain yang jelas bertanda contoh. `DATA_MODE=live` hanya mengembalikan rekomendasi D1 yang diterbitkan dan memiliki sumber terverifikasi serta status izin yang sesuai. `DATA_MODE=demo` secara eksplisit memakai semua fixture. Kegagalan database dalam mode live tidak diganti diam-diam dengan data fiktif.

## Impor CSV yang dapat disesuaikan

Halaman **Kelola data** hanya memeriksa file di perangkat. Tidak mengunggah file, menyimpan token, atau menulis ke D1. Pilih asal data untuk membedakan affiliate situs dan Fernanda. CSV sintetis sengaja memiliki link kosong agar demonstrasi validasi tidak memakai link rekaan.

Untuk file asli, salin `scripts/mapping.example.json`, lalu isi pemetaan sesuai header ekspor. Harga tidak ditebak otomatis. Gunakan `integer` untuk `250000` atau `id-ID` untuk `250.000` / `250.000,00`.

```powershell
npm run import:csv -- file.csv mapping.json
npm run import:csv -- file.csv mapping.json --out staging.sql
node node_modules/wrangler/bin/wrangler.js d1 execute pilih-db --local --file staging.sql
```

Perintah pertama hanya memeriksa; kedua menulis SQL staging; ketiga menyimpan draft ke D1 lokal. ID duplikat dalam satu CSV ditolak. Batch berbeda menyimpan snapshot staging terpisah dan tidak menimpa affiliate rekomendasi yang sudah ada.

Untuk sumber Kitab, config memakai `sourceOrigin: "kitab_audio"` dan `affiliateOwner: "fernanda"`; sumber CSV Shopee pengelola memakai `shopee_csv` dan `site`. Link asli disimpan juga sebagai `affiliateOriginalUrl`. Impor tidak menganggap link yang diberikan otomatis sudah terbukti kepemilikannya. Peninjauan sumber/varian/link dilakukan sebelum publikasi editorial.

Endpoint `POST /api/admin/import` menerima `{csv, config, commit:false}` untuk pemeriksaan dan `commit:true` untuk staging. Endpoint tidak aktif tanpa `ADMIN_TOKEN` yang dikonfigurasi sebagai secret. Gunakan `Authorization: Bearer ...` dari alat admin privat, bukan formulir publik. File maksimal 2 MB, maksimal 1.000 baris preview; komit API maksimal 90 baris dalam satu transaksi D1. Tidak ada endpoint publik untuk menerbitkan/menimpa kurasi. Panel penerbitan editorial lengkap belum dibuat.

## Pengujian

Pencocokan diuji untuk batas budget, pemakaian opsional, pemisahan jenis produk, preferensi suara, kondisi tanpa hasil, serta pemulihan sesi per jenis barang.

```powershell
npm test
```

33 pengujian otomatis lulus pada 16 November 2026, termasuk:

- CSV ber-BOM, multiline, tanda kutip, pemisah, harga lokal, duplikasi, dan domain URL.
- Izin Kitab aktif dan pemilik affiliate Fernanda tetap dipertahankan.
- Budget builder pada tiga kebutuhan; deteksi ketidakcocokan DDR/socket/dimensi/daya/cooler; spesifikasi tidak lengkap tidak dianggap lolos.
- Migrasi + seed pada SQLite; trigger mencegah penggantian pemilik/link asli Kitab.
- API admin tanpa token ditolak; impor gagal tidak tersimpan sebagian; data tetap staging.

Preview diperiksa pada lebar 320 px dan 1280 px: Audio → TWS → budget → hasil langsung; detail dan URL affiliate asli; pilihan perbandingan; RAM dan SSD tanpa diagnosis masalah; HDD tanpa form ketika datanya kosong; tombol kembali browser; reload sesi; filter gaming tanpa bukti; perubahan budget dan urutan tanpa kehilangan draft. Tidak ada error browser pada pemeriksaan akhir. PC builder belum divalidasi dengan komponen nyata karena katalog komponennya masih fiktif; tidak ada FPS atau janji “tanpa bottleneck”.

## Biaya dan langkah produksi nanti

Frontend berupa file statis kecil. Filter dan builder berjalan di browser; tidak memerlukan panggilan AI berbayar. API katalog menggunakan D1. Desain ini ditujukan untuk memulai dalam paket gratis sesuai kuota, tanpa menjanjikan gratis untuk segala skala. Periksa ketentuan terbaru: [Workers](https://developers.cloudflare.com/workers/platform/pricing/) dan [D1](https://developers.cloudflare.com/d1/platform/pricing/).

Publikasi belum dilakukan. Saat diminta: buat D1 cloud pada akun yang benar, ganti `database_id`, jalankan migrasi/seed yang sudah direview di remote, gunakan `DATA_MODE=live`, sesuaikan pemberitahuan preview/metadata dan identitas, lalu deploy Worker dan verifikasi situs live. Jangan menerbitkan fixture sebagai produk nyata. Penyegaran sumber/harga otomatis, katalog komponen nyata beserta bukti pabrikan, dan antarmuka publikasi editorial adalah pengembangan berikutnya.

Referensi implementasi: [Workers Static Assets binding](https://developers.cloudflare.com/workers/static-assets/binding/) dan [D1 prepared statements](https://developers.cloudflare.com/d1/worker-api/prepared-statements/).

## Acuan UX dan isi

Lihat [fondasi UX, isi, dan struktur](docs/UX-ISI-STRUKTUR.md) untuk dasar teori, hubungan konten, kontrak pertanyaan, aturan data, dan protokol uji pemahaman. Pengembangan UI visual ditunda.
