from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'README.md'
s=p.read_text(encoding='utf-8')
start=s.index('## Alur pengunjung')
end=s.index('## Yang sudah bisa dipakai')
s=s[:start]+'''## Alur pengunjung

1. Pilih kategori dan jenis barang lewat card. Audio langsung membuka TWS, IEM, earphone, headphone, headset, dan OWS. Komponen PC langsung membuka monitor dan jenis komponennya. Rakit PC tetap card khusus.
2. Dalam satu form, isi rentang harga Dari–Sampai, pemakaian utama jika relevan, dan satu atau dua prioritas. Ada pilihan campuran/belum tahu agar pengguna tidak perlu menebak. Tidak ada stepper atau halaman periksa jawaban.
3. Syarat spesifik seperti OS, storage, RAM, koneksi, atau DDR tersedia secara opsional sesuai jenis barang. Tidak ada diagnosis masalah PC.
4. Hasil menampilkan alasan, dukungan data untuk setiap prioritas, kekurangan, dan hal yang belum terverifikasi. Tiga pilihan awal ditampilkan; sisanya dapat dibuka di halaman yang sama. Rentang dan preferensi bisa diubah langsung.

Preset smartphone: Entry-level Rp1–3 juta, Mid-range Rp3–6 juta, Upper mid-range Rp6–10 juta, High-end Rp10–15 juta, Premium Rp15–30 juta. Ini panduan navigasi buatan situs yang bisa diubah, bukan klasifikasi resmi. Flagship menjelaskan posisi lini produk suatu brand, bukan satu batas harga. Preset kategori lain memakai rentang yang berbeda.

Kedua batas harga diterapkan secara inklusif. Produk lebih murah dari batas bawah tidak diselipkan sebagai hasil. Harga yang belum tercatat tidak dianggap memenuhi rentang. Mode semua harga harus dipilih secara eksplisit.

Prioritas dinilai dari metadata yang tersedia. Tag seperti Responsif atau Warna natural hanya mendukung catatan sebagian, tidak membuktikan FPS, kualitas kamera, gamut, atau performa aplikasi tertentu. Tidak ada persentase kecocokan. Klaim kamera tidak diturunkan dari tag warna layar. Spesifikasi yang diketahui bertentangan dengan syarat disisihkan; spesifikasi yang belum ada ditandai belum terverifikasi.

Sesi disimpan per jenis barang. Format sesi v4 memisahkan rentang harga dan prioritas dari formulir lama yang hanya mempunyai batas atas. Kategori tanpa produk langsung memberi keterangan sebelum form. Smartphone, laptop, tablet, monitor, dan komponen PC masih data contoh; belum rekomendasi belanja nyata. Audio memakai sumber dan affiliate Fernanda yang dipertahankan.

''' + s[end:]
s=s.replace('- Pilihan jenis produk langsung, satu form budget, filter pemakaian opsional, filter suara audio, dan urutan harga pada halaman hasil yang sama.','- Pilihan jenis produk langsung, satu form rentang harga/pemakaian/prioritas, syarat opsional, serta penjelasan hasil pada halaman yang sama.')
s=s.replace('23 pengujian otomatis lulus','28 pengujian otomatis lulus')
p.write_text(s,encoding='utf-8')
p=root/'docs/UX-ISI-STRUKTUR.md'
s=p.read_text(encoding='utf-8')
s=s.replace('satu form budget','satu form pertimbangan').replace('satu form cukup untuk budget dan pemakaian opsional','satu form mengelompokkan rentang harga, pemakaian utama, dan satu atau dua prioritas')
s=s.replace('Jenis yang punya data → satu form pertimbangan → hasil langsung\n  Pemakaian opsional jika relevan\n  Komponen PC cukup budget; tidak ada diagnosis masalah','Jenis yang punya data → satu form pertimbangan → hasil langsung\n  Rentang harga Dari–Sampai + pemakaian + 1–2 prioritas\n  Syarat khusus opsional sesuai jenis barang; tidak ada diagnosis masalah')
start=s.index('## Pertanyaan yang dipertahankan')
end=s.index('## Aturan isi dan bahasa')
s=s[:start]+'''## Pertimbangan dalam satu halaman

| Pertimbangan | Fungsi |
| --- | --- |
| Rentang harga | Dua batas eksplisit; preset mengisi keduanya dan tetap dapat diedit |
| Pemakaian utama | Menyaring catatan penggunaan; pilihan campuran tersedia |
| Satu atau dua prioritas | Mengurutkan dukungan bukti, tidak menjanjikan semua kebutuhan terpenuhi |
| Syarat khusus opsional | OS, storage, RAM, koneksi, DDR, interface, atau platform sesuai jenis barang |

Tidak ada halaman konfirmasi dan tidak ada pertanyaan masalah PC. Bantuan boleh dibuka tanpa melewati tahap tambahan. Kamera/baterai/performa/update untuk smartphone, mobilitas/layar/upgrade untuk laptop, serta karakter suara/mikrofon/kenyamanan untuk audio tidak disamaratakan.

Preset kelas harga adalah panduan buatan situs, bukan standar industri. Flagship adalah posisi lini produk suatu brand dan tidak diturunkan otomatis dari harga. Produk di luar kedua batas tidak dimasukkan untuk mengisi daftar.

## Kedalaman hasil

Setiap pilihan mempunyai alasan yang menghubungkan jawaban dengan catatan sumber, status dukungan untuk tiap prioritas, kekurangan, dan bagian yang belum diketahui. Dukungan sebagian tidak dinyatakan sebagai bukti penuh. Tag warna layar tidak membuktikan kualitas kamera; tag respons aplikasi tidak membuktikan FPS. Hasil tanpa bukti prioritas diberi keterangan sebagai pilihan awal dalam rentang, bukan rekomendasi personal yang sudah terbukti cocok.

''' + s[end:]
p.write_text(s,encoding='utf-8')
p=root/'public/help.js'
s=p.read_text(encoding='utf-8')
s=s.replace('Isi budget. Kalau belum ada batas, pilih opsi itu di form.','Pilih atau isi rentang harga Dari–Sampai. Kamu juga bisa memilih semua rentang.')
s=s.replace('Klik Lihat pilihan. Pemakaian dan filter tambahan boleh dilewati.','Pilih pemakaian utama dan satu atau dua prioritas. Ada pilihan campuran atau belum tahu jika belum yakin.</li><li>Klik Lihat rekomendasi. Syarat khusus tetap opsional, dan hasil langsung muncul tanpa halaman konfirmasi.')
s=s.replace('Baca ringkasan dan kekurangannya, lalu buka review asli jika ingin tahu lebih jauh.','Baca alasan pemilihan, status dukungan untuk prioritasmu, dan kekurangannya. Catatan yang belum terverifikasi tidak dianggap sudah memenuhi kebutuhanmu.')
p.write_text(s,encoding='utf-8')
p=root/'public/finder-ui.js'
s=p.read_text(encoding='utf-8').replace('id="finder-use" class=', 'id="finder-use" aria-label="Pemakaian utama" class=')
p.write_text(s,encoding='utf-8')
