from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'public/finder-ui.js'
s=p.read_text(encoding='utf-8')
s=s.replace("const a=profile.answers,group=groups[entry.group],show=ctx.showResults&&profile.submitted;", "const a=profile.answers,draft=profile.draft||a,group=groups[entry.group],show=ctx.showResults&&profile.submitted;")
start=s.index('  main.innerHTML=heading+`<form')
end=s.index('  const form=main.querySelector',start)
form=s[start:end]
for key in ['budget','unlimited','use','priority']:
    form=form.replace('a.'+key,'draft.'+key)
form=form.replace('${draft.budget||\'\'}','${esc(draft.budget||\'\')}')
s=s[:start]+form+s[end:]
s=s.replace("  unlimited.onchange=()=>{budget.disabled=unlimited.checked;};", "  const readForm=()=>({budget:budget.value,unlimited:unlimited.checked,use:form.elements.use?.value||'any',priority:form.elements.priority?.value||'any'});\n  const rememberDraft=()=>{profile.draft=readForm();main.querySelector('#finder-dirty').hidden=!show;};\n  unlimited.onchange=()=>{budget.disabled=unlimited.checked;};")
s=s.replace("budget.value=b.dataset.budget;main.querySelector('#finder-dirty').hidden=!show;", "budget.value=b.dataset.budget;rememberDraft();")
s=s.replace("  form.oninput=()=>{main.querySelector('#finder-dirty').hidden=!show;};", "  form.oninput=rememberDraft;")
s=s.replace("e.preventDefault();const raw={budget:budget.value,unlimited:unlimited.checked,use:form.elements.use?.value||'any',priority:form.elements.priority?.value||'any'};", "e.preventDefault();const raw=readForm();")
s=s.replace("profile.answers=cleanAnswers(entry,raw);profile.submitted=true;ctx.onSubmit();", "profile.answers=cleanAnswers(entry,raw);profile.submitted=true;delete profile.draft;ctx.onSubmit();")
s=s.replace("  const applied=`", "  const demoOnly=products.filter(p=>matchesEntry(p,entry)).every(p=>p.demo);\n  const applied=`")
s=s.replace("${entry.category==='Audio'?'<p class=\"quick-source\">", "${entry.category==='Audio'&&!demoOnly?'<p class=\"quick-source\">")
p.write_text(s,encoding='utf-8')
p=root/'public/app.js'
s=p.read_text(encoding='utf-8').replace("${p.demo?'Contoh':'Kitab Audio'}", "${p.demo?'Contoh':p.category==='Audio'?'Kitab Audio':'Review'}").replace('Baca komprominya','PERBANDINGAN').replace('Mana yang paling pas?','Bandingkan pilihanmu').replace("['Kompromi',p=>p.minus]", "['Kekurangan',p=>plainNote(p.minus)]")
p.write_text(s,encoding='utf-8')
