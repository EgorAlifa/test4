/* eslint-disable */
var html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #080810;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 100vh;
    font-family: 'Courier New', monospace;
    user-select: none; overflow: hidden;
  }
  #hud {
    display: flex; justify-content: space-between;
    width: 300px; padding: 0 0 10px;
    font-size: 13px; letter-spacing: 2px;
    color: #ff6b35; text-transform: uppercase;
  }
  canvas { display: block; box-shadow: 0 0 40px rgba(255,107,53,0.15); }
  #overlay {
    position: fixed; inset: 0;
    background: rgba(8,8,16,0.88);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 14px; backdrop-filter: blur(3px);
  }
  .t  { font-size: 38px; font-weight: 900; letter-spacing: 6px; color: #ff6b35;
        text-shadow: 0 0 10px #ff6b35, 0 0 35px #ff6b35, 0 0 70px #ff6b35; }
  .go { color: #ff4455; text-shadow: 0 0 10px #ff4455, 0 0 35px #ff4455; }
  .sc { font-size: 20px; color: #fff; letter-spacing: 2px; }
  .h  { font-size: 12px; color: #3a3a55; letter-spacing: 2px; margin-top: 6px; }
  .btn-row { display:flex; gap:12px; margin-top:4px; }
  .btn-redo,.btn-menu {
    border-radius:6px; font-family:'Courier New',monospace;
    font-size:12px; letter-spacing:2px; padding:9px 20px; cursor:pointer; transition:all 0.15s;
  }
  .btn-redo { background:#201008; border:1px solid #ff6b35; color:#ff6b35; }
  .btn-redo:hover { background:#2a150a; box-shadow:0 0 12px rgba(255,107,53,0.5); }
  .btn-menu { background:transparent; border:1px solid #2a2a45; color:#4a4a65; }
  .btn-menu:hover { border-color:#888; color:#aaa; }
</style>
</head>
<body>
<div id="hud">
  <span>SCORE &nbsp;<span id="sc">0</span></span>
  <span id="lv">&#9829;&#9829;&#9829;</span>
  <span>KM/H &nbsp;<span id="spd">60</span></span>
</div>
<canvas id="c" width="300" height="500"></canvas>
<div id="overlay">
  <div class="t">RACING</div>
  <div class="h">&#8592; &#8594; &mdash; УПРАВЛЕНИЕ</div>
  <div class="h">ПРОБЕЛ &mdash; СТАРТ</div>
</div>
<script>
var c = document.getElementById('c');
var ctx = c.getContext('2d');
var W = 300, H = 500;
var ROAD_L = 50, ROAD_W = 200;
var scEl = document.getElementById('sc');
var lvEl = document.getElementById('lv');
var spdEl = document.getElementById('spd');
var ov = document.getElementById('overlay');
var PW = 32, PH = 52;
var OW = 30, OH = 50;
var CAR_COLS = ['#e63950','#1a6dd5','#e8b84b','#7b5ea7','#00a1e8','#00cc66'];

var player, obstacles, score, lives, speed, alive, frame, dashOff, spawnT, animId;
var keys = {};

function init() {
  player = { x: W/2 - PW/2, y: H - 80, vx: 0, inv: 0 };
  obstacles = []; score = 0; lives = 3; speed = 2.5;
  frame = 0; dashOff = 0; spawnT = 0;
  scEl.textContent = 0;
  lvEl.innerHTML = '&#9829;&#9829;&#9829;';
  spdEl.textContent = 60;
}

function heart(n) {
  var s = '';
  for (var i = 0; i < n; i++) s += '&#9829;';
  return s;
}

function spawnObstacle() {
  var laneW = ROAD_W / 3;
  var lane = Math.floor(Math.random() * 3);
  obstacles.push({
    x: ROAD_L + lane * laneW + laneW/2 - OW/2,
    y: -OH - Math.random() * 80,
    color: CAR_COLS[Math.floor(Math.random() * CAR_COLS.length)]
  });
}

function drawCar(x, y, w, h, col, isP) {
  ctx.fillStyle = col;
  ctx.fillRect(x + 2, y + h*0.18, w - 4, h * 0.64);
  ctx.fillStyle = isP ? '#ccefff' : '#667799';
  ctx.fillRect(x + w*0.18, y + h*0.06, w*0.64, h * 0.32);
  ctx.fillStyle = '#111';
  ctx.fillRect(x - 5, y + h*0.1,  7, 13);
  ctx.fillRect(x + w - 2, y + h*0.1,  7, 13);
  ctx.fillRect(x - 5, y + h*0.62, 7, 13);
  ctx.fillRect(x + w - 2, y + h*0.62, 7, 13);
  ctx.fillStyle = isP ? '#ff8844' : '#ffee00';
  ctx.shadowColor = isP ? '#ff8844' : '#ffee00'; ctx.shadowBlur = 6;
  var ly = isP ? y + h - 5 : y + 2;
  ctx.fillRect(x + 3, ly, 8, 4);
  ctx.fillRect(x + w - 11, ly, 8, 4);
  ctx.shadowBlur = 0;
}

function tick() {
  frame++;
  dashOff = (dashOff + speed) % 40;

  if (keys['ArrowLeft'])  player.vx = Math.max(player.vx - 1.6, -7);
  else if (keys['ArrowRight']) player.vx = Math.min(player.vx + 1.6, 7);
  else player.vx *= 0.78;

  player.x = Math.max(ROAD_L, Math.min(ROAD_L + ROAD_W - PW, player.x + player.vx));
  if (player.inv > 0) player.inv--;

  spawnT++;
  var spawnInterval = Math.max(28, 80 - Math.floor(score / 80));
  if (spawnT >= spawnInterval) { spawnObstacle(); spawnT = 0; }

  obstacles.forEach(function(o) { o.y += speed; });
  obstacles = obstacles.filter(function(o) { return o.y < H + OH; });

  if (player.inv === 0) {
    for (var i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      if (player.x < o.x + OW - 3 && player.x + PW - 3 > o.x &&
          player.y < o.y + OH - 3 && player.y + PH - 3 > o.y) {
        lives--;
        lvEl.innerHTML = heart(lives);
        player.inv = 100;
        if (lives <= 0) { alive = false; cancelAnimationFrame(animId); gameOver(); return; }
        break;
      }
    }
  }

  score++;
  scEl.textContent = score;
  speed = 2.5 + Math.floor(score / 300) * 0.4;
  spdEl.textContent = Math.round(60 + score / 10);

  draw();
  animId = requestAnimationFrame(tick);
}

function draw() {
  ctx.fillStyle = '#0a1520'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#0a2010';
  ctx.fillRect(0, 0, ROAD_L, H);
  ctx.fillRect(ROAD_L + ROAD_W, 0, W - ROAD_L - ROAD_W, H);
  ctx.fillStyle = '#16162a'; ctx.fillRect(ROAD_L, 0, ROAD_W, H);
  ctx.fillStyle = '#ddd';
  ctx.fillRect(ROAD_L, 0, 3, H);
  ctx.fillRect(ROAD_L + ROAD_W - 3, 0, 3, H);

  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
  ctx.setLineDash([22, 18]); ctx.lineDashOffset = -dashOff;
  var lW = ROAD_W / 3;
  for (var l = 1; l < 3; l++) {
    ctx.beginPath();
    ctx.moveTo(ROAD_L + l * lW, 0); ctx.lineTo(ROAD_L + l * lW, H);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  obstacles.forEach(function(o) { drawCar(o.x, o.y, OW, OH, o.color, false); });

  if (player.inv === 0 || Math.floor(player.inv / 7) % 2 === 0) {
    drawCar(player.x, player.y, PW, PH, '#ff6b35', true);
  }
}

function gameOver() {
  ov.innerHTML = '<div class="t go">CRASH!</div><div class="sc">СЧЁТ ' + score + '</div><div class="btn-row"><button class="btn-menu" onclick="goMenu()">← МЕНЮ</button><button class="btn-redo" onclick="start()">↺ ЗАНОВО</button></div>';
  ov.style.display = 'flex';
}

function goMenu() { window.parent.postMessage({type:'exit'}, '*'); }

function start() {
  ov.style.display = 'none';
  init(); alive = true;
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(tick);
}

document.addEventListener('keydown', function(e) {
  keys[e.code] = true;
  if (e.code === 'Space') { if (!alive) start(); e.preventDefault(); return; }
  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') e.preventDefault();
});
document.addEventListener('keyup', function(e) { keys[e.code] = false; });
document.addEventListener('click', function(e) { if (!alive && e.target.tagName !== 'BUTTON') start(); });
window.addEventListener('message', function(e) {
  var d = e.data;
  if ((d === 'start' || (d && d.type === 'start')) && !alive) start();
});

function resize() {
  var s = Math.min(window.innerWidth / W, (window.innerHeight - 40) / H);
  c.style.width = Math.round(W * s) + 'px';
  c.style.height = Math.round(H * s) + 'px';
  document.getElementById('hud').style.width = Math.round(W * s) + 'px';
}
window.addEventListener('resize', resize);
resize();

ctx.fillStyle = '#080810'; ctx.fillRect(0, 0, W, H);
<\/script>
</body>
</html>`;

export default html;
