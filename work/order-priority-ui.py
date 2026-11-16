from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'public/finder-ui.js'
s=p.read_text(encoding='utf-8').replace("unlimited:false,use:'',priorities:[]", "unlimited:false,priorities:[]")
start=s.index('function priorityHTML(')
end=s.index('function buyingNote(',start)
s=s[:start]+'''const noPriorityLabel=entry=>entry.category==='Audio'?'Belum ada prioritas khusus':'Seimbang / bantu pilih';
function priorityHTML(entry,a){return [...priorityOptions(entry),{value:'any',label:noPriorityLabel(entry)}].map(o=>{const rank=(a.priorities||[]).indexOf(o.value)+1;return `<label class="priority-option"><input type="checkbox" name="priorities" value="${o.value}" ${rank?'checked':''}><span><strong>${esc(o.label)}</strong>${o.note?`<small>${esc(o.note)}</small>`:''}</span><span class="priority-rank" ${!rank||o.value==='any'?'hidden':''}>${rank||''}</span></label>`;}).join('');}
function priorityOrderHTML(entry,selected){
 if(!selected.length)return '<p class="field-help">Pilihan pertama menjadi prioritas utama. Pilihan kedua menjadi tambahan.</p>';
 if(selected[0]==='any')return '<p class="field-help">Belum ada satu prioritas yang didahulukan. Kami tampilkan pilihan awal beserta pertimbangannya.</p>';
 return '<ol class="selected-priorities">'+selected.map((id,i)=>{const item=priorityOptions(entry).find(o=>o.value===id);return `<li><span class="selected-priority-number">${i+1}</span><div><small>${i===0?'Prioritas utama':'Prioritas tambahan'}</small><strong>${esc(item?.label||id)}</strong></div>${i===1?'<button type="button" class="priority-promote" data-promote-priority>Jadikan utama</button>':''}</li>`;}).join('')+'</ol>';
}
'''+s[end:]
s=s.replace('Tentukan rentang harga, pemakaian, dan hal yang paling kamu utamakan.', 'Tentukan rentang harga dan pilih apa yang paling penting buatmu.')
start=s.index(' <div class="decision-fields">')
end=s.index('\n ${entry.constraints.length?',start)
s=s[:start]+''' <div class="decision-fields ordered-decision-fields"><fieldset class="priority-section" id="question-priorities"><legend>Apa yang paling penting buatmu?</legend><p class="field-help">Pilih satu atau dua. Urutannya menentukan mana yang didahulukan ketika ada kompromi.</p><div id="priority-order" class="priority-order" aria-live="polite" aria-atomic="true" tabindex="-1">${priorityOrderHTML(entry,draft.priorities||[])}</div><div id="priority-options" class="priority-options">${priorityHTML(entry,draft)}</div></fieldset></div>'''+s[end:]
s=s.replace(" const readForm=()=>({minPrice:min.value,maxPrice:max.value,unlimited:unlimited.checked,use:form.elements.use?form.elements.use.value:'any',priorities:[...form.querySelectorAll('[name=priorities]:checked')].map(x=>x.value),constraints:", " let selected=[...(draft.priorities||[])];\n const readForm=()=>({minPrice:min.value,maxPrice:max.value,unlimited:unlimited.checked,priorities:[...selected],constraints:")
start=s.index(" form.addEventListener('change',e=>{")
end=s.index('\n form.onsubmit=',start)
s=s[:start]+''' const updatePriorityUI=()=>{
   form.querySelectorAll('[name=priorities]').forEach(input=>{const rank=selected.indexOf(input.value)+1;input.checked=rank>0;const badge=input.closest('label').querySelector('.priority-rank');badge.textContent=rank||'';badge.hidden=!rank||input.value==='any';});
   main.querySelector('#priority-order').innerHTML=priorityOrderHTML(entry,selected);
 };
 main.querySelector('#priority-order').onclick=e=>{if(!e.target.closest('[data-promote-priority]'))return;selected=[selected[1],selected[0]];updatePriorityUI();remember();main.querySelector('#priority-order').focus({preventScroll:true});};
 form.addEventListener('change',e=>{
   if(e.target.name==='priorities'){
     const id=e.target.value;
     if(e.target.checked){
       if(id==='any')selected=['any'];
       else if(selected.filter(v=>v!=='any').length>=2){error.textContent='Sudah ada dua prioritas. Hapus salah satu dulu jika ingin menggantinya.';error.hidden=false;}
       else {selected=[...selected.filter(v=>v!=='any'),id];error.hidden=true;}
     }else {selected=selected.filter(v=>v!==id);error.hidden=true;}
     updatePriorityUI();
   }
   remember();
 });'''+s[end:]
s=s.replace("(errors[0].id==='use'?'finder-use':errors[0].id==='priorities'?'question-priorities':errors[0].id)", "(errors[0].id==='priorities'?'question-priorities':errors[0].id)")
s=s.replace(" const result=mapRecommendations(products,entry,a),useLabel=entry.uses?.find(([id])=>id===a.use)?.[1];\n const priorities=priorityOptions(entry,a).filter(p=>a.priorities.includes(p.value));\n const applied=rangeText(a)+(a.use&&a.use!=='any'?' · '+useLabel:'');", " const result=mapRecommendations(products,entry,a);\n const priorities=a.priorities.map(id=>priorityOptions(entry).find(p=>p.value===id)).filter(Boolean);\n const applied=rangeText(a);")
s=s.replace("<p>Prioritas: ${esc(priorities.map(p=>p.label).join(' · '))}</p>", "<p class=\"applied-priority-order\">${priorities.map((p,i)=>`<span><strong>${i+1}. ${esc(p.label)}</strong> — ${i===0?'utama':'tambahan'}</span>`).join('')}</p>")
s=s.replace('Data untuk prioritasmu belum cukup. Produk di bawah sesuai jenis dan rentang harga, tetapi belum bisa disebut pilihan paling cocok.', 'Data untuk prioritas utamamu belum cukup. Produk di bawah sesuai jenis dan rentang harga, tetapi belum bisa disebut pilihan paling cocok.')
s=s.replace('<dt>${esc(c.label)}</dt>', '<dt><small>${c.rank===1?\'Prioritas utama\':\'Prioritas tambahan\'}</small>${esc(c.label)}</dt>')
s=s.replace('pilihan sesuai rentang dan pemakaian.', 'pilihan sesuai rentang dan syarat.')
s=s.replace('Belum ada data penggunaan atau spesifikasi yang memenuhi pilihanmu.', 'Belum ada data yang mendukung prioritas utama atau memenuhi syaratmu.')
p.write_text(s,encoding='utf-8')
