from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'public/finder-ui.js'
s=p.read_text(encoding='utf-8').replace('<span class="priority-rank" ', '<span class="priority-rank" aria-hidden="true" ')
p.write_text(s,encoding='utf-8')
p=root/'tests/finder.test.js'
s=p.read_text(encoding='utf-8')
s=s.replace("use:'any',",'')
s=s.replace(" assert.equal(isComplete(phone,{...base,use:''}),false);", " assert.equal(isComplete(phone,{...base,use:''}),true); // Legacy purpose no longer affects the single priority question.")
start=s.index("test('Only two priorities")
end=s.index("test('Camera capability",start)
s=s[:start]+'''test('Only two ordered priorities are accepted and legacy purpose is discarded',()=>{
 assert.ok(validationErrors(phone,{...base,priorities:['camera','battery','display']}).some(e=>e.id==='priorities'));
 const clean=cleanAnswers(phone,{...base,use:'gaming',priorities:['battery','camera']});
 assert.deepEqual(clean.priorities,['battery','camera']);assert.equal(clean.use,undefined);
});
'''+s[end:]
start=s.index("test('Photo/video use")
end=s.index("test('Recorded battery",start)
s=s[:start]+'''test('A removed purpose cannot silently filter results or return as a stored requirement',()=>{
 const result=mapRecommendations(demoProducts,phone,{...base,use:'creator',priorities:['camera']});
 assert.deepEqual(result.matches.map(m=>m.product.id),mapRecommendations(demoProducts,phone,{...base,priorities:['camera']}).matches.map(m=>m.product.id));
 assert.equal(result.answers.use,undefined);
});
'''+s[end:]
s=s.replace("test('Gaming/meeting cannot be filled using music-only source records',()=>{\n for(const use of ['gaming','meeting']){\n  const result=mapRecommendations(real,tws,{...base,use,priorities:['any']});\n  assert.equal(result.matches.length,0);assert.ok(result.withinBudget>0);\n }\n});", "test('A main gaming priority cannot use music-only reviews or generic responsiveness as proof',()=>{\n const result=mapRecommendations(real,tws,{...base,priorities:['gaming']});\n assert.equal(result.matches.length,0);assert.ok(result.withinBudget>0);\n assert.equal(mapRecommendations(demoProducts,phone,{...base,priorities:['gaming']}).matches.length,0);\n});")
s=s.replace("{...base,maxPrice:10000000,use:'gaming'}", "{...base,maxPrice:10000000,priorities:['gaming']}")
s=s.replace("{...base,use:'study'}", "{...base,priorities:['battery']}")
s+='''
const evidencePhone=(id,price,evidence)=>({...demoProducts.find(p=>p.id==='phone-01'),id,price,specs:{decisionEvidence:evidence}});
test('Swapping main and additional priorities changes ranking before price is considered',()=>{
 const camera=evidencePhone('camera',4500000,{camera:{status:'supported',note:'Camera evidence fixture'}});
 const battery=evidencePhone('battery',3500000,{battery:{status:'supported',note:'Battery evidence fixture'}});
 // Remove the inherited battery tag so the controlled records isolate priority order.
 camera.character=[];battery.character=[];
 const cameraFirst=mapRecommendations([battery,camera],phone,{...base,priorities:['camera','battery']});
 const batteryFirst=mapRecommendations([camera,battery],phone,{...base,priorities:['battery','camera']});
 assert.equal(cameraFirst.matches[0].product.id,'camera');assert.equal(batteryFirst.matches[0].product.id,'battery');
 assert.deepEqual(cameraFirst.matches[0].checks.map(c=>[c.id,c.rank]),[['camera',1],['battery',2]]);
});
test('Secondary evidence cannot outrank partial evidence for the main priority or pretend the main one is verified',()=>{
 const primary=evidencePhone('primary',4500000,{camera:{status:'partial',note:'Partial camera fixture'}});
 const secondary=evidencePhone('secondary',3000000,{battery:{status:'supported',note:'Battery evidence fixture'}});
 primary.character=[];secondary.character=[];
 const result=mapRecommendations([secondary,primary],phone,{...base,priorities:['camera','battery']});
 assert.equal(result.matches[0].product.id,'primary');
 const other=result.matches.find(m=>m.product.id==='secondary');assert.equal(other.personalized,false);assert.equal(other.checks[0].status,'unknown');
});
test('A recorded main gaming use can keep a secondary camera preference without inventing camera evidence',()=>{
 const gaming={...evidencePhone('gaming',4000000,{}),needs:['Gaming'],character:['Responsif']};
 const result=mapRecommendations([gaming],phone,{...base,priorities:['gaming','camera']});
 assert.equal(result.matches.length,1);assert.equal(result.matches[0].checks[0].status,'partial');assert.equal(result.matches[0].checks[1].status,'unknown');
});
test('Older unordered choices keep their price range but do not silently become a main priority',()=>{
 const s=storage();s.setItem('gadgetpick.finder.v4',JSON.stringify({'smartphone-tablet/smartphone':{answers:{...base,priorities:['camera','battery'],constraints:{os:'android'}},submitted:true}}));
 const restored=restoreGuides(s)['smartphone-tablet/smartphone'];
 assert.equal(restored.answers.minPrice,base.minPrice);assert.equal(restored.answers.maxPrice,base.maxPrice);assert.deepEqual(restored.answers.priorities,[]);assert.equal(restored.submitted,false);assert.equal(restored.answers.constraints.os,'android');
});
'''
p.write_text(s,encoding='utf-8')
