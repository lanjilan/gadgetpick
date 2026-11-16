from pathlib import Path

root = Path(__file__).resolve().parents[1]
p = root / 'public/guided.js'
s = p.read_text(encoding='utf-8')
s = s.replace("${[300000,500000,1000000,2000000,5000000].map", "${(q.presets||[300000,500000,1000000,2000000,5000000]).map")
s = s.replace("placeholder=\"Contoh: 1000000\"", "placeholder=\"${q.presets?'Contoh: '+q.presets[0]:'Contoh: 1000000'}\"")
marker = 'export function renderIntake(main,category,profile,callbacks){'
helpers = """const categoryLabel=category=>category==='HP'?'Smartphone':category;
const parentHref=category=>['HP','Tablet'].includes(category)?'#rekomendasi/smartphone-tablet':['Monitor','Komponen PC'].includes(category)?'#rekomendasi/komponen-pc':'#rekomendasi';
const parentLabel=category=>parentHref(category)==='#rekomendasi'?'Ganti kategori':'Ganti jenis perangkat';
"""
s = s.replace(marker, helpers + marker)
s = s.replace('<a href="#rekomendasi">← Ganti kategori</a>', '<a href="${parentHref(category)}">← ${parentLabel(category)}</a>')
s = s.replace('${esc(category)}', '${esc(categoryLabel(category))}')
s = s.replace("category==='Audio'?'Audio personal':category", "category==='Audio'?'Audio personal':categoryLabel(category)")
s = s.replace("profile.step===0?'Ganti kategori':'Kembali'", "profile.step===0?parentLabel(category):'Kembali'")
s = s.replace("if(profile.step===0){location.hash='rekomendasi';return;}", "if(profile.step===0){location.hash=parentHref(category);return;}")
p.write_text(s,encoding='utf-8')

p = root / 'public/app.js'
s = p.read_text(encoding='utf-8').replace('${esc(state.category)}','${esc(categoryInfo[state.category].label||state.category)}')
s = s.replace('Rekomendasi ${categoryEntry[0]}', 'Rekomendasi ${categoryEntry[1].label||categoryEntry[0]}')
s = s.replace('<option value="5000000">Maks. Rp5 juta</option>', '<option value="5000000">Maks. Rp5 juta</option><option value="10000000">Maks. Rp10 juta</option><option value="15000000">Maks. Rp15 juta</option><option value="20000000">Maks. Rp20 juta</option>')
p.write_text(s,encoding='utf-8')

p = root / 'src/worker.js'
s = p.read_text(encoding='utf-8').replace("HP:'phone','Komponen PC'", "HP:'phone',Tablet:'tablet',Laptop:'laptop','Komponen PC'")
p.write_text(s,encoding='utf-8')

p = root / 'tests/needs-state.test.js'
s = p.read_text(encoding='utf-8').replace("'HP','Aksesori'", "'HP','Tablet','Laptop'")
p.write_text(s,encoding='utf-8')

p = root / 'public/styles.css'
s = p.read_text(encoding='utf-8')
s += '''
/* Four product categories; building a complete PC is a separate task. */
.main-category-choices{grid-template-columns:repeat(2,minmax(0,1fr))}
.special-category{margin-top:20px}.special-category .category-choice{min-height:140px;padding-right:195px}.special-category .choice-copy p{max-width:none}.special-category .choice-art{top:17px}.special-label{display:block;font-size:10px;letter-spacing:.08em;margin-bottom:9px;color:#d9e6d9}.group-builder-link{padding:24px 0;font-size:14px;color:var(--muted)}.group-builder-link a{color:var(--green);text-underline-offset:3px}
@media(max-width:600px){.main-category-choices .category-choice{padding:18px;min-height:195px}.main-category-choices .choice-copy h2{font-size:23px}.special-category .category-choice{min-height:160px;padding:21px 74px 21px 21px}.special-category .choice-art{right:10px;width:65px;height:75px;top:25px}.special-category .choice-art svg{width:55px;height:65px}.special-category .choice-arrow{top:auto;bottom:17px;right:20px}.special-category .choice-copy h2{font-size:25px}}
'''
p.write_text(s,encoding='utf-8')
