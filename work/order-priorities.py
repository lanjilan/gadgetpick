from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
backup=root/'work/priority-order-backup'
backup.mkdir(exist_ok=True)
for name in ['decision-config.js','finder.js','finder-ui.js','finder-state.js']:
    target=backup/name
    if not target.exists(): shutil.copyfile(root/'public'/name,target)

p=root/'public/decision-config.js'
s=p.read_text(encoding='utf-8')
s=s.replace("option('performance','Performa gaming / aplikasi')","option('gaming','Gaming')")
s=s.replace("option('performance','Performa aplikasi / game')","option('gaming','Gaming'),option('creative','Desain / editing'),option('coding','Coding')",1)
s=s.replace("option('performance','Performa aplikasi')","option('gaming','Gaming')",1)
s=s.replace("priorities:[...tone,", "priorities:[option('gaming','Gaming'),...tone,")
s=s.replace("option('mic','Mikrofon untuk ngobrol')","option('mic','Mikrofon / meeting')")
s=s.replace("intro:'Pilih rentang harga dan hal yang penting buatmu.", "intro:'Pilih rentang harga dan urutan prioritasmu.")
start=s.index('export function priorityOptions(')
s=s[:start]+"export function priorityOptions(entry){return entry.priorities;}\n"
p.write_text(s,encoding='utf-8')

p=root/'public/finder.js'
s=p.read_text(encoding='utf-8')
start=s.index('const useTags=')
end=s.index('const amount=',start)
s=s[:start]+"const goalTags={gaming:['Gaming'],creative:['Desain'],coding:['Pemrograman']};\n"+s[end:]
s=s.replace(" const use=entry.uses?(entry.uses.some(([id])=>id===raw.use)?raw.use:''):'any';\n",'')
s=s.replace('priorityOptions(entry,{use})','priorityOptions(entry)')
s=s.replace("unlimited:raw.unlimited===true,use,priorities,constraints", "unlimited:raw.unlimited===true,priorities,constraints")
s=s.replace(" if(entry.uses&&!a.use)errors.push({id:'use',message:'Pilih pemakaian utama. Ada pilihan campuran kalau belum punya fokus.'});\n",'')
s=s.replace('Pilih satu atau dua prioritas, atau pilih Belum tahu.','Pilih prioritas utama, atau pilih Seimbang / bantu pilih.')
needle=" const fact=tagFacts[priority.value];"
s=s.replace(needle,""" const goals=goalTags[priority.value];
 if(verified&&goals?.some(tag=>product.needs.includes(tag)))return {id:priority.value,label:priority.label,status:'partial',note:'Ada catatan penggunaan untuk '+priority.label.toLowerCase()+'. Kebutuhan aplikasi, game, atau pengaturan tertentu tetap perlu dicek.',source};
"""+needle)
s=s.replace("error:'Lengkapi rentang harga, pemakaian, dan prioritas.'", "error:'Lengkapi rentang harga dan urutan prioritas.'")
s=s.replace(" const uses=useTags[answers.use]||[],wanted=priorityOptions(entry,answers).filter(p=>answers.priorities.includes(p.value));\n const matches=priced.filter(p=>!uses.length||uses.some(tag=>p.needs.includes(tag))).flatMap(product=>{", " const wanted=answers.priorities.map(id=>priorityOptions(entry).find(p=>p.value===id)).filter(Boolean);\n const matches=priced.flatMap(product=>{")
s=s.replace("   const checks=wanted.map(p=>priorityEvidence(product,p));", "   const checks=wanted.map((p,i)=>({...priorityEvidence(product,p),rank:i+1}));\n   // The main activity needs a recorded use or direct review evidence. Generic responsiveness is insufficient.\n   if(goalTags[wanted[0]?.value]&&checks[0]?.status==='unknown')return [];")
s=s.replace("   if(uses.length)reasons.unshift((product.demo?'Profil contoh ini ditujukan':'Sumber mencatat penggunaan')+' untuk '+uses.filter(t=>product.needs.includes(t)).join(' / ').toLowerCase()+'.');\n",'')
s=s.replace("   const reasons=[...supported,...partial].map(c=>c.note);", "   const reasons=checks.filter(c=>c.status!=='unknown').map(c=>(c.rank===1?'Untuk prioritas utama: ':'Untuk prioritas tambahan: ')+c.note);")
s=s.replace("   const score=supported.length*2+partial.length;", "   const strength=c=>c?.status==='supported'?2:c?.status==='partial'?1:0;\n   // Lexicographic priority: even full support for the secondary goal cannot outweigh partial support for the main goal.\n   const primaryStrength=strength(checks[0]),secondaryStrength=strength(checks[1]);\n   const score=primaryStrength*3+secondaryStrength;")
s=s.replace("score===0?'Belum cukup data untuk prioritasmu'", "primaryStrength===0?'Belum cukup data untuk prioritas utamamu'")
s=s.replace("return [{product,score,reasons,checks,constraints,gaps,verdict,personalized:score>0}];", "return [{product,score,primaryStrength,secondaryStrength,reasons,checks,constraints,gaps,verdict,personalized:primaryStrength>0}];")
p.write_text(s,encoding='utf-8')

p=root/'public/finder-state.js'
s=p.read_text(encoding='utf-8').replace("gadgetpick.finder.v4","gadgetpick.finder.v5")
s=s.replace("const raw=JSON.parse(storage?.getItem(KEY)||'{}'),profiles={};", "const current=storage?.getItem(KEY),legacy=!current?storage?.getItem('gadgetpick.finder.v4'):null;\n    const raw=JSON.parse(current||legacy||'{}'),profiles={};")
s=s.replace("const answers=cleanAnswers(entry,saved.answers);", "// Old selections were unordered; preserve price/requirements but ask for a deliberate main priority.\n      const answers=cleanAnswers(entry,legacy?{...saved.answers,priorities:[]}:saved.answers);")
s=s.replace("submitted:saved.submitted===true&&isComplete(entry,answers)", "submitted:!legacy&&saved.submitted===true&&isComplete(entry,answers)")
p.write_text(s,encoding='utf-8')
