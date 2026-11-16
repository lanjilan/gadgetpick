from pathlib import Path
root=Path(__file__).resolve().parents[1]
(root/'public/help.js').write_text('''export const audioTerms=[
 ['TWS','Earphone tanpa kabel kiri–kanan, biasanya dilengkapi charging case.'],
 ['IEM','Earphone yang ujungnya masuk ke telinga. Umumnya memakai eartips agar pas.'],
 ['Earphone','Di kategori ini, earphone berarti earphone atau earbuds berkabel selain IEM.'],
 ['Headphone','Dipakai di kepala untuk mendengarkan. Bisa berkabel atau wireless.'],
 ['Headset','Headphone dengan mikrofon untuk percakapan. Tetap cek review mikrofonnya.'],
 ['OWS / Open-ear','Audio yang dipakai dengan lubang telinga tetap terbuka.'],
 ['Bass, vokal, treble','Bass adalah suara rendah seperti dentuman; vokal adalah suara penyanyi; treble adalah suara tinggi.'],
 ['Balanced, warm, bright','Gambaran karakter suara: seimbang, hangat, atau treble lebih menonjol. Kesan tiap orang bisa berbeda.'],
 ['Tier dan value','Tier merangkum penilaian reviewer. Value melihat apa yang didapat dengan harganya. Bandingkan dalam jenis audio yang sama.']
];
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderHelp(main){main.innerHTML=`<section class="page-intro"><h1>Butuh penjelasan?</h1><p>Cari istilah yang belum kamu kenal di sini.</p></section><section class="panel method-panel"><h2>Cara mencari rekomendasi</h2><ol class="info-list"><li>Pilih barang yang kamu cari.</li><li>Isi budget. Kalau belum ada batas, pilih opsi itu di form.</li><li>Klik Lihat pilihan. Pemakaian dan filter tambahan boleh dilewati.</li></ol><p>Baca ringkasan dan kekurangannya, lalu buka review asli jika ingin tahu lebih jauh.</p></section><section class="panel method-panel check-panel"><h2>Jenis dan istilah audio</h2>${audioTerms.map(([term,text])=>`<details class="help-term"><summary>${esc(term)}</summary><p>${esc(text)}</p></details>`).join('')}</section><section class="panel method-panel check-panel"><h2>Kalau belum ada hasil</h2><p>Bisa jadi kami belum punya produk di budgetmu, atau belum ada review untuk pemakaian yang kamu pilih. Kalau jenis produknya belum diisi, keterangannya langsung muncul sebelum form budget.</p><p>Kamu bisa mengubah filter atau memilih jenis lain. Hasil kosong tidak berarti tidak ada produk yang cocok di pasaran.</p></section><section class="panel method-panel check-panel"><h2>Sebelum membeli</h2><p>Cek harga akhir, varian, garansi, dan ongkir di toko. Untuk komponen PC, cocokkan dulu dengan perangkatmu. Untuk laptop atau tablet, cek dukungan aplikasi yang kamu pakai.</p><p>Audio di sini bersumber dari Kitab Audio Fernanda Gunsan. Tautan affiliate aslinya tetap dipakai, dan komisinya menjadi milik Fernanda.</p><a href="#metode">Tentang sumber dan komisi →</a></section><div class="build-actions"><a class="primary" href="#rekomendasi">Cari rekomendasi</a></div>`;}
''',encoding='utf-8')
p=root/'README.md'
s=p.read_text(encoding='utf-8')
start=s.index('## Alur pengunjung:')
end=s.index('## Yang sudah bisa dipakai')
s=s[:start]+'''## Alur pengunjung

1. Pilih Audio, Smartphone & Tablet, Laptop, atau Komponen PC. Rakit PC tetap card khusus.
2. Audio langsung membuka TWS, IEM, earphone, headphone, headset, dan OWS. Komponen PC langsung membuka Monitor, Processor, RAM, SSD, HDD, GPU, Motherboard, PSU, Casing, dan CPU Cooler. Smartphone & Tablet membuka kedua perangkat itu; Laptop langsung ke form.
3. Satu form berisi budget dan pemakaian opsional jika relevan. Untuk komponen PC, hanya budget. Opsi tanpa batas budget tersedia. Tekan Lihat pilihan untuk langsung melihat hasil.

Tidak ada stepper, halaman periksa jawaban, atau pertanyaan diagnosis masalah. Filter suara audio tersedia setelah hasil, pada halaman yang sama. Mengubah budget/pemakaian lalu menerapkannya memperbarui hasil tanpa melewati halaman lain. Jenis yang belum punya data langsung menampilkan keterangan, tanpa meminta pengunjung mengisi form.

Data sesi disimpan per jenis produk, sehingga budget TWS tidak bercampur dengan IEM atau RAM. Hasil yang valid pulih setelah reload. Storage yang tidak tersedia tidak menghalangi penggunaan. Tautan hasil tanpa budget valid kembali ke form. Tautan lama diarahkan ke kategori atau jenis yang sesuai.

Pencocokan memakai jenis produk, harga tercatat, dan penggunaan yang didukung data. Pemakaian boleh dilewati; tidak otomatis diasumsikan untuk musik atau gaming. Filter suara mengurutkan catatan yang tersedia dan menandai perbedaannya, tanpa persentase kecocokan. Harga yang belum ada tidak dimasukkan sebagai cocok budget. Sumber, kelemahan, tanggal harga, dan affiliate asli tetap tersedia di detail.

Laptop, tablet, smartphone, monitor, dan komponen PC masih memakai profil contoh tanpa tautan pembelian. Jenis PC dan audio tertentu belum memiliki data produk. Aksesori dihapus.

''' + s[end:]
s=s.replace('- Katalog dengan pencarian langsung, kategori, batas budget, kebutuhan, karakter produk/suara, dan urutan harga. Beberapa pilihan dalam satu kelompok filter memakai hubungan “atau”; antarkelompok memakai hubungan “dan”.','- Pilihan jenis produk langsung, satu form budget, filter pemakaian opsional, filter suara audio, dan urutan harga pada halaman hasil yang sama.')
p.write_text(s,encoding='utf-8')
p=root/'docs/UX-ISI-STRUKTUR.md'
s=p.read_text(encoding='utf-8')
s=s[:s.index('## Struktur informasi yang digunakan')]+'''## Struktur informasi yang digunakan

```text
Empat card utama
  Audio → TWS / IEM / Earphone / Headphone / Headset / OWS
  Smartphone & Tablet → Smartphone / Tablet
  Laptop
  Komponen PC → Monitor / Processor / RAM / SSD / HDD / GPU /
                Motherboard / PSU / Casing / CPU Cooler

Jenis yang punya data → satu form budget → hasil langsung
  Pemakaian opsional jika relevan
  Komponen PC cukup budget; tidak ada diagnosis masalah
  Tanpa halaman periksa jawaban
  Filter tambahan dan urutan tetap di halaman hasil
Jenis tanpa data → keterangan langsung; tidak meminta budget

Card khusus Rakit PC
  “Bantu susun satu PC sesuai kebutuhan dan budget.”
  Budget + pemakaian → rakitan contoh + cek kompatibilitas
```

## Pertanyaan yang dipertahankan

| Pertanyaan | Fungsi | Wajib? |
| --- | --- | --- |
| Jenis barang | Mencegah rekomendasi beda jenis | Dipilih lewat card |
| Budget | Membatasi harga tercatat | Ada opsi tanpa batas |
| Pemakaian | Menyaring catatan penggunaan yang tersedia | Opsional; tidak ditanyakan untuk komponen selain monitor |
| Karakter suara | Mengurutkan audio berdasarkan catatan | Opsional, setelah hasil |

Pertanyaan tempat pemakaian, koneksi, treble, mobilitas, ukuran, dan masalah PC dihapus dari alur wajib. Data yang belum tersedia disampaikan singkat saat hasil atau di detail, tanpa meminta jawaban yang tidak dipakai.

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
'''
p.write_text(s,encoding='utf-8')
