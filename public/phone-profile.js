// Editorial illustration, NOT an assessment of any real smartphone or reviewer score.
export const phoneProfileAspects = [
  {id:'gaming',label:'Performa'},
  {id:'camera',label:'Kamera'},
  {id:'battery',label:'Baterai'},
  {id:'display',label:'Layar'},
  {id:'updates',label:'Update'}
];

// Loose expectations for different spending ceilings. These are fictional design
// anchors, not benchmark averages, product ratings or promises at any price.
const anchors=[
  {price:1000000,values:[4.3,4.1,5.1,4.8,4.0]},
  {price:3000000,values:[5.5,5.3,6.2,6.0,5.3]},
  {price:6000000,values:[7.0,7.0,7.2,7.4,6.9]},
  {price:10000000,values:[8.0,8.0,8.0,8.3,7.8]},
  {price:15000000,values:[8.7,8.7,8.6,8.9,8.5]},
  {price:30000000,values:[9.2,9.2,9.0,9.3,9.1]}
];
const tradeoffs={
  gaming:[1.5,-0.8,-0.25,0.2,-0.15],
  camera:[-0.35,1.5,-0.2,0.1,0],
  battery:[-0.35,-0.3,1.65,-0.1,0.05]
};
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const score=value=>Math.round(clamp(value,0,10)*10)/10;

export function simulatePhoneProfile({minPrice,maxPrice,unlimited=false,priorities=[]}={}){
  if(unlimited||minPrice==null||maxPrice==null||minPrice===''||maxPrice==='')return null;
  const low=Number(minPrice),high=Number(maxPrice);
  if(!Number.isSafeInteger(low)||!Number.isSafeInteger(high)||low<0||high<=0||low>high||high>100000000)return null;
  const ids=Array.isArray(priorities)?priorities:[];
  if(ids.length<1||ids.length>2||new Set(ids).size!==ids.length||ids.some(id=>id!=='allrounder'&&!tradeoffs[id])||(ids.includes('allrounder')&&ids.length>1))return null;
  const lower=anchors.findLast(a=>a.price<=high)||anchors[0];
  const upper=anchors.find(a=>a.price>=high)||anchors.at(-1);
  const ratio=lower===upper?0:clamp((high-lower.price)/(upper.price-lower.price),0,1);
  const values=lower.values.map((value,i)=>value+(upper.values[i]-value)*ratio);
  // Higher budgets allow more room for several strong aspects simultaneously.
  const tradeoffScale=clamp(1-(high-3000000)/34000000,0.3,1);
  if(ids[0]!=='allrounder')ids.forEach((id,i)=>{
    const weight=(i===0?1:0.62)*tradeoffScale;
    tradeoffs[id].forEach((difference,j)=>{values[j]+=difference*weight;});
  });
  const results=phoneProfileAspects.map((aspect,i)=>({...aspect,score:score(values[i])}));
  const name={gaming:'Gaming',camera:'Kamera',battery:'Baterai',allrounder:'Serba bisa'};
  return {
    scores:results,
    maxPrice:high,
    priorities:ids,
    summary:ids[0]==='allrounder'
      ?'Gambaran kemampuan yang merata. Tidak berarti setiap HP pada harga ini pasti sama bagusnya di semua aspek.'
      :'Fokus '+ids.map(id=>name[id]).join(' + ')+' bisa membawa kompromi pada aspek lain. Angkanya hanya skenario untuk memahami pilihan.',
    disclaimer:'Ilustrasi editorial, bukan skor HP nyata, data benchmark, atau jaminan kualitas. Nilai sesungguhnya harus dibuktikan dari review dan pengujian.'
  };
}
