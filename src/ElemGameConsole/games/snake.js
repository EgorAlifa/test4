/* eslint-disable */
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #080810;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: 'Courier New', monospace;
    user-select: none;
    overflow: hidden;
  }
  #hud {
    display: flex;
    justify-content: space-between;
    width: 400px;
    padding: 0 0 10px;
    font-size: 13px;
    letter-spacing: 2px;
    color: #00ff88;
    text-transform: uppercase;
  }
  canvas { display: block; box-shadow: 0 0 40px rgba(0,255,136,0.15); }
  #overlay {
    position: fixed; inset: 0;
    background: rgba(8,8,16,0.88);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 14px; backdrop-filter: blur(3px);
  }
  .t { font-size: 38px; font-weight: 900; letter-spacing: 6px; color: #00ff88;
       text-shadow: 0 0 10px #00ff88, 0 0 35px #00ff88, 0 0 70px #00ff88; }
  .go { color: #ff4455; text-shadow: 0 0 10px #ff4455, 0 0 35px #ff4455; }
  .sc { font-size: 20px; color: #fff; letter-spacing: 2px; }
  .h  { font-size: 12px; color: #3a3a55; letter-spacing: 2px; margin-top: 6px; }
</style>
</head>
<body>
<div id="hud">
  <span>SCORE &nbsp;<span id="sc">0</span></span>
  <span>BEST &nbsp;<span id="best">0</span></span>
  <span>LVL &nbsp;<span id="lvl">1</span></span>
</div>
<canvas id="c" width="400" height="400"></canvas>
<div id="overlay">
  <div class="t">SNAKE</div>
  <div class="h">СТРЕЛКИ — ДВИЖЕНИЕ</div>
  <div class="h">ПРОБЕЛ — СТАРТ</div>
</div>
<script>
var c = document.getElementById('c');
var ctx = c.getContext('2d');
var scEl = document.getElementById('sc');
var bestEl = document.getElementById('best');
var lvlEl = document.getElementById('lvl');
var ov = document.getElementById('overlay');
var SZ = 20, COLS = 20, ROWS = 20;
var snake, dir, nd, food, score, best, alive, loop, speed, level;

function rand(n) { return Math.floor(Math.random() * n); }

function spawnFood() {
  do { food = { x: rand(COLS), y: rand(ROWS) }; }
  while (snake.some(function(s) { return s.x === food.x && s.y === food.y; }));
}

function init() {
  snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  dir = nd = {x:1,y:0};
  score = 0; level = 1; speed = 150;
  if (!best) best = 0;
  scEl.textContent = 0; lvlEl.textContent = 1;
  spawnFood();
}

function tick() {
  dir = nd;
  var h = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  if (h.x < 0 || h.x >= COLS || h.y < 0 || h.y >= ROWS ||
      snake.some(function(s) { return s.x === h.x && s.y === h.y; })) {
    clearInterval(loop); alive = false;
    ov.innerHTML = '<div class="t go">GAME OVER</div><div class="sc">СЧЁТ ' + score + '</div><div class="h">ПРОБЕЛ — ЗАНОВО</div>';
    ov.style.display = 'flex'; return;
  }
  snake.unshift(h);
  if (h.x === food.x && h.y === food.y) {
    score++; scEl.textContent = score;
    if (score > best) { best = score; bestEl.textContent = best; }
    spawnFood();
    if (score % 5 === 0) {
      level++; lvlEl.textContent = level;
      speed = Math.max(60, 150 - level * 8);
      clearInterval(loop); loop = setInterval(tick, speed);
    }
  } else { snake.pop(); }
  draw();
}

function draw() {
  ctx.fillStyle = '#080810'; ctx.fillRect(0,0,400,400);
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
  for (var x = 0; x < COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x*SZ,0); ctx.lineTo(x*SZ,400); ctx.stroke();
  }
  for (var y = 0; y < ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0,y*SZ); ctx.lineTo(400,y*SZ); ctx.stroke();
  }
  ctx.fillStyle = '#ff6b35'; ctx.shadowColor = '#ff6b35'; ctx.shadowBlur = 14;
  ctx.fillRect(food.x*SZ+3, food.y*SZ+3, SZ-6, SZ-6);
  snake.forEach(function(s, i) {
    var a = Math.max(0.15, 1 - (i / snake.length) * 0.7);
    ctx.fillStyle = 'rgba(0,255,136,' + a + ')';
    ctx.shadowColor = '#00ff88'; ctx.shadowBlur = i === 0 ? 18 : 0;
    ctx.fillRect(s.x*SZ+1, s.y*SZ+1, SZ-2, SZ-2);
  });
  ctx.shadowBlur = 0;
}

function start() {
  ov.style.display = 'none';
  init(); alive = true;
  clearInterval(loop); loop = setInterval(tick, 150);
}

document.addEventListener('keydown', function(e) {
  if (e.code === 'Space') { if (!alive) start(); e.preventDefault(); return; }
  if (!alive) return;
  var m = {ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0}};
  var d = m[e.code];
  if (d && !(d.x === -dir.x && d.y === -dir.y)) { nd = d; e.preventDefault(); }
});

ctx.fillStyle = '#080810'; ctx.fillRect(0,0,400,400);
<\/script>
</body>
</html>`;

export default html;
