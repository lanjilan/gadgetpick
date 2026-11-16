import test from 'node:test';
import assert from 'node:assert/strict';
import {saveGuides,restoreGuides} from '../public/finder-state.js';
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};};
test('Unsubmitted smartphone simulation survives reload without becoming submitted',()=>{
 const s=storage(),id='smartphone-tablet/smartphone';
 saveGuides(s,{[id]:{answers:{},submitted:false,draft:{minPrice:15000000,maxPrice:30000000,priorities:['gaming','camera'],constraints:{os:'android'}}}});
 const p=restoreGuides(s)[id];
 assert.deepEqual(p.draft.priorities,['gaming','camera']);
 assert.equal(p.draft.maxPrice,30000000);assert.equal(p.draft.constraints.os,'android');
 assert.equal(p.submitted,false);
});
test('Pending edits remain distinct from the submitted audio recommendations',()=>{
 const s=storage();
 saveGuides(s,{'audio/tws':{answers:{minPrice:0,maxPrice:1000000,priorities:['balanced']},submitted:true,draft:{minPrice:900000,maxPrice:500000,priorities:['bass'],constraints:{untrusted:'no'}}}});
 const p=restoreGuides(s)['audio/tws'];
 assert.equal(p.submitted,true);assert.equal(p.answers.maxPrice,1000000);
 assert.equal(p.draft.minPrice,900000);assert.equal(p.draft.maxPrice,500000);
 assert.equal(p.draft.constraints.untrusted,undefined);
});
