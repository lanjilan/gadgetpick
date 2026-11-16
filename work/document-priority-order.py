from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
p=root/'public/catalog.js'
s=p.read_text(encoding='utf-8')
s=re.sub(r'^const (?:audioUses|deviceUses|tones)=.*\n','',s,flags=re.M)
s=s.replace(',uses:audioUses,preferences:tones','').replace(',uses:deviceUses','')
s=re.sub(r",uses:\[.*?\]\]",'',s)
s=re.sub(r",presets:\[[^\]]*\]",'',s)
p.write_text(s,encoding='utf-8')

p=root/'public/decision-config.js'
s=p.read_text(encoding='utf-8')
needle="field('storageGB','Storage minimal',[['unknown','Belum ada patokan'],['128','128 GB'],['256','256 GB'],['512','512 GB']])"
s=s.replace(needle,needle+",field('phoneSize','Ukuran smartphone',[['unknown','Belum menentukan'],['compact','Lebih ringkas'],['large','Layar lebih besar']])",1)
p.write_text(s,encoding='utf-8')

p=root/'public/help.js'
s=p.read_text(encoding='utf-8')
s=s.replace('Pilih pemakaian utama dan satu atau dua prioritas. Ada pilihan campuran atau belum tahu jika belum yakin.','Pilih apa yang paling penting buatmu. Pilihan pertama menjadi prioritas utama, pilihan kedua menjadi tambahan. Bisa ditukar lewat tombol Jadikan utama.')
s=s.replace('Klik Lihat rekomendasi. Syarat khusus tetap opsional, dan hasil langsung muncul tanpa halaman konfirmasi.','Klik Lihat rekomendasi. Syarat khusus tetap opsional; hasil menjelaskan pertimbangan sesuai urutan prioritasmu.')
p.write_text(s,encoding='utf-8')

p=root/'README.md'
s=p.read_text(encoding='utf-8')
s=s.replace('Dalam satu form, isi rentang harga Dari–Sampai, pemakaian utama jika relevan, dan satu atau dua prioritas. Ada pilihan campuran/belum tahu agar pengguna tidak perlu menebak.','Dalam satu form, isi rentang harga Dari–Sampai dan satu bagian “Apa yang paling penting buatmu?”. Pilihan pertama menjadi prioritas utama, pilihan kedua tambahan. Ada opsi Seimbang / bantu pilih. Pertanyaan pemakaian terpisah dihapus.')
s=s.replace('Hasil menampilkan alasan, dukungan data untuk setiap prioritas, kekurangan, dan hal yang belum terverifikasi.','Hasil menampilkan alasan, dukungan data untuk setiap prioritas sesuai urutannya, kekurangan, dan hal yang belum terverifikasi. Prioritas utama didahulukan dalam pengurutan; dukungan prioritas tambahan tidak bisa menutupi ketidakjelasan prioritas utama.')
s=s.replace('Format sesi v4 memisahkan rentang harga dan prioritas dari formulir lama yang hanya mempunyai batas atas.','Format sesi v5 menyimpan urutan prioritas. Sesi v4 mempertahankan rentang dan syarat, tetapi pilihan yang tadinya tidak berurutan tidak otomatis dianggap sebagai prioritas utama.')
s=s.replace('satu form rentang harga/pemakaian/prioritas','satu form rentang harga dan urutan prioritas')
s=s.replace('29 pengujian otomatis lulus','33 pengujian otomatis lulus')
p.write_text(s,encoding='utf-8')

p=root/'docs/UX-ISI-STRUKTUR.md'
s=p.read_text(encoding='utf-8')
s=s.replace('pemakaian utama, dan satu atau dua prioritas','satu atau dua prioritas yang diurutkan')
s=s.replace('pemakaian dan prioritas utama terlihat dalam satu form','urutan prioritas terlihat dalam satu form')
s=s.replace('Rentang harga Dari–Sampai + pemakaian + 1–2 prioritas','Rentang harga Dari–Sampai + 1 prioritas utama dan 1 tambahan')
s=s.replace('| Pemakaian utama | Menyaring catatan penggunaan; pilihan campuran tersedia |\n','')
s=s.replace('| Satu atau dua prioritas | Mengurutkan dukungan bukti, tidak menjanjikan semua kebutuhan terpenuhi |','| Satu atau dua prioritas berurutan | Yang pertama utama, kedua tambahan; tombol Jadikan utama menukar urutan |')
s=s.replace('Tidak ada halaman konfirmasi dan tidak ada pertanyaan masalah PC.','Tidak ada halaman konfirmasi, pertanyaan masalah PC, atau pertanyaan pemakaian terpisah. Gaming, kamera, baterai, dan pilihan lain berada dalam satu kelompok prioritas. Dukungan prioritas tambahan tidak dapat mengalahkan dukungan untuk prioritas utama.')
p.write_text(s,encoding='utf-8')
