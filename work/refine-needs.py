from pathlib import Path
p=Path('public/needs.js')
s=p.read_text(encoding='utf-8')
s=s.replace("label:'Berapa batas maksimal budgetmu?',helper:'Isi batas yang nyaman untukmu. Kami tidak akan memasukkan pilihan di atas angka ini.'", "label:'Berapa budget maksimalmu?',helper:'Pilihan dibatasi sampai jumlah ini. Harga toko dapat berubah.'")
s=s.replace("['wireless','TWS tanpa kabel','Praktis, kecil, dengan tempat pengisian.']", "['wireless','Earphone tanpa kabel','Sering disebut TWS; praktis dan perlu diisi dayanya.']")
s=s.replace("['wired','IEM / earphone berkabel','Untuk yang nyaman memakai kabel.']", "['wired','Earphone dengan kabel','Termasuk IEM dan earphone biasa; colokannya perlu cocok.']")
s=s.replace("['headphone','Headphone / headset','Dipakai di kepala; kemampuan mikrofon dicek terpisah.']", "['headphone','Model yang dipakai di kepala','Headphone atau headset; kemampuan mikrofon dicek terpisah.']")
s=s.replace("['openear','Open-ear / OWS','Untuk yang ingin lubang telinga tetap terbuka.']", "['openear','Model dengan telinga tetap terbuka','Sering disebut open-ear atau OWS.']")
s=s.replace("'Bagaimana dengan suara treble yang menonjol?'", "'Apakah suara tinggi sering terasa terlalu tajam?' ")
s=s.replace("['balanced','Suara seimbang','Tidak ingin bass atau treble terlalu dominan.']", "['balanced','Suara seimbang','Tidak ingin dentuman bass atau suara tinggi terlalu menonjol.']")
s=s.replace("['vocal','Vokal lebih menonjol','Lebih sering menikmati suara penyanyi.']", "['vocal','Suara penyanyi lebih jelas','Utamakan suara penyanyi dalam lagu.']")
before="  return configs[category]||[];"
after='''  const original=configs[category];if(!original)return [];
  let result;
  if(category==='Audio'){
    const connection={...original[1].questions.find(q=>q.id==='connection'),optional:true,advanced:true,label:'Koneksi perangkat (opsional)',helper:'Isi jika tahu. Kalau dilewati, kecocokan colokan atau koneksi akan ditandai perlu dicek.'};
    const priorities=original[2].questions.map(q=>q.id==='treble'?{...q,optional:true,label:'Apakah suara tinggi sering terasa terlalu tajam? (opsional)',helper:'Ini membantu menunjukkan kompromi suara. Kamu boleh melewatinya.'}:q);
    result=[
      {label:'Kebutuhan',title:'Paling sering dipakai untuk apa?',intro:'Pilih penggunaan utama. Ini dipakai untuk memeriksa apakah sumber review mendukung kebutuhanmu.',questions:[original[0].questions[0]]},
      {label:'Budget',title:budget.label,intro:'Tentukan batas belanja sebelum mempersempit pilihan.',questions:[budget]},
      {label:'Cara pakai',title:'Bagaimana kamu ingin memakainya?',intro:'Pilih bentuk yang nyaman dan tempat pemakaian. Tidak harus tahu nama teknis produknya.',questions:[original[1].questions[0],original[0].questions[1],connection]},
      {label:'Prioritas',title:original[2].questions.length>1?'Suara seperti apa yang kamu suka?':'Apa yang paling penting untuk pemakaianmu?',intro:'Belum tahu juga jawaban yang valid. Kami tidak akan menganggapnya sebagai selera tertentu.',questions:priorities}
    ];
  }else if(category==='Komponen PC')result=[original[0],original[3],{label:'PC sekarang',questions:[...original[1].questions,...original[2].questions]}];
  else result=[original[0],original[3],original[2],original[1]];
  return result.map(step=>({...step,title:step.title||(step.questions.length===1?step.questions[0].label:'Ceritakan kebutuhanmu'),intro:step.intro||'Jawaban ini digunakan untuk mempersempit pilihan dan menunjukkan hal yang perlu diperiksa.',questions:step.questions.map(q=>q.id==='connection'?{...q,optional:true,advanced:true}:q)}));'''
assert before in s;s=s.replace(before,after,1)
start=s.index('export function validateStep(')
end=s.index('export function isComplete',start)
s=s[:start]+'''export function validateQuestion(q,value){
  if(q.optional&&(value===undefined||value===null||value===''))return null;
  if(q.kind==='text')return String(value||'').length>200?'Tulis keterangan paling banyak 200 karakter.':q.optional||String(value||'').trim()?null:'Isi keterangan ini.';
  if(q.kind==='budget')return Number.isSafeInteger(Number(value))&&Number(value)>0&&Number(value)<=100000000?null:'Masukkan budget antara Rp1 dan Rp100 juta, tanpa titik atau koma.';
  return q.options.some(o=>o.value===value)?null:`Pilih jawaban untuk “${q.label}”.`;
}
export function stepErrors(category,answers,index){const step=stepsFor(category,answers)[index];if(!step)return [{id:'step',message:'Langkah tidak tersedia.'}];return step.questions.flatMap(q=>{const message=validateQuestion(q,answers[q.id]);return message?[{id:q.id,message}]:[];});}
export function validateStep(category,answers,index){return stepErrors(category,answers,index).map(e=>e.message);}
export function cleanAnswers(category,answers){const clean={};for(const step of stepsFor(category,answers))for(const q of step.questions){const value=answers[q.id];if(value!==undefined&&value!==null&&!validateQuestion(q,value))clean[q.id]=q.kind==='budget'?Number(value):String(value).slice(0,200);}return clean;}
''' + s[end:]
s=s.replace("q.options.find(o=>o.value===answers[q.id])?.label||'Belum dijawab'", "q.options.find(o=>o.value===answers[q.id])?.label||(q.optional?'Belum diketahui — perlu diperiksa':'Belum dijawab')")
s=s.replace("'ANC, isolasi, dan kebocoran suara belum tercatat lengkap. Kecocokan untuk tempat ramai perlu diperiksa pada review asli.'", "'Untuk tempat ramai, kemampuan meredam suara luar dan seberapa terdengar suaramu oleh orang sekitar belum tercatat lengkap. Periksa review asli.'")
s=s.replace("'Jenis colokan, adaptor, dan kebutuhan daya belum terverifikasi untuk perangkatmu. Pilihan ini belum memastikan kecocokan koneksi.'", "'Colokan, adaptor, dan kebutuhan daya belum dicocokkan dengan perangkatmu. Periksa sebelum membeli.'")
s=s.replace("'Katalog audio saat ini belum memiliki penandaan kebutuhan gaming/meeting yang terverifikasi. Kami belum bisa menetapkan pilihan untuk kebutuhan itu.'", "`Data untuk ${answers.use==='gaming'?'bermain game':'meeting atau kelas online'} belum memiliki bukti penggunaan yang cukup. Ini batas data kami, bukan berarti produk yang ada pasti tidak cocok.`")
s=s.replace("'Harga referensi berada dalam batas budgetmu.'", "'Harga yang tercatat masih dalam budgetmu.'")
s=s.replace("`Kebutuhan ${useMap[answers.use]?.filter(n=>product.needs.includes(n)).join(' / ')} tercantum pada data produk.`", "`Data sumber mencantumkan penggunaan untuk ${useMap[answers.use]?.filter(n=>product.needs.includes(n)).join(' / ').toLowerCase()}.`")
s=s.replace("'Prioritas karakter yang kamu pilih belum cocok dengan tag produk ini.'", "'Catatan suara produk ini belum sesuai dengan prioritas yang kamu pilih.'")
s=s.replace("'Prioritas utama ini belum dapat dibuktikan dari data yang tersedia.'", "'Kami belum memiliki bukti untuk prioritas utamamu pada produk ini.'")
p.write_text(s,encoding='utf-8')
print('Questions now follow need/budget/use/priority, with optional technical details.')
