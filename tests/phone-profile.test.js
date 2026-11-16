import test from 'node:test';
import assert from 'node:assert/strict';
import {simulatePhoneProfile} from '../public/phone-profile.js';
import {findEntry} from '../public/catalog.js';
import {cleanAnswers} from '../public/finder.js';

const scores=p=>Object.fromEntries(p.scores.map(v=>[v.id,v.score]));
test('Phone preview needs a defined budget and priority',()=>{
 assert.equal(simulatePhoneProfile({minPrice:'',maxPrice:'',priorities:['gaming']}),null);
 assert.equal(simulatePhoneProfile({minPrice:0,maxPrice:3000000,unlimited:true,priorities:['gaming']}),null);
 assert.equal(simulatePhoneProfile({minPrice:5000000,maxPrice:1000000,priorities:['gaming']}),null);
 assert.equal(simulatePhoneProfile({minPrice:0,maxPrice:3000000,priorities:['allrounder','gaming']}),null);
});
test('Gaming trade-offs adjust to the selected budget',()=>{
 const low=scores(simulatePhoneProfile({minPrice:1000000,maxPrice:3000000,priorities:['gaming']}));
 const high=scores(simulatePhoneProfile({minPrice:15000000,maxPrice:22000000,priorities:['gaming']}));
 assert.ok(low.gaming>low.camera);
 assert.ok(low.camera>=4&&low.camera<=6);
 assert.ok(high.camera>8&&high.gaming>9);
});
test('All-rounder stays balanced, and high budgets yield higher illustration scores',()=>{
 const mid=scores(simulatePhoneProfile({minPrice:3000000,maxPrice:6000000,priorities:['allrounder']}));
 const high=scores(simulatePhoneProfile({minPrice:15000000,maxPrice:30000000,priorities:['allrounder']}));
 assert.ok(Math.max(...Object.values(mid))-Math.min(...Object.values(mid))<1);
 assert.ok(Math.min(...Object.values(high))>8);
});
test('Primary plus secondary preferences matter, without mutating input',()=>{
 const input={minPrice:3000000,maxPrice:6000000,priorities:['camera','battery']};
 const copy=JSON.stringify(input);
 const p=scores(simulatePhoneProfile(input));
 assert.ok(p.camera>p.gaming);
 assert.ok(p.battery>6.5);
 assert.equal(JSON.stringify(input),copy);
});
test('Phone choice list is small, and all-rounder is exclusive',()=>{
 const phone=findEntry('smartphone-tablet/smartphone');
 assert.deepEqual(phone.priorities.map(x=>x.value),['gaming','camera','battery','allrounder']);
 assert.deepEqual(cleanAnswers(phone,{minPrice:0,maxPrice:3000000,priorities:['gaming','allrounder']}).priorities,['allrounder']);
 assert.ok(phone.constraints.some(f=>f.id==='displayPreference'));
 assert.ok(phone.constraints.some(f=>f.id==='softwareUpdates'));
});
