from pathlib import Path
p=Path('public/app.js')
s=p.read_text(encoding='utf-8')
s="import {restoreGuides,saveGuides,accessibleStep} from './needs-state.js';\nimport {stepsFor} from './needs.js';\nimport {renderHelp} from './help.js';\n"+s
pos=s.index('const state=')
s=s[:pos]+"let guideStorage=null;try{guideStorage=sessionStorage;guideStorage.setItem('gadgetpick.storage-check','1');guideStorage.removeItem('gadgetpick.storage-check');}catch{guideStorage=null;}\n"+s[pos:]
s=s.replace('guides:{},mappedIds:', 'guides:restoreGuides(guideStorage),mappedIds:',1)
s=s.replace('Pilih kategori. Kami bantu petakan kebutuhanmu sebelum menyarankan produk.', 'Pilih kategori, lalu jawab kebutuhan dan budgetmu. Kami bantu membandingkan pilihan; pembelian dilakukan di Shopee.',1)
start=s.index('function renderNeedsIntake(){')
end=s.index('function renderNeedsResults(){',start)
s=s[:start]+'''function persistNeeds(){return saveGuides(guideStorage,state.guides);}
function navigateNeeds(index,{replace=false,back=false}={}){
  const profile=profileFor();
  if(back&&history.state?.gpCategory===state.category&&history.state?.fromStep===index){history.back();return;}
  const fromStep=profile.step;profile.step=accessibleStep(state.category,profile.answers,index);persistNeeds();
  const hash=guideBase()+'?langkah='+profile.step;
  history[replace?'replaceState':'pushState']({gpCategory:state.category,step:profile.step,fromStep},'',hash);
  route();window.scrollTo({top:0,behavior:'instant'});$('#guide-title')?.focus({preventScroll:true});
}
function renderNeedsIntake(){
  $('#compare-tray').hidden=true;
  renderIntake(main,state.category,profileFor(),{
    storageAvailable:!!guideStorage,onDataChange:persistNeeds,
    onStepChange:index=>navigateNeeds(index),onBack:index=>navigateNeeds(index,{back:true}),
    onRestart:()=>{state.guides[state.category]=newProfile();persistNeeds();navigateNeeds(0,{replace:true});},
    onFinish:()=>{persistNeeds();location.hash=guideBase()+'/hasil';}
  });
}
''' + s[end:]
s=s.replace("p.step=step;p.confirmed=false;location.hash=guideBase();", "p.step=stepsFor(state.category,p.answers).length;p.confirmed=false;persistNeeds();navigateNeeds(p.step);",1)
s=s.replace("const page=location.hash.slice(1)||'rekomendasi';", "const [page='rekomendasi',query='']=(location.hash.slice(1)||'rekomendasi').split('?');",1)
s=s.replace("({builder:'Rakit PC',metode:'Cara kami memilih',data:'Kelola data'})", "({builder:'Rakit PC',metode:'Sumber dan cara kurasi',panduan:'Panduan memilih',data:'Kelola data'})",1)
s=s.replace("!['builder','metode','data'].includes(page)", "!['builder','metode','panduan','data'].includes(page)",1)
s=s.replace("  else if(page==='metode')renderMethod();", "  else if(page==='metode')renderMethod();\n  else if(page==='panduan')renderHelp(main);",1)
s=s.replace("const profile=profileFor();\n    if(page.endsWith", "const profile=profileFor();\n    if(!page.endsWith('/hasil')&&!page.endsWith('/katalog')){const requested=new URLSearchParams(query).get('langkah');if(requested!==null)profile.step=accessibleStep(state.category,profile.answers,Number(requested));else profile.step=accessibleStep(state.category,profile.answers,profile.step);persistNeeds();}\n    if(page.endsWith",1)
s=s.replace("if(page.endsWith('/hasil')||page.endsWith('/katalog'))history.replaceState(null,'',guideBase());renderNeedsIntake();", "if(page.endsWith('/hasil')||page.endsWith('/katalog')){profile.step=accessibleStep(state.category,profile.answers,profile.step);history.replaceState(null,'',guideBase()+'?langkah='+profile.step);}renderNeedsIntake();",1)
s=s.replace("main.focus({preventScroll:true});});\n\ndocument.addEventListener", "($('#guide-title')||main).focus({preventScroll:true});});\n\ndocument.addEventListener",1)
s=s.replace('>Lihat alasan ${icon', '>Alasan & sumber ${icon',1)
s=s.replace('<h3>Kenapa masuk pilihan?</h3>', '<h3>Ringkasan catatan sumber</h3>',1)
s=s.replace('<h3>Kompromi yang perlu kamu tahu</h3>', '<h3>Kekurangan yang dicatat</h3>',1)
s=s.replace('<h3>Transparansi affiliate</h3>', '<h3>Siapa yang menerima komisi?</h3>',1)
s=s.replace('Cek harga di Shopee ↗', 'Buka toko di Shopee ↗',1)
p.write_text(s,encoding='utf-8')
p=Path('public/index.html')
s=p.read_text(encoding='utf-8').replace('<a href="#rekomendasi" data-nav="rekomendasi">Rekomendasi</a>', '<a href="#rekomendasi" data-nav="rekomendasi">Cari rekomendasi</a>').replace('<a href="#metode" data-nav="metode">Cara kami memilih</a>', '<a href="#panduan" data-nav="panduan">Panduan memilih</a>').replace('Baca kebijakan kurasi & affiliate ↗','Sumber, cara kurasi, dan komisi ↗')
p.write_text(s,encoding='utf-8')
print('Added session recovery, browser history, contextual guide and clear site navigation.')
