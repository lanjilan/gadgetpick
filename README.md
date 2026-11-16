# GadgetPick

Web rekomendasi gadget dan simulasi Rakit PC, menggunakan JavaScript, HTML/CSS, Cloudflare Workers + Static Assets, dan D1.

Website: https://gadgetpick.jilan3075.workers.dev/  
Repository utama: https://github.com/lanjilan/gadgetpick — branch `main`.

## Status data

- **Audio:** 12 produk nyata dari Kitab Audio Fernanda Gunsan (4 IEM, 4 TWS, 4 headphone). Ringkasan dan harga merupakan snapshot sumber yang dibaca 16 November 2026; bukan pengujian GadgetPick, harga checkout, atau jaminan stok.
- **Smartphone:** belum memiliki produk nyata. Simulasi profil tetap aktif: rentang budget, maksimal dua prioritas yang berurutan, dan Serba bisa yang dipilih sendiri. Lima angka kemampuan adalah ilustrasi editorial, bukan rating atau benchmark perangkat nyata. Budget memakai batas atas untuk menentukan skenario. Preferensi tambahan disimpan, tetapi belum memengaruhi grafik.
- **Kategori lain:** belum memiliki produk nyata. Tampilkan keadaan kosong tanpa mengambil produk dari kategori lain.
- **Rakit PC:** seluruh komponen, harga, dan spesifikasi adalah fixture fiktif. Tidak ada tautan belanja, estimasi FPS, atau janji tanpa bottleneck.

Mode produksi `DATA_MODE=live` hanya mengembalikan rekomendasi D1 yang diterbitkan, telah ditinjau, memiliki sumber terverifikasi dan status izin yang sesuai. Kegagalan database tidak diganti dengan fixture.

Mode `preview` menggabungkan Audio nyata dan fixture non-Audio berlabel contoh. Mode `demo` hanya untuk pengujian eksplisit.

## Sumber dan affiliate

[Kitab Audio Fernanda Gunsan](https://docs.google.com/spreadsheets/d/1KXDCrMErS1ZjjJhxjTYqNax1bjWWl4peXv0eaLMlxVc/edit) ditemukan dari [profil Fernanda](https://lynk.id/fernandagunsan).

Izin pemakaian dicatat berdasarkan konfirmasi pengguna tanggal 16 November 2026. Sumber menyimpan dasar konfirmasi tersebut; tautan chat bukan klaim bahwa bukti percakapan dengan Fernanda telah diperiksa.

Tautan affiliate Audio dipertahankan persis dari sumber, tetap milik Fernanda. Trigger database dan tes memeriksa pemilik serta URL asli. Tier dan value bersifat subjektif dan hanya dibandingkan dalam jenis audio yang sama. Harga bisa merujuk toko atau varian berbeda dari tautan Shopee.

Tidak ada data GTID, GadgetIn, atau JagatReview yang diimpor. Ilustrasi perangkat bukan foto produk.

## Alur pengguna

Pilih kategori → jenis produk → rentang harga dan prioritas → hasil, alasan, kekurangan, dan bagian yang belum terverifikasi.

Pilihan pertama menjadi prioritas utama; pilihan kedua tambahan. Dukungan prioritas tambahan tidak menggantikan kurangnya bukti prioritas utama. Tidak ada persentase kecocokan. Filter harga inklusif dan tidak menyisipkan produk di luar budget.

Sesi v5 menyimpan jawaban dan draft terpisah per jenis produk, termasuk simulasi yang belum dikirim. Draft tidak otomatis mengubah hasil yang sudah diterapkan. Tombol Reset pilihan hanya menghapus pilihan jenis yang sedang dibuka. Penyimpanan sesi yang tidak tersedia tidak memblokir fungsi.

Detail memperlihatkan sumber dan pemilik affiliate. Perbandingan maksimal tiga produk, dalam jenis yang sama. Grafik memakai elemen meter native agar kompatibel dengan CSP tanpa melonggarkan aturan keamanan.

## Pengujian dan deployment cloud

Workflow `.github/workflows/test.yml` berjalan untuk push ke `main` dan `codex/**`, serta pull request.

1. `npm ci` lalu `npm test`: aturan pemilihan, budget, sesi, CSV, kompatibilitas, migrasi/seed, izin, affiliate, dan API.
2. `wrangler deploy --dry-run`: validasi bundel Worker.
3. Job browser memasang Playwright yang dipatok versinya, menyiapkan D1 **lokal pada runner Actions**, dan menjalankan Worker pada runner. Tidak menulis database produksi.
4. Pengujian browser memeriksa semua rute pada 320, 360, 390, 768, dan 1280 px; overflow, error browser/CSP, simulasi, pilihan prioritas, reload/reset, detail dan URL affiliate, sorting, perbandingan, CSV, Rakit PC, serta retry katalog.
5. Screenshot dan log Worker disimpan dalam artifact Actions `mobile-ui-evidence`.

Kerjakan perubahan di branch, buka PR, tunggu kedua job berhasil, baru gabungkan ke `main`. Integrasi **Cloudflare Workers Builds** yang sudah terpasang menerbitkan perubahan `main`. Periksa check run `Workers Builds: gadgetpick` dan website aktif sesudah merge. Tidak perlu membuat Worker, database, atau project baru; jangan meminta atau menaruh token Cloudflare di repository.

Konfigurasi aktif: Worker `gadgetpick`, binding D1 `DB`, database `gadgetpick-db`, asset binding `ASSETS`. Metadata tetap noindex/nofollow selama situs belum diluncurkan luas.

## Impor dan pemeliharaan data

Halaman Kelola data memvalidasi CSV di browser tanpa mengunggah, menulis D1, atau menerbitkan data. Maksimal 2 MB / 1.000 baris. Pilih delimiter, pemetaan kolom, format harga, dan asal data. CSV sintetis sengaja tidak memiliki URL affiliate sehingga validasi menunjukkan kesalahan.

Endpoint `POST /api/admin/import` dilindungi `ADMIN_TOKEN`, dinonaktifkan jika secret tidak dikonfigurasi. Dry-run tidak menulis data. Commit dibatasi 90 baris, atomik, dan hanya masuk staging. Jangan memasukkan token ke frontend.

`scripts/kitab-selection.json` adalah sumber seed terstruktur; `scripts/seed-kitab.js` menyiapkan SQL dengan mempertahankan URL affiliate. Jangan menjalankan ulang seed produksi sebagai bagian perbaikan UI: tidak diperlukan dan bisa mengganti snapshot harga.

## Struktur

| Lokasi | Isi |
| --- | --- |
| `public/` | Frontend tanpa framework; fondasi CSS di styles.css, pembaruan UI di ui.css |
| `src/worker.js` | API katalog dan impor admin |
| `migrations/` | Produk, sumber, harga, rekomendasi, staging, guard affiliate |
| `scripts/` | Seed Audio dan importer CSV |
| `tests/` | Unit/integrasi dan pengujian browser |
| `docs/UX-ISI-STRUKTUR.md` | Dasar pertanyaan dan aturan informasi |
| `work/` | Arsip skrip pengembangan lama; bukan runtime produksi |

Katalog nyata non-Audio, harga yang disegarkan berkala, dan panel penerbitan editorial masih merupakan pekerjaan berikutnya. Jangan mengisi kekosongan tersebut dengan produk, skor, atau sumber rekaan.
