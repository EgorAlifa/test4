/* eslint-disable */
var html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#000; overflow:hidden; user-select:none; font-family:'Courier New',monospace; width:100vw; height:100vh; }
canvas { display:block; position:absolute; top:0; left:0; }
#hud {
  position:fixed; top:0; left:0; right:0; z-index:10;
  display:flex; justify-content:space-between;
  padding:10px 18px; font-size:13px; letter-spacing:2px;
  color:#ff4455; text-transform:uppercase; pointer-events:none;
  text-shadow:0 0 6px #ff4455;
}
#aim {
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
  width:20px; height:20px; z-index:10; pointer-events:none;
}
#aim::before { content:''; position:absolute; top:9px; left:0; width:20px; height:2px; background:rgba(255,255,255,0.8); }
#aim::after  { content:''; position:absolute; left:9px; top:0; width:2px; height:20px; background:rgba(255,255,255,0.8); }
#flash { position:fixed; inset:0; opacity:0; z-index:9; pointer-events:none; }
#overlay {
  position:fixed; inset:0; background:rgba(0,0,0,0.92);
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:14px; z-index:20;
}
.t    { font-size:36px; font-weight:900; letter-spacing:6px; color:#ff4455;
        text-shadow:0 0 10px #ff4455, 0 0 35px #ff4455; }
.win  { color:#00ff88; text-shadow:0 0 10px #00ff88, 0 0 35px #00ff88; }
.dead { color:#ff8800; text-shadow:0 0 10px #ff8800; }
.sc   { font-size:20px; color:#fff; letter-spacing:2px; }
.h    { font-size:12px; color:#3a3a55; letter-spacing:2px; margin-top:6px; }
#reload-label {
  position:fixed; bottom:40px; left:50%; transform:translateX(-50%);
  font-size:12px; letter-spacing:3px; color:#ff8800; z-index:10;
  opacity:0; transition:opacity 0.2s; pointer-events:none;
}
#rmb-hint {
  position:fixed; bottom:10px; right:14px; z-index:10;
  font-size:10px; letter-spacing:2px; color:#2a2a40; pointer-events:none;
}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="hud">
  <span>HP &nbsp;<span id="hp">100</span></span>
  <span>KILLS &nbsp;<span id="kl">0</span> / <span id="total">5</span></span>
  <span>AMMO &nbsp;<span id="am">30</span></span>
</div>
<div id="aim"></div>
<div id="flash"></div>
<div id="reload-label">ПЕРЕЗАРЯДКА...</div>
<div id="rmb-hint">ПКМ / ПРОБЕЛ — ОГОНЬ</div>
<div id="overlay">
  <div class="t" id="ot">CS-STYLE</div>
  <div class="sc" id="ov-sc" style="display:none"></div>
  <div class="h">WASD / ↑↓ &mdash; ДВИЖЕНИЕ</div>
  <div class="h">← → &mdash; ПОВОРОТ</div>
  <div class="h">ПКМ / ПРОБЕЛ &mdash; ОГОНЬ &nbsp;|&nbsp; R &mdash; ПЕРЕЗАРЯДКА</div>
  <div class="h" style="margin-top:14px;color:#556;letter-spacing:1px;">КЛИК ИЛИ ПРОБЕЛ — НАЧАТЬ</div>
</div>
<script>
var c   = document.getElementById('c');
var ctx = c.getContext('2d');
var W = 1, H = 1;

function resize() { W=window.innerWidth; H=window.innerHeight; c.width=W; c.height=H; }
window.addEventListener('resize', resize);
resize();

/* ---- Web Audio ---- */
var audio;
try { audio = new (window.AudioContext||window.webkitAudioContext)(); } catch(e) {}

function resumeAudio() { if (audio && audio.state==='suspended') audio.resume(); }

function sndShoot() {
  if (!audio) return;
  var buf = audio.createBuffer(1, Math.round(audio.sampleRate*0.07), audio.sampleRate);
  var d = buf.getChannelData(0);
  for (var i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,0.4)*0.35;
  var src=audio.createBufferSource(); src.buffer=buf;
  var f=audio.createBiquadFilter(); f.type='highpass'; f.frequency.value=1800;
  src.connect(f); f.connect(audio.destination); src.start();
}

function sndHit() {
  if (!audio) return;
  var o=audio.createOscillator(), g=audio.createGain();
  o.type='triangle'; o.frequency.setValueAtTime(480,audio.currentTime);
  o.frequency.exponentialRampToValueAtTime(180,audio.currentTime+0.12);
  g.gain.setValueAtTime(0.28,audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.12);
  o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime+0.13);
}

function sndKill() {
  if (!audio) return;
  var buf=audio.createBuffer(1,Math.round(audio.sampleRate*0.28),audio.sampleRate);
  var d=buf.getChannelData(0);
  for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,0.45)*0.4;
  var src=audio.createBufferSource(); src.buffer=buf;
  var f=audio.createBiquadFilter(); f.type='lowpass'; f.frequency.value=500;
  src.connect(f); f.connect(audio.destination); src.start();
}

function sndPlayerHit() {
  if (!audio) return;
  var o=audio.createOscillator(), g=audio.createGain();
  o.type='sawtooth'; o.frequency.setValueAtTime(90,audio.currentTime);
  o.frequency.exponentialRampToValueAtTime(40,audio.currentTime+0.18);
  g.gain.setValueAtTime(0.5,audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.18);
  o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime+0.19);
}

function sndReload() {
  if (!audio) return;
  var o=audio.createOscillator(), g=audio.createGain();
  o.type='square'; o.frequency.setValueAtTime(220,audio.currentTime);
  o.frequency.linearRampToValueAtTime(330,audio.currentTime+0.08);
  g.gain.setValueAtTime(0.15,audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.12);
  o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime+0.13);
}

/* ---- map ---- */
var MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,0,1,0,0,1,0,0,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,0,0,1,0,0,1,0,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,0,0,0,0,0,0,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
var MH=MAP.length, MW=MAP[0].length;

var hpEl      = document.getElementById('hp');
var klEl      = document.getElementById('kl');
var amEl      = document.getElementById('am');
var totalEl   = document.getElementById('total');
var ov        = document.getElementById('overlay');
var otEl      = document.getElementById('ot');
var ovSc      = document.getElementById('ov-sc');
var flashEl   = document.getElementById('flash');
var reloadLbl = document.getElementById('reload-label');

var player, keys, alive, animId, bullets, flashT, flashBg;

var ENEMY_STARTS = [
  {x:6.5,y:2.5},{x:10.5,y:5.5},{x:3.5,y:8.5},
  {x:13.5,y:3.5},{x:8.5,y:10.5}
];

function canMove(x,y) {
  var mx=Math.floor(x),my=Math.floor(y);
  if(my<0||my>=MH||mx<0||mx>=MW) return false;
  return MAP[my][mx]===0;
}
function d2(ax,ay,bx,by){ return (ax-bx)*(ax-bx)+(ay-by)*(ay-by); }
function los(ax,ay,bx,by){
  var dx=bx-ax,dy=by-ay,d=Math.sqrt(dx*dx+dy*dy),steps=Math.ceil(d*5);
  for(var i=1;i<steps;i++){
    var tx=ax+dx*i/steps,ty=ay+dy*i/steps;
    if(MAP[Math.floor(ty)]&&MAP[Math.floor(ty)][Math.floor(tx)]!==0) return false;
  }
  return true;
}

function spawnEnemies() {
  return ENEMY_STARTS.map(function(p,i){
    return {x:p.x,y:p.y,angle:i*1.2,hp:100,alive:true,alert:false,
            shootT:60+i*20,patrolT:0,patrolDir:i%2?1:-1};
  });
}

function init() {
  player={x:1.5,y:1.5,angle:0,hp:100,kills:0,ammo:30,maxAmmo:30,reloadT:0};
  bullets=[]; flashT=0; flashBg='rgba(255,220,100,0.25)';
  hpEl.textContent=100; klEl.textContent=0; amEl.textContent=30;
  totalEl.textContent=ENEMY_STARTS.length;
  player.enemies=spawnEnemies();
  reloadLbl.style.opacity='0';
}

function shoot() {
  if(player.ammo<=0||player.reloadT>0) return;
  player.ammo--; amEl.textContent=player.ammo;
  var bx=player.x+Math.cos(player.angle)*0.4;
  var by=player.y+Math.sin(player.angle)*0.4;
  bullets.push({x:bx,y:by,dx:Math.cos(player.angle)*0.35,dy:Math.sin(player.angle)*0.35,enemy:false,life:55});
  flashBg='rgba(255,220,100,0.25)'; flashT=3;
  sndShoot();
}

function update() {
  if(!alive) return;
  if(player.reloadT>0){
    player.reloadT--;
    if(player.reloadT===0){ player.ammo=player.maxAmmo; amEl.textContent=player.ammo; reloadLbl.style.opacity='0'; }
  }
  var spd=0.065,rot=0.058;
  if(keys['ArrowLeft']||keys['KeyA'])  player.angle-=rot;
  if(keys['ArrowRight']||keys['KeyD']) player.angle+=rot;
  var fw=(keys['ArrowUp']||keys['KeyW'])?spd:0;
  var bk=(keys['ArrowDown']||keys['KeyS'])?spd:0;
  var nx=player.x+Math.cos(player.angle)*(fw-bk);
  var ny=player.y+Math.sin(player.angle)*(fw-bk);
  if(canMove(nx,player.y)) player.x=nx;
  if(canMove(player.x,ny)) player.y=ny;
  if(keys['KeyR']&&player.ammo<player.maxAmmo&&player.reloadT===0){
    player.reloadT=90; reloadLbl.style.opacity='1'; sndReload();
  }

  player.enemies.forEach(function(e){
    if(!e.alive) return;
    var dx=player.x-e.x,dy=player.y-e.y,d=Math.sqrt(dx*dx+dy*dy);
    var sight=d<13&&los(e.x,e.y,player.x,player.y);
    if(sight){
      e.alert=true; e.angle=Math.atan2(dy,dx);
      var ms=0.028;
      if(canMove(e.x+Math.cos(e.angle)*ms,e.y)) e.x+=Math.cos(e.angle)*ms;
      if(canMove(e.x,e.y+Math.sin(e.angle)*ms)) e.y+=Math.sin(e.angle)*ms;
      e.shootT--;
      if(e.shootT<=0&&d>1.2){
        e.shootT=70+Math.round(Math.random()*40);
        var sp=(Math.random()-0.5)*0.18;
        bullets.push({x:e.x,y:e.y,dx:Math.cos(e.angle+sp)*0.28,dy:Math.sin(e.angle+sp)*0.28,enemy:true,life:65});
      }
    } else {
      e.patrolT++;
      if(e.patrolT%100<50){
        var pm=0.022,px2=e.x+Math.cos(e.patrolDir)*pm,py2=e.y+Math.sin(e.patrolDir)*pm;
        if(canMove(px2,py2)){e.x=px2;e.y=py2;}else e.patrolDir=-e.patrolDir;
      }
    }
  });

  bullets.forEach(function(b){
    b.x+=b.dx; b.y+=b.dy; b.life--;
    if(b.life<=0) return;
    if(MAP[Math.floor(b.y)]&&MAP[Math.floor(b.y)][Math.floor(b.x)]!==0){b.life=0;return;}
    if(!b.enemy){
      player.enemies.forEach(function(e){
        if(!e.alive||d2(b.x,b.y,e.x,e.y)>0.22) return;
        e.hp-=35; b.life=0; sndHit();
        if(e.hp<=0){e.alive=false;player.kills++;klEl.textContent=player.kills;sndKill();}
      });
    } else {
      if(d2(b.x,b.y,player.x,player.y)<0.18){
        b.life=0; player.hp-=22; hpEl.textContent=Math.max(0,player.hp);
        flashBg='rgba(255,0,0,0.5)'; flashT=7; sndPlayerHit();
        if(player.hp<=0){alive=false;cancelAnimationFrame(animId);gameOver();}
      }
    }
  });
  bullets=bullets.filter(function(b){return b.life>0;});

  if(flashT>0){flashT--; flashEl.style.background=flashBg; flashEl.style.opacity=(flashT/7)*0.65+'';}
  else flashEl.style.opacity='0';

  if(player.enemies.every(function(e){return !e.alive;})){alive=false;cancelAnimationFrame(animId);gameWin();}
}

/* ---- raycaster ---- */
var zBuf=[];
function shade(r,g,b,s){ return 'rgb('+Math.round(r*s)+','+Math.round(g*s)+','+Math.round(b*s)+')'; }

function render() {
  var numR=Math.max(120,Math.round(W*0.65));
  var FOV=Math.PI/2.4;

  ctx.fillStyle='#111'; ctx.fillRect(0,0,W,H/2);
  ctx.fillStyle='#252525'; ctx.fillRect(0,H/2,W,H/2);

  zBuf.length=numR;
  for(var i=0;i<numR;i++){
    var ra=player.angle-FOV/2+(i/numR)*FOV;
    var cos=Math.cos(ra),sin=Math.sin(ra);
    var mx=Math.floor(player.x),my=Math.floor(player.y);
    var ddx=Math.abs(1/cos),ddy=Math.abs(1/sin);
    var sx=cos>0?1:-1,sy=sin>0?1:-1;
    var sdx=cos>0?(mx+1-player.x)*ddx:(player.x-mx)*ddx;
    var sdy=sin>0?(my+1-player.y)*ddy:(player.y-my)*ddy;
    var side=0,hit=false,guard=25;
    while(!hit&&guard-->0){
      if(sdx<sdy){sdx+=ddx;mx+=sx;side=0;}else{sdy+=ddy;my+=sy;side=1;}
      if(my>=0&&my<MH&&mx>=0&&mx<MW&&MAP[my][mx]>0) hit=true;
    }
    var dist=Math.max(0.1,(side===0?sdx-ddx:sdy-ddy)*Math.cos(ra-player.angle));
    zBuf[i]=dist;
    var sh=Math.min(1,Math.max(0.06,1-dist/14))*(side===0?1:0.6);
    var slH=Math.min(H*3.5,H/dist),top=(H-slH)/2,sw=W/numR+1;
    ctx.fillStyle=shade(145,28,28,sh);
    ctx.fillRect(i*(W/numR),top,sw,slH);
  }

  /* sprites */
  var vis=player.enemies.filter(function(e){return e.alive;})
    .map(function(e){return{e:e,dist:d2(player.x,player.y,e.x,e.y)};})
    .sort(function(a,b){return b.dist-a.dist;});

  vis.forEach(function(obj){
    var e=obj.e;
    var dx=e.x-player.x,dy=e.y-player.y,d=Math.sqrt(dx*dx+dy*dy);
    if(d<0.35) return;
    var sa=Math.atan2(dy,dx)-player.angle;
    while(sa< -Math.PI) sa+=Math.PI*2;
    while(sa>  Math.PI) sa-=Math.PI*2;
    if(Math.abs(sa)>FOV*0.65) return;
    var sx=(0.5+sa/FOV)*W,sH=Math.min(H*2.2,H/d),sW=sH*0.55;
    var sTop=(H-sH)/2,sLeft=sx-sW/2;
    var c0=Math.max(0,Math.floor(sLeft/(W/numR)));
    var c1=Math.min(numR-1,Math.floor((sLeft+sW)/(W/numR)));
    var shown=false;
    for(var ci=c0;ci<=c1;ci++){if(zBuf[ci]>d){shown=true;break;}}
    if(!shown) return;
    ctx.globalAlpha=Math.min(1,Math.max(0.1,1-(d-0.5)/10));
    ctx.fillStyle=e.alert?'#006622':'#004411';
    ctx.fillRect(sLeft,sTop+sH*0.22,sW,sH*0.6);
    ctx.fillStyle='#c8a070';
    ctx.beginPath(); ctx.arc(sx,sTop+sH*0.14,sW*0.28,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222';
    ctx.fillRect(sLeft+sW*0.08,sTop+sH*0.76,sW*0.35,sH*0.24);
    ctx.fillRect(sLeft+sW*0.57,sTop+sH*0.76,sW*0.35,sH*0.24);
    ctx.fillStyle='#555';
    ctx.fillRect(sLeft+sW*0.62,sTop+sH*0.38,sW*0.6,sH*0.1);
    if(e.hp<100){
      ctx.fillStyle='#400'; ctx.fillRect(sLeft,sTop-9,sW,5);
      ctx.fillStyle='#0c0'; ctx.fillRect(sLeft,sTop-9,sW*(e.hp/100),5);
    }
    ctx.globalAlpha=1;
  });

  /* weapon */
  var gW=W*0.2,gH=H*0.32,gX=W*0.62,gY=H-gH+Math.sin(Date.now()*0.0025)*3;
  ctx.fillStyle='#1c1c1c'; ctx.fillRect(gX,gY+gH*0.25,gW,gH*0.48);
  ctx.fillStyle='#2a2a2a'; ctx.fillRect(gX+gW*0.28,gY,gW*0.13,gH*0.78);
  ctx.fillStyle='#333';    ctx.fillRect(gX+gW*0.08,gY+gH*0.28,gW*0.82,gH*0.14);
  ctx.fillStyle='#111';    ctx.fillRect(gX,gY+gH*0.15,gW*0.12,gH*0.12);
}

function gameOver(){
  otEl.className='t dead'; otEl.textContent='УБИТ';
  ovSc.style.display='block'; ovSc.textContent='УБИЙСТВ: '+player.kills;
  ov.style.display='flex';
}
function gameWin(){
  otEl.className='t win'; otEl.textContent='ПОБЕДА!';
  ovSc.style.display='block'; ovSc.textContent='УБИЙСТВ: '+player.kills;
  ov.style.display='flex';
}

function loop(){ update(); render(); if(alive) animId=requestAnimationFrame(loop); }

function start(){
  resumeAudio();
  otEl.className='t'; otEl.textContent='CS-STYLE';
  ovSc.style.display='none';
  ov.style.display='none';
  init(); alive=true;
  cancelAnimationFrame(animId);
  animId=requestAnimationFrame(loop);
}

keys={};
document.addEventListener('keydown',function(e){
  keys[e.code]=true;
  if(e.code==='Space'){
    e.preventDefault();
    if(!alive){start();return;}
    shoot();
  }
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code)>-1) e.preventDefault();
});
document.addEventListener('keyup',function(e){keys[e.code]=false;});

/* right-click to shoot */
document.addEventListener('mousedown',function(e){
  if(e.button===2){
    e.preventDefault();
    if(!alive){start();return;}
    shoot();
  }
});
document.addEventListener('contextmenu',function(e){e.preventDefault();});

/* left-click = start if not alive */
document.addEventListener('click',function(){if(!alive) start();});
window.addEventListener('message',function(e){
  var d=e.data;
  if(d==='start'||(d&&d.type==='start')){ if(!alive) start(); }
});

ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
<\/script>
</body>
</html>`;

export default html;
