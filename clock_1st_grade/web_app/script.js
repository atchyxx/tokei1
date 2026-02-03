// 単純な時計クイズロジック（5分刻み）
const svg = document.getElementById('clock');
const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const targetTimeEl = document.getElementById('targetTime');
const randomBtn = document.getElementById('randomBtn');
const checkBtn = document.getElementById('checkBtn');
const resetBtn = document.getElementById('resetBtn');
const feedback = document.getElementById('feedback');

let target = {h:3,m:0};
let dragging = null;
let center = {x:0,y:0};
// external audio (optional): will try to load from known paths
let externalSuccessAudio = null;

function degToRad(d){return d*Math.PI/180}
function getAngle(px,py){ // relative to center (0,0), 0 at 12 o'clock, clockwise
  const ang = Math.atan2(px, -py) * 180 / Math.PI; // swap to make 0 at top
  return (ang+360)%360;
}

function setHandsFromHM(h,m){
  const minuteAngle = m * 6; // 360/60
  const hourAngle = (h%12)*30 + m*0.5; // 360/12 + progress
  minuteHand.setAttribute('transform', `rotate(${minuteAngle})`);
  hourHand.setAttribute('transform', `rotate(${hourAngle})`);
}

function angleToHM(hourAngle, minuteAngle){
  const m = Math.round(minuteAngle/6) % 60;
  const h = Math.floor((hourAngle%360)/30) % 12;
  return {h: h===0?12:h, m};
}

function updateCenter(){
  const bbox = document.getElementById('hands').getBoundingClientRect();
  // center in screen coords
  center = {x: bbox.left + bbox.width/2, y: bbox.top + bbox.height/2};
}

function pointerDown(e){
  e.preventDefault();
  updateCenter();
  dragging = e.target.id === 'hourHand' ? 'hour' : (e.target.id === 'minuteHand' ? 'minute' : null);
}
function pointerMove(e){
  if(!dragging) return;
  const px = (e.clientX || e.touches?.[0]?.clientX) - center.x;
  const py = (e.clientY || e.touches?.[0]?.clientY) - center.y;
  const ang = getAngle(px,py);
  if(dragging==='minute'){
    // snap minute to nearest 5-minute increment while dragging
    const m = (Math.round((ang/6)/5)*5) % 60;
    const hourTransform = hourHand.getAttribute('transform');
    const hourAngle = hourTransform ? Number(hourTransform.replace(/rotate\(([-0-9.]+)\)/,'$1')) : 0;
    // derive hour index from current hourAngle (1-12)
    let h = Math.floor((hourAngle%360)/30);
    h = h===0?12:h;
    setHandsFromHM(h, m);
  } else if(dragging==='hour'){
    // allow fine-grained hour hand movement visually
    const hourAngle = ang; // use directly
    hourHand.setAttribute('transform', `rotate(${hourAngle})`);
  }
}
function pointerUp(){ dragging = null; }

// イベント
hourHand.addEventListener('pointerdown', pointerDown);
minuteHand.addEventListener('pointerdown', pointerDown);
window.addEventListener('pointermove', pointerMove);
window.addEventListener('pointerup', pointerUp);

// 出題（5分刻み）
function setRandomTarget(){
  const h = Math.floor(Math.random()*12)+1; // 1-12
  const m = Math.floor(Math.random()*12)*5; // 0,5,...55
  target = {h,m};
  targetTimeEl.textContent = `${h}時${m.toString().padStart(2,'0')}分`;
  feedback.textContent = '';
  // reset hands to 12:00 start
  setHandsFromHM(12,0);
}

randomBtn.addEventListener('click', setRandomTarget);

// 判定
function getCurrentHM(){
  const hourTransform = hourHand.getAttribute('transform') || 'rotate(0)';
  const minuteTransform = minuteHand.getAttribute('transform') || 'rotate(0)';
  const hourAngle = Number(hourTransform.replace(/rotate\(([-0-9.]+)\)/,'$1'));
  const minuteAngle = Number(minuteTransform.replace(/rotate\(([-0-9.]+)\)/,'$1'));
  const m = Math.round(minuteAngle/6) % 60;
  // derive hour taking into account minute progress
  let h = Math.floor((hourAngle%360)/30);
  h = h===0?12:h;
  return {h,m};
}

checkBtn.addEventListener('click', ()=>{
  const current = getCurrentHM();
  if(current.h===target.h && current.m===target.m){
    feedback.textContent = 'せいかい！';
    feedback.style.color = 'green';
    // visual celebration
    celebrate();
    speak(`${current.h}時${String(current.m).padStart(2,'0')}分。せいかいです。`);
  } else {
    feedback.textContent = `ちがいます。あなた: ${current.h}時${String(current.m).padStart(2,'0')}分`;
    feedback.style.color = 'crimson';
    speak(`ちがいます。あなたは${current.h}時${String(current.m).padStart(2,'0')}分と読みました`);
  }
});

// 読み上げボタン
const speakBtn = document.getElementById('speakBtn');
speakBtn.addEventListener('click', ()=>{
  const t = target;
  if(t) speak(`出題は ${t.h}時${String(t.m).padStart(2,'0')}分 です`);
});

// simple speech helper
function speak(text){
  if(!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  // lower rate for clarity with children
  u.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// celebrate visual + confetti
function celebrate(){
  // clock pop
  svg.classList.add('celebrate');
  setTimeout(()=> svg.classList.remove('celebrate'),500);
  // confetti
  const container = document.getElementById('confetti-container');
  if(!container) return;
  // create pieces
  const colors = ['#ff4d6d','#ffd24d','#5ce0a1','#6fb3ff','#d47bff'];
  const pieces = 24;
  const rect = svg.getBoundingClientRect();
  for(let i=0;i<pieces;i++){
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    const left = (Math.random()*60)+20; // percent-ish within card
    el.style.left = `${left}%`;
    el.style.top = `0px`;
    el.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`;
    // random delay
    el.style.animationDelay = `${Math.random()*200}ms`;
    container.appendChild(el);
    // remove after animation
    setTimeout(()=> el.remove(),1400);
  }
  // play success sound
  playSuccessSound();
}

// short success sound using WebAudio (no external file required)
function playSuccessSound(){
  try{
    // if an external audio file was loaded, use it
    if(externalSuccessAudio){
      try{ externalSuccessAudio.currentTime = 0; externalSuccessAudio.play(); return; }catch(e){}
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if(!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, now);
    // two quick tones: major third arpeggio feel
    const freqs = [880, 1100];
    freqs.forEach((f, i)=>{
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, now + i*0.06);
      o.connect(gain);
      o.start(now + i*0.06);
      o.stop(now + i*0.06 + 0.28);
    });
    // envelope
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    // close context after sound
    setTimeout(()=>{ if(ctx.close) ctx.close(); }, 700);
  }catch(e){
    // fallback: try HTMLAudio if available (no external file included)
    console.warn('Audio unavailable', e);
  }
}

// try to load an external short effect file (priority). looks for files in the following order:
// web_app/sounds/success.mp3, web_app/sounds/success.wav, web_app/success.mp3, web_app/success.wav
async function loadExternalSuccess(){
  const candidates = ['sounds/success.mp3','sounds/success.wav','success.mp3','success.wav'];
  for(const p of candidates){
    try{
      const a = new Audio(p);
      // attempt to load and wait briefly for canplaythrough
      await new Promise((resolve,reject)=>{
        const onOk = ()=>{ cleanup(); resolve(); };
        const onErr = ()=>{ cleanup(); reject(); };
        const timeout = setTimeout(()=>{ cleanup(); reject(new Error('timeout')); }, 900);
        function cleanup(){ clearTimeout(timeout); a.removeEventListener('canplaythrough', onOk); a.removeEventListener('error', onErr); }
        a.addEventListener('canplaythrough', onOk, {once:true});
        a.addEventListener('error', onErr, {once:true});
        try{ a.load(); }catch(e){ onErr(); }
      });
      externalSuccessAudio = a;
      console.log('Loaded external success audio:', p);
      break;
    }catch(e){
      // try next
    }
  }
}
// start trying to load external asset (non-blocking)
loadExternalSuccess();

// snap hands on pointerup
function snapCurrent(){
  const current = getCurrentHM();
  setHandsFromHM(current.h, current.m);
}

window.addEventListener('pointerup', ()=>{ if(dragging) snapCurrent(); dragging=null; });

resetBtn.addEventListener('click', ()=>{ setHandsFromHM(12,0); feedback.textContent=''; });

// 初期化
// 目盛を描画
(function drawMarks(){
  const marks = document.getElementById('marks');
  for(let i=0;i<60;i++){
    const ang = i*6; // degrees
    const len = (i%5===0)?8:4;
    const r1 = 82;
    const r2 = 82 - len;
    const x1 = 100 + r1*Math.sin(degToRad(ang));
    const y1 = 100 - r1*Math.cos(degToRad(ang));
    const x2 = 100 + r2*Math.sin(degToRad(ang));
    const y2 = 100 - r2*Math.cos(degToRad(ang));
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',x1);line.setAttribute('y1',y1);
    line.setAttribute('x2',x2);line.setAttribute('y2',y2);
    line.setAttribute('stroke','#222');line.setAttribute('stroke-width', (i%5===0)?2:1);
    marks.appendChild(line);
  }
})();

setHandsFromHM(12,0);
setRandomTarget();
