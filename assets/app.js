/* ============ MANE — shared site script ============ */

/* ---- nav: scroll state + mobile burger ---- */
(function(){
  const nav=document.getElementById('nav');
  const burger=document.getElementById('burger');
  const navlinks=document.getElementById('navlinks');
  if(nav){window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>40));
    nav.classList.toggle('scrolled',window.scrollY>40);}
  if(burger&&navlinks){
    burger.addEventListener('click',()=>{burger.classList.toggle('open');navlinks.classList.toggle('open')});
    navlinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{burger.classList.remove('open');navlinks.classList.remove('open')}));
  }
})();

/* ---- scroll reveal ---- */
(function(){
  const els=document.querySelectorAll('.reveal');
  if(!els.length)return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
  els.forEach(el=>io.observe(el));
})();

/* ---- helpers shared across pages ---- */
function goBook(){
  const b=document.getElementById('book');
  if(b){b.scrollIntoView({behavior:'smooth'});}
  else{window.location.href='book.html';}
}
function setErr(id,bad){const el=document.getElementById(id);if(el)el.classList.toggle('err',bad);return !bad}

/* quickBook works from any page:
   - on the Book page it preselects the option
   - on other pages it jumps to book.html carrying the choice in the URL */
function quickBook(svc,barber){
  const onBook=document.getElementById('dayStrip');
  if(onBook){
    if(svc)document.querySelectorAll('.panel[data-p="1"] .opt').forEach(o=>{if(o.dataset.val===svc)o.click()});
    if(barber)document.querySelectorAll('.panel[data-p="2"] .opt').forEach(o=>{if(o.dataset.val===barber)o.click()});
    goBook();
  }else{
    const p=new URLSearchParams();
    if(svc)p.set('service',svc);
    if(barber)p.set('barber',barber);
    window.location.href='book.html'+(p.toString()?'?'+p.toString():'');
  }
}

/* ---- booking state (persisted) ---- */
const state={service:null,price:0,barber:null,day:null,dayKey:null,time:null};
let APPTS=[];try{APPTS=JSON.parse(localStorage.getItem('mane_appts')||'[]')}catch(e){APPTS=[]}
function saveAppts(){try{localStorage.setItem('mane_appts',JSON.stringify(APPTS))}catch(e){}}

const PRICES={'The Studio Cut':60,'Hot Towel Shave':48,'Beard Architecture':38,'The Full Sitting':110};
const dows=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const allTimes=['10:00','11:15','12:30','2:00','3:15','4:30','5:30'];
const today=new Date('2026-06-27');

function pick(el,key){
  el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');state[key]=el.dataset.val;
  if(key==='service')state.price=+el.dataset.price||PRICES[el.dataset.val]||0;
}
function go(step){
  if(step===4&&!state.service){alert('Please choose a service first.');return}
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('show'));
  const panel=document.querySelector('.panel[data-p="'+step+'"]');
  if(panel)panel.classList.add('show');
  document.querySelectorAll('.dots .d').forEach(d=>{const n=+d.dataset.s;d.classList.toggle('active',n===step);d.classList.toggle('done',n<step)});
  const b=document.getElementById('book');if(b)b.scrollIntoView({behavior:'smooth'});
}
function seeded(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
function renderTimes(){
  const tw=document.getElementById('times');if(!tw)return;
  tw.innerHTML='';state.time=null;
  const h=seeded(state.dayKey||'x');
  allTimes.forEach((t,i)=>{
    const el=document.createElement('div');el.className='time';el.textContent=t;
    const taken=((h>>i)&1)&&(i%3===1) || APPTS.some(a=>a.dayKey===state.dayKey&&a.time===t&&(state.barber==='No Preference'||!state.barber||a.barber===state.barber));
    if(taken){el.classList.add('taken');el.title='Booked'}
    else el.onclick=()=>{tw.querySelectorAll('.time').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');state.time=t};
    tw.appendChild(el);
  });
}
function buildDays(){
  const strip=document.getElementById('dayStrip');if(!strip)return;
  for(let i=0;i<14;i++){
    const d=new Date(today);d.setDate(today.getDate()+i);
    if(d.getDay()===1||d.getDay()===2)continue; // Wed–Sun only
    const key=d.toISOString().slice(0,10);
    const el=document.createElement('div');el.className='day';
    el.innerHTML='<div class="dow">'+dows[d.getDay()]+'</div><div class="dnum">'+d.getDate()+'</div>';
    el.onclick=()=>{strip.querySelectorAll('.day').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');
      state.day=dows[d.getDay()]+' '+d.toLocaleString('en',{month:'short'})+' '+d.getDate();state.dayKey=key;renderTimes()};
    strip.appendChild(el);
  }
}
function confirmBooking(){
  const name=(document.getElementById('cName').value||'').trim();
  const phone=(document.getElementById('cPhone').value||'').trim();
  const email=(document.getElementById('cEmail').value||'').trim();
  let ok=true;
  ok=setErr('f-name',name.length<2)&&ok;
  ok=setErr('f-phone',phone.replace(/\D/g,'').length<7)&&ok;
  ok=setErr('f-email',!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))&&ok;
  if(!ok)return;
  if(!state.service){alert('Please choose a service first.');return go(1)}
  if(!state.day||!state.time){alert('Please pick a day and time.');return go(3)}
  APPTS.push({service:state.service,price:state.price,barber:state.barber||'First available',day:state.day,dayKey:state.dayKey,time:state.time,name});
  saveAppts();
  document.getElementById('summary').innerHTML=
    '<div><span>Name</span><span>'+name+'</span></div>'+
    '<div><span>Service</span><span>'+state.service+'</span></div>'+
    '<div><span>Barber</span><span>'+(state.barber||'First available')+'</span></div>'+
    '<div><span>When</span><span>'+state.day+' · '+state.time+'</span></div>'+
    '<div><span>Total</span><span>$'+state.price+'</span></div>';
  renderAppts();go(5);
}
function resetBooking(){
  Object.assign(state,{service:null,price:0,barber:null,day:null,dayKey:null,time:null});
  document.querySelectorAll('.opt,.day,.time').forEach(o=>o.classList.remove('sel'));
  document.querySelectorAll('#book input,#book textarea').forEach(i=>i.value='');
  document.querySelectorAll('.field').forEach(f=>f.classList.remove('err'));
  const tw=document.getElementById('times');if(tw)tw.innerHTML='';
  go(1);
}
function renderAppts(){
  const box=document.getElementById('apptsBox'),list=document.getElementById('apptList');
  if(!box||!list)return;
  if(!APPTS.length){box.style.display='none';return}
  box.style.display='block';list.innerHTML='';
  APPTS.forEach((a,idx)=>{
    const c=document.createElement('div');c.className='appt-card';
    c.innerHTML='<div class="ad"><b>'+a.service+'</b><small>'+a.barber+' · for '+a.name+'</small></div>'+
      '<div style="display:flex;align-items:center;gap:10px"><span class="when">'+a.day+'<br>'+a.time+'</span>'+
      '<button class="cancel" title="Cancel" onclick="cancelAppt('+idx+')">✕</button></div>';
    list.appendChild(c);
  });
}
function cancelAppt(i){APPTS.splice(i,1);saveAppts();renderAppts()}

/* preselect service/barber passed in the URL from another page */
function initBookingFromParams(){
  if(!document.getElementById('dayStrip'))return;
  const p=new URLSearchParams(location.search);
  const svc=p.get('service'),barber=p.get('barber');
  if(svc)document.querySelectorAll('.panel[data-p="1"] .opt').forEach(o=>{if(o.dataset.val===svc)o.click()});
  if(barber)document.querySelectorAll('.panel[data-p="2"] .opt').forEach(o=>{if(o.dataset.val===barber)o.click()});
}

/* ---- contact form ---- */
(function(){
  const cform=document.getElementById('cform');if(!cform)return;
  cform.addEventListener('submit',e=>{
    e.preventDefault();
    const name=(document.getElementById('cfName').value||'').trim();
    const email=(document.getElementById('cfEmail').value||'').trim();
    const msg=(document.getElementById('cfMsg').value||'').trim();
    let ok=true;
    ok=setErr('cf-name',name.length<2)&&ok;
    ok=setErr('cf-email',!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))&&ok;
    ok=setErr('cf-msg',msg.length<4)&&ok;
    if(!ok)return;
    cform.style.display='none';
    document.getElementById('cformSuccess').classList.add('show');
  });
})();

/* ---- opening hours ---- */
(function(){
  const t=document.getElementById('hoursTable');if(!t)return;
  const hours=[['Sunday','10am – 4pm'],['Monday','Closed'],['Tuesday','Closed'],['Wednesday','10am – 6pm'],['Thursday','10am – 7pm'],['Friday','10am – 7pm'],['Saturday','10am – 6pm']];
  const todayIdx=today.getDay();
  t.innerHTML=hours.map((h,i)=>'<div class="hours-row'+(i===todayIdx?' today':'')+'"><span class="d">'+h[0]+(i===todayIdx?' · Today':'')+'</span><span>'+h[1]+'</span></div>').join('');
})();

/* ---- boot booking page ---- */
buildDays();
renderAppts();
initBookingFromParams();
