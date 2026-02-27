/* eslint-disable */
var html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  background:#000; overflow:hidden; user-select:none;
  font-family:'Courier New',monospace; width:100vw; height:100vh;
}
canvas { display:block; position:absolute; top:0; left:0; }
#hud {
  position:fixed; top:0; left:0; right:0; z-index:10;
  display:flex; justify-content:space-between;
  padding:10px 18px; font-size:13px; letter-spacing:2px;
  color:#cc44ff; text-transform:uppercase; pointer-events:none;
  text-shadow:0 0 6px #cc44ff;
}
#overlay {
  position:fixed; inset:0; background:rgba(0,0,0,0.92);
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:14px; z-index:20;
}
.t  { font-size:36px; font-weight:900; letter-spacing:6px; color:#cc44ff;
      text-shadow:0 0 10px #cc44ff, 0 0 35px #cc44ff; }
.go { color:#ff4455; text-shadow:0 0 10px #ff4455, 0 0 35px #ff4455; }
.sc { font-size:20px; color:#fff; letter-spacing:2px; }
.h  { font-size:12px; color:#3a3a55; letter-spacing:2px; margin-top:6px; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="hud">
  <span>SCORE &nbsp;<span id="sc">0</span></span>
  <span id="lv">&#9829;&#9829;&#9829;</span>
  <span>KM/H &nbsp;<span id="spd">120</span></span>
</div>
<div id="overlay">
  <div class="t" id="ot">MOTO 3D</div>
  <div class="h">← → — УПРАВЛЕНИЕ</div>
  <div class="h">ОТ ТРЕТЬЕГО ЛИЦА</div>
  <div class="h" style="margin-top:14px;color:#556;letter-spacing:1px;">КЛИК ИЛИ ПРОБЕЛ — НАЧАТЬ</div>
</div>
<script>
var c = document.getElementById('c');
var ctx = c.getContext('2d');
var W = 1, H = 1;

function resize() {
  W = window.innerWidth; H = window.innerHeight;
  c.width = W; c.height = H;
}
window.addEventListener('resize', function(){ resize(); });
resize();

var scEl  = document.getElementById('sc');
var lvEl  = document.getElementById('lv');
var spdEl = document.getElementById('spd');
var ov    = document.getElementById('overlay');
var otEl  = document.getElementById('ot');

/* game state */
var player, keys, alive, animId;
var obstacles, score, lives, speed, frame, segOff;

/* each obstacle: { lane:-1|0|1, z:0..1, color } */
var CAR_COLS = ['#e63950','#1a6dd5','#e8b84b','#7b5ea7','#00a1e8','#00cc66'];

function heart(n) { var s=''; for(var i=0;i<n;i++) s+='&#9829;'; return s; }

function init() {
  player = { lane:0, x:0, vx:0, inv:0 }; /* x in world -1..1 */
  obstacles=[]; score=0; lives=3; speed=0.018; frame=0; segOff=0;
  scEl.textContent=0; lvEl.innerHTML=heart(3); spdEl.textContent=120;
}

function spawnObstacle() {
  var lanes=[-1,0,1];
  var lane=lanes[Math.floor(Math.random()*3)];
  obstacles.push({lane:lane, z:0,
    color:CAR_COLS[Math.floor(Math.random()*CAR_COLS.length)]});
}

/* ---- PERSPECTIVE HELPERS ---- */
/* z=0 → horizon, z=1 → player position */
var HORIZON = 0.42; /* fraction of H */

function projY(z) { return HORIZON*H + z*(H - HORIZON*H - H*0.18); }

function projScale(z) { return 0.04 + z*0.96; }

/* road left/right edge at depth z */
function roadX(side, z) {
  var centerX = W/2;
  var halfW = (W*0.38) * projScale(z);
  return centerX + side * halfW;
}

function laneX(lane, z) {
  /* lane: -1, 0, 1 */
  var centerX = W/2;
  var halfW = (W*0.38) * projScale(z);
  return centerX + lane * halfW * 0.65;
}

/* ---- DRAW SCENE ---- */
function draw() {
  ctx.clearRect(0,0,W,H);

  /* sky */
  var sky = ctx.createLinearGradient(0,0,0,HORIZON*H);
  sky.addColorStop(0,'#0a001a');
  sky.addColorStop(1,'#1a0033');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,HORIZON*H);

  /* stars */
  ctx.fillStyle='rgba(255,255,255,0.5)';
  for(var s=0;s<60;s++){
    var sx=(s*137.5)%W, sy=(s*91.3)%(HORIZON*H);
    ctx.fillRect(sx,sy,1,1);
  }

  /* ground */
  var gnd = ctx.createLinearGradient(0,HORIZON*H,0,H);
  gnd.addColorStop(0,'#0c0018');
  gnd.addColorStop(1,'#000');
  ctx.fillStyle=gnd; ctx.fillRect(0,HORIZON*H,W,H-HORIZON*H);

  /* road trapezoid */
  ctx.beginPath();
  ctx.moveTo(roadX(-1,0), projY(0));
  ctx.lineTo(roadX( 1,0), projY(0));
  ctx.lineTo(roadX( 1,1), projY(1));
  ctx.lineTo(roadX(-1,1), projY(1));
  ctx.closePath();
  ctx.fillStyle='#1e1e2e'; ctx.fill();

  /* road edge lines */
  [[- 1],[1]].forEach(function(side){
    ctx.beginPath();
    ctx.moveTo(roadX(side,0),projY(0));
    ctx.lineTo(roadX(side,1),projY(1));
    ctx.strokeStyle='#cc44ff'; ctx.lineWidth=2;
    ctx.shadowColor='#cc44ff'; ctx.shadowBlur=6;
    ctx.stroke(); ctx.shadowBlur=0;
  });

  /* lane dashes */
  var segments = 20;
  for(var seg=0;seg<segments;seg++){
    var t0 = (seg/segments + segOff) % 1;
    var t1 = ((seg+0.4)/segments + segOff) % 1;
    if (t0 > t1) continue; /* skip wrap */
    [-1,1].forEach(function(side){
      ctx.beginPath();
      ctx.moveTo(laneX(side,t0), projY(t0));
      ctx.lineTo(laneX(side,t1), projY(t1));
      ctx.strokeStyle='rgba(180,100,255,0.3)';
      ctx.lineWidth=Math.max(1,(t0+t1)/2*3);
      ctx.stroke();
    });
  }

  /* obstacles (far to near) */
  var sorted = obstacles.slice().sort(function(a,b){return a.z-b.z;});
  sorted.forEach(function(o){
    var z = o.z;
    var s = projScale(z);
    var cx = laneX(o.lane, z);
    var cy = projY(z);
    var cw = W*0.07*s, ch = H*0.12*s;
    drawCar(ctx, cx-cw/2, cy-ch*0.85, cw, ch, o.color, false);
  });

  /* player moto (3rd person: camera behind) */
  var px = W/2 + player.x * W*0.3;
  var py = H - H*0.06;
  var mw = W*0.07, mh = H*0.13;
  drawMoto(ctx, px, py, mw, mh);
}

function drawCar(ctx, x, y, w, h, col, isP) {
  /* body */
  ctx.fillStyle=col;
  ctx.fillRect(x+w*0.1, y+h*0.2, w*0.8, h*0.6);
  /* roof */
  ctx.fillStyle=lighten(col,0.4);
  ctx.fillRect(x+w*0.2, y, w*0.6, h*0.35);
  /* windows */
  ctx.fillStyle='rgba(100,180,255,0.5)';
  ctx.fillRect(x+w*0.22, y+h*0.04, w*0.56, h*0.25);
  /* wheels */
  ctx.fillStyle='#111';
  ctx.fillRect(x-w*0.05, y+h*0.15, w*0.18, h*0.25);
  ctx.fillRect(x+w*0.87, y+h*0.15, w*0.18, h*0.25);
  ctx.fillRect(x-w*0.05, y+h*0.6,  w*0.18, h*0.25);
  ctx.fillRect(x+w*0.87, y+h*0.6,  w*0.18, h*0.25);
  /* headlights */
  ctx.fillStyle=isP?'#fff':'#ffee00';
  ctx.shadowColor=isP?'#fff':'#ffee00'; ctx.shadowBlur=6;
  ctx.fillRect(x+w*0.08, y+h*0.75, w*0.22, h*0.1);
  ctx.fillRect(x+w*0.7,  y+h*0.75, w*0.22, h*0.1);
  ctx.shadowBlur=0;
}

function drawMoto(ctx, cx, bottom, w, h) {
  /* shadow */
  ctx.fillStyle='rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(cx,bottom+h*0.04,w*0.55,h*0.06,0,0,Math.PI*2); ctx.fill();
  /* wheels */
  ctx.strokeStyle='#888'; ctx.lineWidth=w*0.13;
  ctx.beginPath(); ctx.arc(cx-w*0.28, bottom-h*0.08, w*0.22,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx+w*0.28, bottom-h*0.72, w*0.22,0,Math.PI*2); ctx.stroke();
  /* frame */
  ctx.strokeStyle='#cc44ff'; ctx.lineWidth=w*0.09; ctx.shadowColor='#cc44ff'; ctx.shadowBlur=8;
  ctx.beginPath();
  ctx.moveTo(cx-w*0.28, bottom-h*0.08);
  ctx.lineTo(cx, bottom-h*0.55);
  ctx.lineTo(cx+w*0.28, bottom-h*0.72);
  ctx.stroke(); ctx.shadowBlur=0;
  /* body / tank */
  ctx.fillStyle='#6600cc';
  ctx.fillRect(cx-w*0.22, bottom-h*0.62, w*0.44, h*0.22);
  /* rider body */
  ctx.fillStyle='#111';
  ctx.fillRect(cx-w*0.18, bottom-h*0.95, w*0.36, h*0.4);
  /* rider head */
  ctx.fillStyle='#cc44ff'; ctx.shadowColor='#cc44ff'; ctx.shadowBlur=6;
  ctx.beginPath(); ctx.arc(cx, bottom-h*1.0, w*0.18,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  /* exhaust glow */
  ctx.fillStyle='rgba(255,100,50,0.6)';
  ctx.beginPath(); ctx.arc(cx-w*0.18, bottom-h*0.12, w*0.08,0,Math.PI*2); ctx.fill();
}

function lighten(hex, amt) {
  var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return 'rgb('+Math.min(255,Math.round(r+amt*200))+','+Math.min(255,Math.round(g+amt*200))+','+Math.min(255,Math.round(b+amt*200))+')';
}

/* ---- GAME TICK ---- */
function tick() {
  frame++;

  /* move road */
  segOff = (segOff + speed) % 1;

  /* player steering */
  if (keys['ArrowLeft'])  player.vx = Math.max(player.vx-0.012, -0.04);
  else if (keys['ArrowRight']) player.vx = Math.min(player.vx+0.012, 0.04);
  else player.vx *= 0.82;

  player.x = Math.max(-0.95, Math.min(0.95, player.x+player.vx));
  if (player.inv>0) player.inv--;

  /* spawn */
  var spawnInt = Math.max(55, 120 - Math.floor(score/150)*8);
  if (frame % spawnInt === 0) spawnObstacle();

  /* advance obstacles */
  obstacles.forEach(function(o){ o.z += speed*1.1; });
  obstacles = obstacles.filter(function(o){ return o.z<1.15; });

  /* score */
  score++;
  scEl.textContent=score;
  speed = 0.018 + Math.floor(score/400)*0.003;
  spdEl.textContent = Math.round(120 + score/6);

  /* collision: only check obstacles close to player (z>0.85) */
  if (player.inv===0) {
    obstacles.forEach(function(o){
      if (o.z<0.8||o.z>1.05) return;
      /* player x (normalized) vs obstacle lane center */
      var laneCX = o.lane * 0.65; /* matches laneX logic at z=1 */
      if (Math.abs(player.x - laneCX) < 0.28) {
        lives--; lvEl.innerHTML=heart(Math.max(0,lives));
        player.inv=110;
        if (lives<=0) { alive=false; cancelAnimationFrame(animId); gameOver(); }
      }
    });
  }

  draw();
  if (alive) animId=requestAnimationFrame(tick);
}

function gameOver() {
  otEl.className='t go';
  otEl.textContent='CRASH!';
  var scDiv=ov.querySelector('.sc');
  if(!scDiv){ ov.insertAdjacentHTML('beforeend','<div class="sc"></div>'); scDiv=ov.querySelector('.sc'); }
  scDiv.textContent='СЧЁТ '+score;
  ov.style.display='flex';
}

function start() {
  ov.style.display='none';
  init(); alive=true;
  cancelAnimationFrame(animId);
  animId=requestAnimationFrame(tick);
}

keys={};
document.addEventListener('keydown', function(e){
  keys[e.code]=true;
  if(e.code==='Space'){ e.preventDefault(); if(!alive) start(); }
  if(e.code==='ArrowLeft'||e.code==='ArrowRight') e.preventDefault();
});
document.addEventListener('keyup', function(e){ keys[e.code]=false; });
document.addEventListener('click', function(){ if(!alive) start(); });
window.addEventListener('message', function(e){ if(e.data==='start'&&!alive) start(); });

ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
<\/script>
</body>
</html>`;

export default html;
