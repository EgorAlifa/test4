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
  <div class="h">&#8592; &#8594; &mdash; УПРАВЛЕНИЕ</div>
  <div class="h">ГОНКИ ОТ ТРЕТЬЕГО ЛИЦА</div>
  <div class="h" style="margin-top:14px;color:#556;letter-spacing:1px;">КЛИК ИЛИ ПРОБЕЛ — НАЧАТЬ</div>
</div>
<script>
var c   = document.getElementById('c');
var ctx = c.getContext('2d');
var W = 1, H = 1;

function resize() { W=window.innerWidth; H=window.innerHeight; c.width=W; c.height=H; }
window.addEventListener('resize', resize);
resize();

var scEl  = document.getElementById('sc');
var lvEl  = document.getElementById('lv');
var spdEl = document.getElementById('spd');
var ov    = document.getElementById('overlay');
var otEl  = document.getElementById('ot');

/* ---- constants ---- */
var HORIZON = 0.44; /* fraction of H where road meets sky */
var NUM_SEGS = 24;  /* road segments for alternating colour */

/* ---- game state ---- */
var player, keys, alive, animId;
var obstacles, score, lives, speed, frame, scrollCnt;

var CAR_COLS = ['#e63950','#1a6dd5','#e8b84b','#7b5ea7','#00a1e8','#00cc66'];

function heart(n){ var s=''; for(var i=0;i<n;i++) s+='&#9829;'; return s; }

function init() {
  player = { x:0, vx:0, inv:0, lean:0 };
  obstacles=[]; score=0; lives=3; speed=0.022; frame=0; scrollCnt=0;
  scEl.textContent=0; lvEl.innerHTML=heart(3); spdEl.textContent=120;
}

/* ---- perspective helpers ---- */
/* z=0 → horizon  z=1 → near edge of road */
function projY(z)     { return HORIZON*H + z*(H - HORIZON*H); }
function projScale(z) { return 0.03 + z*0.97; }

/* half-width of road at depth z */
function roadHW(z)  { return W*0.36 * projScale(z); }
/* world-x of lane centre (-1,0,+1) at depth z */
function laneX(lane, z) { return W/2 + lane * roadHW(z) * 0.6; }
/* road left/right edge */
function roadEdgeX(side, z) { return W/2 + side * roadHW(z); }

/* ---- spawn obstacle ---- */
function spawnObstacle() {
  obstacles.push({
    lane: [-1,0,1][Math.floor(Math.random()*3)],
    z: 0,
    color: CAR_COLS[Math.floor(Math.random()*CAR_COLS.length)]
  });
}

/* ---- draw trapezoid road segment ---- */
function drawSeg(z0, z1, fillStyle) {
  ctx.beginPath();
  ctx.moveTo(roadEdgeX(-1,z0), projY(z0));
  ctx.lineTo(roadEdgeX( 1,z0), projY(z0));
  ctx.lineTo(roadEdgeX( 1,z1), projY(z1));
  ctx.lineTo(roadEdgeX(-1,z1), projY(z1));
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

/* ---- draw curb strip ---- */
function drawCurb(side, z0, z1, color) {
  var cw0 = roadHW(z0) * 0.08, cw1 = roadHW(z1) * 0.08;
  var ex0 = roadEdgeX(side, z0), ex1 = roadEdgeX(side, z1);
  ctx.beginPath();
  if (side === -1) {
    ctx.moveTo(ex0-cw0, projY(z0)); ctx.lineTo(ex0, projY(z0));
    ctx.lineTo(ex1, projY(z1));     ctx.lineTo(ex1-cw1, projY(z1));
  } else {
    ctx.moveTo(ex0, projY(z0)); ctx.lineTo(ex0+cw0, projY(z0));
    ctx.lineTo(ex1+cw1, projY(z1)); ctx.lineTo(ex1, projY(z1));
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/* ---- draw scene ---- */
function drawScene() {
  /* sky */
  var sky = ctx.createLinearGradient(0,0,0,HORIZON*H);
  sky.addColorStop(0,'#050010'); sky.addColorStop(1,'#130028');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,HORIZON*H);

  /* stars */
  ctx.fillStyle='rgba(255,255,255,0.55)';
  for(var st=0;st<70;st++){
    ctx.fillRect((st*173.3)%W, (st*97.1)%(HORIZON*H), 1, 1);
  }

  /* ground / grass */
  ctx.fillStyle='#060608'; ctx.fillRect(0,HORIZON*H,W,H-HORIZON*H);

  /* road: NUM_SEGS alternating segments */
  for (var seg=0; seg<NUM_SEGS; seg++) {
    var z0 = seg     / NUM_SEGS;
    var z1 = (seg+1) / NUM_SEGS;
    /* phase flips with scrollCnt so colours scroll toward player */
    var phase = (seg + scrollCnt) & 1;
    var roadCol  = phase ? '#1a1a2a' : '#222238';
    var curbCol  = phase ? '#cc0022' : '#ffffff';
    drawSeg(z0, z1, roadCol);
    drawCurb(-1, z0, z1, curbCol);
    drawCurb( 1, z0, z1, curbCol);
  }

  /* centre dashes — appear only on even segments */
  for (var seg2=0; seg2<NUM_SEGS; seg2++) {
    if (((seg2 + scrollCnt) & 1) === 0) continue;
    var t0 = seg2     / NUM_SEGS;
    var t1 = (seg2+0.5) / NUM_SEGS;
    var cy0 = projY(t0), cy1 = projY(t1);
    var cx0 = W/2, cx1 = W/2;
    var dw0 = roadHW(t0)*0.025, dw1 = roadHW(t1)*0.025;
    ctx.beginPath();
    ctx.moveTo(cx0-dw0, cy0); ctx.lineTo(cx0+dw0, cy0);
    ctx.lineTo(cx1+dw1, cy1); ctx.lineTo(cx1-dw1, cy1);
    ctx.closePath();
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.fill();
  }

  /* obstacles — sorted far-to-near */
  var sorted = obstacles.slice().sort(function(a,b){ return a.z-b.z; });
  sorted.forEach(function(o){
    var s   = projScale(o.z);
    var cx  = laneX(o.lane, o.z);
    var cy  = projY(o.z);
    var cw  = W*0.075*s, ch = W*0.13*s;
    drawCar(cx-cw/2, cy-ch*0.9, cw, ch, o.color);
  });

  /* player moto */
  var lean = player.lean;
  var mx   = W/2 + player.x * W*0.28;
  var mw   = W*0.09, mh = H*0.18;
  var my   = H - mh - H*0.02;
  drawMoto(mx, my, mw, mh, lean);
}

/* ---- draw car sprite ---- */
function drawCar(x, y, w, h, col) {
  ctx.fillStyle=col;
  ctx.fillRect(x+w*0.08, y+h*0.22, w*0.84, h*0.58);
  /* roof */
  ctx.fillStyle=lighten(col,0.35);
  ctx.fillRect(x+w*0.18, y+h*0.02, w*0.64, h*0.3);
  /* windshield */
  ctx.fillStyle='rgba(140,210,255,0.45)';
  ctx.fillRect(x+w*0.2, y+h*0.05, w*0.6, h*0.22);
  /* wheels */
  ctx.fillStyle='#111';
  ctx.fillRect(x-w*0.06, y+h*0.15, w*0.17, h*0.22);
  ctx.fillRect(x+w*0.89, y+h*0.15, w*0.17, h*0.22);
  ctx.fillRect(x-w*0.06, y+h*0.62, w*0.17, h*0.22);
  ctx.fillRect(x+w*0.89, y+h*0.62, w*0.17, h*0.22);
  /* headlights */
  ctx.fillStyle='#ffee33'; ctx.shadowColor='#ffee33'; ctx.shadowBlur=5;
  ctx.fillRect(x+w*0.06, y+h*0.76, w*0.22, h*0.1);
  ctx.fillRect(x+w*0.72, y+h*0.76, w*0.22, h*0.1);
  ctx.shadowBlur=0;
}

/* ---- draw moto (3rd-person, behind) ---- */
function drawMoto(cx, top, w, h, lean) {
  ctx.save();
  ctx.translate(cx, top+h*0.5);
  ctx.rotate(lean * 0.18);

  /* shadow */
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, h*0.52, w*0.55, h*0.06, 0, 0, Math.PI*2); ctx.fill();

  /* rear wheel */
  ctx.strokeStyle='#777'; ctx.lineWidth=w*0.14;
  ctx.beginPath(); ctx.arc(0, h*0.4, w*0.26, 0, Math.PI*2); ctx.stroke();
  /* front wheel (smaller, further up) */
  ctx.lineWidth=w*0.1;
  ctx.beginPath(); ctx.arc(0, -h*0.18, w*0.18, 0, Math.PI*2); ctx.stroke();

  /* frame */
  ctx.strokeStyle='#9922cc'; ctx.lineWidth=w*0.1;
  ctx.shadowColor='#cc44ff'; ctx.shadowBlur=10;
  ctx.beginPath();
  ctx.moveTo(0, h*0.4); ctx.lineTo(0, -h*0.18);
  ctx.stroke(); ctx.shadowBlur=0;

  /* fuel tank / body */
  ctx.fillStyle='#5500aa';
  ctx.fillRect(-w*0.22, -h*0.05, w*0.44, h*0.22);

  /* exhaust flame */
  ctx.fillStyle='rgba(255,120,40,0.7)';
  ctx.shadowColor='#ff8800'; ctx.shadowBlur=8;
  ctx.beginPath(); ctx.ellipse(-w*0.14, h*0.48, w*0.1, w*0.06, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;

  /* rider torso */
  ctx.fillStyle='#1a1a2a';
  ctx.fillRect(-w*0.2, -h*0.42, w*0.4, h*0.4);

  /* rider head */
  ctx.fillStyle='#cc44ff'; ctx.shadowColor='#cc44ff'; ctx.shadowBlur=8;
  ctx.beginPath(); ctx.arc(0, -h*0.5, w*0.19, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;

  /* visor */
  ctx.fillStyle='rgba(0,220,255,0.45)';
  ctx.fillRect(-w*0.14, -h*0.56, w*0.28, h*0.1);

  ctx.restore();
}

function lighten(hex, amt) {
  var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return 'rgb('+Math.min(255,Math.round(r+amt*180))+','+Math.min(255,Math.round(g+amt*180))+','+Math.min(255,Math.round(b+amt*180))+')';
}

/* ---- game tick ---- */
function tick() {
  frame++;

  /* scroll — one segment flip per (1/NUM_SEGS / speed) frames */
  var scrollFrac = speed * NUM_SEGS * frame;
  scrollCnt = Math.floor(scrollFrac) & (NUM_SEGS * 2 - 1); /* cycle 0..47 */

  /* steering */
  var turning = 0;
  if (keys['ArrowLeft'])  { player.vx = Math.max(player.vx-0.014,-0.045); turning=-1; }
  else if (keys['ArrowRight']) { player.vx = Math.min(player.vx+0.014, 0.045); turning=1; }
  else { player.vx *= 0.80; }

  /* lean smoothly */
  player.lean += (turning*1 - player.lean) * 0.18;

  player.x = Math.max(-0.95, Math.min(0.95, player.x+player.vx));
  if (player.inv>0) player.inv--;

  /* spawn */
  var spawnInt = Math.max(50, 110 - Math.floor(score/200)*7);
  if (frame % spawnInt === 0) spawnObstacle();

  /* advance obstacles toward player */
  obstacles.forEach(function(o){ o.z += speed*1.15; });
  obstacles = obstacles.filter(function(o){ return o.z<1.12; });

  /* score & speed */
  score++;
  scEl.textContent = score;
  speed = 0.022 + Math.floor(score/500)*0.004;
  spdEl.textContent = Math.round(120 + score/5);

  /* collision at z > 0.82 */
  if (player.inv===0) {
    obstacles.forEach(function(o){
      if (o.z<0.82||o.z>1.08) return;
      var laneCX = o.lane * 0.6; /* world-x of lane centre (same scale as player.x) */
      if (Math.abs(player.x - laneCX) < 0.32) {
        lives--; lvEl.innerHTML=heart(Math.max(0,lives));
        player.inv=120;
        if (lives<=0) { alive=false; cancelAnimationFrame(animId); gameOver(); }
      }
    });
  }

  drawScene();
  if (alive) animId=requestAnimationFrame(tick);
}

function gameOver() {
  otEl.className='t go'; otEl.textContent='CRASH!';
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
window.addEventListener('message', function(e){
  var d=e.data;
  if(d==='start'||(d&&d.type==='start')) { if(!alive) start(); }
});

ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
<\/script>
</body>
</html>`;

export default html;
