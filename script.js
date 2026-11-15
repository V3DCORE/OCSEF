// JavaScript: game content, drawing helpers, interactions, and screen transitions.

// Item images are configured in the HTML image library near the bottom of index.html.
// If an image fails to load, the original pixel drawing remains visible.

// ---------- Pixel sprites (16x16 grids drawn to canvas) ----------
const P={k:'#1a1226',w:'#f2f2f2',g:'#a8a8b8',s:'#c9cfe0',d:'#3a3f5c',b:'#4fb6e8',c:'#bff0ff',y:'#ffd23f',G:'#2fae4a'};
function spr(cv,rows,pal){const p=Object.assign({},P,pal),h=rows.length,w=rows[0].length;cv.width=w;cv.height=h;const x=cv.getContext('2d');
  rows.forEach((r,j)=>[...r].forEach((ch,i)=>{if(p[ch]&&ch!=='.'){x.fillStyle=p[ch];x.fillRect(i,j,1,1)}}))}
const S={
charger:["................","....kk....kk....","....ss....ss....","..kkkkkkkkkkkk..","..kwwwwwwwwwwk..","..kwwwwwwwwwwk..","..kwwgwwwwwwwk..","..kwwwwwwwwwwk..","..kwwwwwwwwwwk..","..kkkkkkkkkkkk..",".......kk.......",".......kk.......","......kk........",".......kk.......","........kk......",".........kkkk..."],
phone:["................","....kkkkkkkk....","....kddddddk....","....kdbbbbdk....","....kdbccbdk....","....kdbbbbdk....","....kdbbbcdk....","....kdbbbbdk....","....kdbcbbdk....","....kdbbbbdk....","....kdbbbbdk....","....kddddddk....","....kddwwddk....","....kkkkkkkk....","................","................"],
laptop:["................","................","..kkkkkkkkkkkk..","..kddddddddddk..","..kdbbbbbbbbdk..","..kdbbcbbbbbdk..","..kdbbbbbbcbdk..","..kdbbbbbbbbdk..","..kddddddddddk..","..kkkkkkkkkkkk..",".kssssssssssssk.",".kskskskskskssk.",".ksssssssssssk..",".kkkkkkkkkkkkk..","................","................"],
chip:["................","....y.y.y.y.....","...kkkkkkkkkk...","..ykddddddddky..","...kddddddddk...","..ykddccccddky..","...kddccccddk...","..ykddccccddky..","...kddccccddk...","..ykddddddddky..","...kddddddddk...","...kkkkkkkkkk...","....y.y.y.y.....","................","................","................"]};
const CHIPPAL={d:'#2b2f3a',c:'#7b8394'};
const CHECK=["GGGGGGGG","GGGGGwwG","GGGGwwGG","wGGGwwGG","wwGwwGGG","GwwwGGGG","GGwwGGGG","GGGGGGGG"];

// ---------- Content ----------
const ITEMS=[
{id:'charger',name:'Phone Charger',x:12,y:56,r:-10,metals:['Copper','Tin','Nickel','Trace Gold'],
 cost:["Copper mining strips land and leaves acidic runoff that can poison rivers and groundwater.","Tin from Indonesia's Bangka island is often dug in unsafe pits where miners have died, while dredging damages reefs and coastal waters.","Smelting metals burns huge amounts of energy, releasing greenhouse gases for a tiny cable."]},
{id:'phone',name:'Smartphone',x:60,y:14,r:8,metals:['Cobalt','Lithium','Gold','Tantalum','Copper'],
 cost:["More than half of the world's cobalt comes from the Democratic Republic of the Congo, where artisanal miners, including children, dig in dangerous conditions.","Lithium brine extraction uses vast amounts of water in some of Earth's driest regions.","Tantalum (from coltan) has been linked to conflict financing and forest loss in central Africa.","Gold mining can spread toxic mercury into soil and water."]},
{id:'laptop',name:'Laptop',x:22,y:12,r:-4,metals:['Cobalt','Lithium','Copper','Silver','Gold','Tin'],
 cost:["Most of a laptop's lifetime carbon footprint comes from making it, mostly mining and manufacturing.","Cobalt and lithium batteries carry the same labor and water problems as phones.","When dumped and burned in informal sites, cables and plastics release lead and other toxins into the air, soil and workers' bodies."]},
{id:'chip',name:'Electronic Microchip',x:66,y:58,r:12,metals:['Gold','Copper','Tin','Tantalum','Palladium'],
 cost:["A tiny amount of gold can mean moving tons of rock, leaving scarred land, cleared forest and toxic tailings.","Chip making needs ultra-pure water and strong chemicals.","Gold and palladium mining use cyanide or mercury in places with weak environmental rules."]}
];
const STATIONS=[
{name:'Community Tech Hub',x:6,y:10,w:28,h:20,col:'#2aa7a0',acc:'Phones, tablets, laptops, chargers and cables.',use:'Working devices are wiped and refurbished. Broken ones are shredded and sorted, and copper and gold are recovered for new electronics.'},
{name:'GreenBin Electronics Drop-off',x:120,y:10,w:28,h:20,col:'#3fae4a',acc:'Chargers, cables, small gadgets, circuit boards, old chips and sealed batteries.',use:'Cobalt and lithium go back into new battery cells. Gold and tin from chips and solder return to new circuit boards.'},
{name:'City Eco-Center',x:98,y:60,w:30,h:22,col:'#3b6fd8',up:1,acc:'Laptops, monitors, TVs, printers and other bulky electronics.',use:'Machines shred and separate copper, aluminum, silver, gold and tantalum for manufacturers to use again.'}
];

// ---------- Screen 1 ----------
const desk=document.getElementById('desk'),done=new Set();
let cur=null,last=null;
const pips=document.getElementById('pips');
ITEMS.forEach(()=>{const d=document.createElement('span');d.className='pip';pips.appendChild(d)});
ITEMS.forEach(it=>{
  const b=document.createElement('button');b.className='item';b.id='i-'+it.id;
  b.style.setProperty('--r',`${it.r}deg`);
  b.setAttribute('aria-label','Inspect '+it.name);
  const c=document.createElement('canvas');c.className='item-art';spr(c,S[it.id],it.id==='chip'?CHIPPAL:{});
  const imageSource=document.querySelector(`[data-item-image="${it.id}"]`);
  const image=document.createElement('img');image.className='item-art';image.alt='';
  image.onload=()=>{c.hidden=true};
  image.onerror=()=>{image.hidden=true};
  if(imageSource) image.src=imageSource.getAttribute('src');
  const k=document.createElement('span');k.className='badge';const kc=document.createElement('canvas');spr(kc,CHECK);k.appendChild(kc);
  const l=document.createElement('span');l.className='lab';l.textContent=it.name;
  b.append(c,image,k,l);b.onclick=()=>openItem(it,b);desk.appendChild(b);
});
const ov=document.getElementById('ov');
function openItem(it,btn){
  cur=it;last=btn;
  const previewCanvas=document.getElementById('dc');
  const previewImage=document.getElementById('di');
  const imageSource=document.querySelector(`[data-item-image="${it.id}"]`);
  previewCanvas.hidden=false;previewImage.hidden=true;
  spr(previewCanvas,S[it.id],it.id==='chip'?CHIPPAL:{});
  if(imageSource){
    previewImage.onload=()=>{previewCanvas.hidden=true;previewImage.hidden=false};
    previewImage.onerror=()=>{previewCanvas.hidden=false;previewImage.hidden=true};
    previewImage.src=imageSource.getAttribute('src');
  }
  document.getElementById('dn').textContent=it.name;
  document.getElementById('dm').innerHTML=it.metals.map(m=>`<span class="chip">${m}</span>`).join('');
  document.getElementById('dl').innerHTML=it.cost.map(t=>`<li>${t}</li>`).join('');
  ov.classList.add('show');document.getElementById('close').focus();
}
function closeItem(){
  if(!cur)return;
  done.add(cur.id);last.classList.add('done');
  ov.classList.remove('show');cur=null;
  document.getElementById('count').textContent=`Items Inspected: ${done.size}/4`;
  [...pips.children].forEach((p,i)=>p.classList.toggle('on',i<done.size));
  if(done.size===4)document.getElementById('go').classList.add('show');
  last.focus();
}
document.getElementById('close').onclick=closeItem;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&cur)closeItem()});
ov.addEventListener('click',e=>{if(e.target===ov)closeItem()});

// ---------- Screen transitions ----------
const s1=document.getElementById('s1'),s2=document.getElementById('s2');
function swap(a,b){a.classList.add('out');setTimeout(()=>{a.classList.remove('show','out');b.classList.add('show');scrollTo(0,0)},500)}
document.getElementById('goBtn').onclick=()=>swap(s1,s2);
document.getElementById('restart').onclick=()=>{
  done.clear();document.querySelectorAll('.item').forEach(i=>i.classList.remove('done'));
  document.getElementById('go').classList.remove('show');
  document.getElementById('count').textContent='Items Inspected: 0/4';
  [...pips.children].forEach(p=>p.classList.remove('on'));
  tip.classList.remove('show');swap(s2,s1);
};

// ---------- Screen 2: neighborhood map (160x96 drawing with optional image) ----------
const mapImage=document.getElementById('map-image');
const mc=document.getElementById('mc'),x=mc.getContext('2d');
mapImage.onload=()=>{mapImage.hidden=false;mc.hidden=true};
mapImage.onerror=()=>{mapImage.hidden=true;mc.hidden=false};
const R=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
R(0,0,160,96,'#6cc04a');
for(let i=0;i<260;i++)R(Math.floor(rnd()*160),Math.floor(rnd()*96),1,1,rnd()>.5?'#5ab23c':'#7fd05a');
// roads + sidewalks
R(0,38,160,2,'#d8d0bd');R(0,54,160,2,'#d8d0bd');R(70,0,2,96,'#d8d0bd');R(84,0,2,96,'#d8d0bd');
R(0,40,160,14,'#4a4a58');R(72,0,12,96,'#4a4a58');R(72,40,12,14,'#4a4a58');
for(let i=0;i<160;i+=8)if(i<70||i>84)R(i,46,4,1,'#ffd23f');
for(let j=0;j<96;j+=8)if(j<38||j>54)R(77,j,1,4,'#ffd23f');
for(let j=40;j<54;j+=2){R(62,j,6,1,'#eee');R(88,j,6,1,'#eee')}
function house(a,b,c){R(a,b,14,11,'#2a1a12');R(a+1,b+1,12,9,c);R(a+1,b+5,12,1,'rgba(0,0,0,.25)');R(a+10,b+2,2,2,'#7a6a5a');R(a+6,b+11,3,3,'#8a5a34');R(a+5,b+14,5,1,'#d8d0bd')}
[[44,8,'#d9534f'],[92,8,'#e8a33d'],[6,62,'#8a5ad8'],[30,66,'#d9534f'],[134,64,'#e8a33d'],[46,62,'#3b8fd8']].forEach(h=>house(...h));
function tree(a,b){R(a+3,b+6,2,3,'#6b4423');R(a+1,b,5,7,'#2e8b3a');R(a,b+1,7,5,'#2e8b3a');R(a+2,b+1,2,2,'#58c25a')}
[[36,30],[4,34],[62,6],[62,28],[90,30],[150,32],[3,86],[24,82],[62,84],[90,84],[150,84],[88,58],[140,4],[112,34],[58,72]].forEach(t=>tree(...t));
function station(s){
  R(s.x-1,s.y-1,s.w+2,s.h+2,'#1a1226');R(s.x,s.y,s.w,s.h,s.col);R(s.x,s.y,s.w,4,'rgba(255,255,255,.3)');
  R(s.x+2,s.y+6,s.w-4,s.h-9,'rgba(0,0,0,.18)');
  // recycle sign
  const cx=s.x+Math.floor(s.w/2)-3,cy=s.y+7;R(cx,cy,7,7,'#fff');R(cx+1,cy+1,5,5,'#2fae4a');R(cx+2,cy+2,3,3,'#fff');R(cx+3,cy+3,1,1,'#2fae4a');
  R(s.x+s.w/2-2,s.y+s.h-3,4,3,'#1a1226');
}
STATIONS.forEach(station);
// stations as clickable overlays
const map=document.getElementById('map'),tip=document.getElementById('tip');
STATIONS.forEach(s=>{
  const b=document.createElement('button');b.className='st';
  b.style.cssText=`left:${s.x/1.6}%;top:${s.y/.96}%;width:${s.w/1.6}%;height:${s.h/.96}%`;
  b.setAttribute('aria-label',s.name+': show accepted items');
  b.innerHTML='<span class="mk">!</span>';
  const show=()=>{
    tip.innerHTML=`<b>${s.name}</b><i>Accepts:</i> ${s.acc}<br><i>Reused as:</i> ${s.use}`;
    const cx=Math.min(78,Math.max(22,(s.x+s.w/2)/1.6));tip.style.left=cx+'%';
    if(s.up){tip.style.top='auto';tip.style.bottom=((96-s.y)/.96+4)+'%'}
    else{tip.style.bottom='auto';tip.style.top=((s.y+s.h)/.96+3)+'%'}
    tip.classList.add('show');
  };
  b.addEventListener('mouseenter',show);b.addEventListener('focus',show);
  b.addEventListener('click',e=>{e.stopPropagation();show()});
  b.addEventListener('mouseleave',()=>tip.classList.remove('show'));
  b.addEventListener('blur',()=>tip.classList.remove('show'));
  map.appendChild(b);
});
map.addEventListener('click',()=>tip.classList.remove('show'));
