const characters={Balanced:'Seimbang',Neutral:'Cenderung netral','V-shape':'Bass dan suara tinggi menonjol',Bass:'Bass terasa',Vokal:'Fokus suara penyanyi',Hangat:'Cenderung hangat',Terang:'Suara tinggi menonjol',Wireless:'Tanpa kabel'};
export const characterLabel=value=>characters[value]||value;
const notes={
  'Tonal bisa disesuaikan melalui EQ.':'Pengaturan suara (EQ) bisa diubah.',
  'Bass cukup berisi dengan ANC.':'Bass cukup berisi dan tersedia peredam bising menurut sumber.',
  'Mikrofon dan swivel terbatas.':'Mikrofon dan gerak putar bagian telinga terbatas.',
  'Ruang fit lebih sempit dari Wave Pro.':'Ruang untuk telinga lebih sempit dibanding Wave Pro.',
  'Kualitas AAC tertinggal dari LDAC.':'Menurut sumber, suara pada mode Bluetooth AAC kurang baik dibanding LDAC. Periksa mode yang didukung perangkatmu.',
  'Timbre alami, instrumen terpisah jelas.':'Warna suara terasa alami dan instrumen terdengar terpisah menurut sumber.',
  'Separasi dan imaging mendapat apresiasi.':'Pemisahan instrumen dan posisi suara mendapat apresiasi dari sumber.',
  'Memerlukan sumber daya lebih kuat.':'Periksa apakah volume dan daya perangkatmu cukup untuk earphone ini.',
  'Tonal hangat, cocok untuk monitoring.':'Karakter suara hangat; sumber menilai cocok untuk mendengarkan saat memantau rekaman.',
  'Timbre treble kurang alami dibanding Xuan NV.':'Menurut sumber, warna suara tinggi terasa kurang alami dibanding Xuan NV.'
};
export const plainNote=value=>notes[value]||String(value||'').replace(/^Skenario:?\s*/i,'').replace(/^./,c=>c.toUpperCase());
export const productTypeLabel=value=>value==='HP'?'Smartphone':value;
export function recordedDate(value){try{return value?new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric'}).format(new Date(value+'T00:00:00Z')):'tanggal belum tercatat';}catch{return 'tanggal belum tercatat';}}
