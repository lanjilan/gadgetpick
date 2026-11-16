import {entries} from './catalog.js';
import {cleanAnswers,isComplete} from './finder.js';
const KEY='gadgetpick.finder.v5';
export function restoreGuides(storage){
  try{
    const current=storage?.getItem(KEY),legacy=!current?storage?.getItem('gadgetpick.finder.v4'):null;
    const raw=JSON.parse(current||legacy||'{}'),profiles={};
    for(const entry of entries){
      const saved=raw[entry.id];if(!saved||typeof saved!=='object')continue;
      // Old selections were unordered; preserve price/requirements but ask for a deliberate main priority.
      const answers=cleanAnswers(entry,legacy?{...saved.answers,priorities:[]}:saved.answers);
      profiles[entry.id]={answers,submitted:!legacy&&saved.submitted===true&&isComplete(entry,answers),sort:'recommended'};
    }
    return profiles;
  }catch{return {};}
}
export function saveGuides(storage,profiles){
  try{
    if(!storage)return false;
    const safe={};
    for(const entry of entries){const p=profiles[entry.id];if(p)safe[entry.id]={answers:cleanAnswers(entry,p.answers),submitted:p.submitted===true&&isComplete(entry,p.answers)};}
    storage.setItem(KEY,JSON.stringify(safe));return true;
  }catch{return false;}
}
