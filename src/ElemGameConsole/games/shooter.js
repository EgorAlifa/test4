/* eslint-disable */
var html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #06060e;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 100vh;
    font-family: 'Courier New', monospace;
    user-select: none; overflow: hidden;
  }
  #hud {
    display: flex; justify-content: space-between;
    width: 360px; padding: 0 0 10px;
    font-size: 13px; letter-spacing: 2px;
    color: #00d4ff; text-transform: uppercase;
  }
  canvas { display: block; box-shadow: 0 0 40px rgba(0,212,255,0.12); }
  #overlay {
    position: fixed; inset: 0;
    background: rgba(6,6,14,0.9);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 14px; backdrop-filter: blur(3px);
  }
  .t  { font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #00d4ff;
        text-shadow: 0 0 10px #00d4ff, 0 0 35px #00d4ff, 0 0 70px #00d4ff; }
  .go { color: #ff4455; text-shadow: 0 0 10px #ff4455, 0 0 35px #ff4455; }
  .sc { font-size: 20px; color: #fff; letter-spacing: 2px; }
  .h  { font-size: 12px; color: #3a3a55; letter-spacing: 2px; margin-top: 6px; }
</style>
</head>
<body>
<div id="hud">
  <span>SCORE &nbsp;<span id="sc">0</span></span>
  <span id="lv">&#9829;&#9829;&#9829;</span>
  <span>WAVE &nbsp;<span id="wv">1</span></span>
</div>
<canvas id="c" width="360" height="500"></canvas>
<div id="overlay">
  <div class="t">SHOOTER</div>
  <div class="h">&#8592; &#8594; &mdash; ДВИЖЕНИЕ</div>
  <div class="h">ПРОБЕЛ &mdash; ОГОНЬ / СТАРТ</div>
</div>
<script>
var c = document.getElementById('c');
var ctx = c.getContext('2d');
var W = 360, H = 500;
var scEl = document.getElementById('sc');
var lvEl = document.getElementById('lv');
var wvEl = document.getElementById('wv');
var ov  = document.getElementById('overlay');

var player, bullets, enemies, eBullets, explosions, stars;
var score, lives, wave, alive, frame, cooldown, eDir, eTimer, animId;
var keys = {};

function heart(n) { var s=''; for(var i=0;i<n;i++) s+='&#9829;'; return s; }
function rand(n) { return Math.floor(Math.random() * n); }

function initStars() {
  stars = [];
  for (var i = 0; i < 80; i++) {
    stars.push({ x: Math.random()*W, y: Math.random()*H,
                 r: Math.random()*1.5+0.3, sp: Math.random()*0.4+0.1, a: Math.random() });
  }
}

function spawnWave() {
  enemies = [];
  var cols = 8, rows = Math.min(2 + wave, 5);
  for (var r = 0; r < rows; r++) {
    for (var cl = 0; cl < cols; cl++) {
      enemies.push({ x: 20 + cl*40, y: 30 + r*38, w:28, h:20, type: r%3, alive:true });
    }
  }
  eDir = 1; eTimer = 0;
}

function init() {
  player = { x: W/2-15, y: H-60, w:30, h:26, inv:0 };
  bullets = []; eBullets = []; explosions = [];
  score = 0; lives = 3; wave = 1;
  cooldown = 0; frame = 0;
  scEl.textContent = 0; lvEl.innerHTML = heart(3); wvEl.textContent = 1;
  initStars(); spawnWave();
}

function drawShip(x, y, w, h) {
  ctx.fillStyle = '#00d4ff'; ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(x + w/2, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w*0.68, y + h*0.72);
  ctx.lineTo(x + w*0.32, y + h*0.72);
  ctx.lineTo(x, y + h);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#001a33'; ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.ellipse(x + w/2, y + h*0.42, w*0.14, h*0.18, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#ff6b35'; ctx.shadowColor = '#ff6b35'; ctx.shadowBlur = 8;
  ctx.fillRect(x + w*0.2, y + h*0.8, w*0.13, h*0.2);
  ctx.fillRect(x + w*0.67, y + h*0.8, w*0.13, h*0.2);
  ctx.shadowBlur = 0;
}

function drawEnemy(e) {
  var cols = ['#ff4455','#ff8833','#cc44ff'];
  ctx.fillStyle = cols[e.type]; ctx.shadowColor = cols[e.type]; ctx.shadowBlur = 8;
  if (e.type === 0) {
    ctx.beginPath();
    ctx.moveTo(e.x+e.w/2, e.y); ctx.lineTo(e.x+e.w, e.y+e.h/2);
    ctx.lineTo(e.x+e.w/2, e.y+e.h); ctx.lineTo(e.x, e.y+e.h/2);
    ctx.closePath(); ctx.fill();
  } else if (e.type === 1) {
    ctx.beginPath();
    ctx.ellipse(e.x+e.w/2, e.y+e.h/2, e.w/2, e.h*0.38, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#220033';
    ctx.beginPath();
    ctx.ellipse(e.x+e.w/2, e.y+e.h/2, e.w*0.22, e.h*0.22, 0, 0, Math.PI*2);
    ctx.fill();
  } else {
    ctx.fillRect(e.x+5, e.y+4, e.w-10, e.h-8);
    ctx.fillRect(e.x, e.y+e.h/3, 7, e.h/3);
    ctx.fillRect(e.x+e.w-7, e.y+e.h/3, 7, e.h/3);
    ctx.fillRect(e.x+e.w*0.3, e.y, e.w*0.4, 5);
  }
  ctx.shadowBlur = 0;
}

function tick() {
  frame++;
  stars.forEach(function(s) { s.y += s.sp; if (s.y > H) s.y = 0; });
  if (cooldown > 0) cooldown--;

  if (keys['ArrowLeft'])  player.x = Math.max(0, player.x - 5);
  if (keys['ArrowRight']) player.x = Math.min(W - player.w, player.x + 5);
  if (player.inv > 0) player.inv--;

  if (keys['Space'] && cooldown === 0) {
    bullets.push({ x: player.x + player.w/2 - 2, y: player.y, w:4, h:14 });
    cooldown = 14;
  }

  bullets.forEach(function(b) { b.y -= 11; });
  bullets = bullets.filter(function(b) { return b.y > -20; });

  var alive_e = enemies.filter(function(e) { return e.alive; });
  if (alive_e.length === 0) {
    wave++; wvEl.textContent = wave; spawnWave(); return;
  }

  var spd = 0.6 + wave * 0.25;
  var wall = false;
  alive_e.forEach(function(e) {
    e.x += eDir * spd;
    if (e.x <= 0 || e.x + e.w >= W) wall = true;
  });
  if (wall) { eDir *= -1; alive_e.forEach(function(e) { e.y += 12; }); }

  eTimer++;
  var interval = Math.max(35, 90 - wave * 12);
  if (eTimer >= interval) {
    eTimer = 0;
    var sh = alive_e[rand(alive_e.length)];
    eBullets.push({ x: sh.x + sh.w/2 - 2, y: sh.y + sh.h, w:4, h:10 });
  }
  eBullets.forEach(function(b) { b.y += 5 + wave * 0.3; });
  eBullets = eBullets.filter(function(b) { return b.y < H + 20; });

  bullets.forEach(function(b) {
    enemies.forEach(function(e) {
      if (!e.alive) return;
      if (b.x < e.x+e.w && b.x+b.w > e.x && b.y < e.y+e.h && b.y+b.h > e.y) {
        e.alive = false; b.y = -9999;
        score += (3 - e.type) * 10; scEl.textContent = score;
        explosions.push({ x: e.x+e.w/2, y: e.y+e.h/2, r:0, max:22 });
      }
    });
  });

  if (player.inv === 0) {
    eBullets.forEach(function(b) {
      if (b.x < player.x+player.w && b.x+b.w > player.x &&
          b.y < player.y+player.h && b.y+b.h > player.y) {
        b.y = -9999; lives--;
        lvEl.innerHTML = heart(Math.max(0, lives));
        player.inv = 90;
        explosions.push({ x: player.x+player.w/2, y: player.y+player.h/2, r:0, max:30 });
        if (lives <= 0) { alive = false; cancelAnimationFrame(animId); gameOver(); }
      }
    });
    alive_e.forEach(function(e) {
      if (e.y + e.h >= player.y && !alive) return;
      if (e.y + e.h >= player.y) { alive = false; cancelAnimationFrame(animId); gameOver(); }
    });
  }

  explosions.forEach(function(ex) { ex.r += 1.6; });
  explosions = explosions.filter(function(ex) { return ex.r < ex.max; });

  draw();
  animId = requestAnimationFrame(tick);
}

function draw() {
  ctx.fillStyle = '#06060e'; ctx.fillRect(0, 0, W, H);

  stars.forEach(function(s) {
    ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + s.a * 0.75) + ')';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
  });

  enemies.filter(function(e) { return e.alive; }).forEach(drawEnemy);

  eBullets.forEach(function(b) {
    ctx.fillStyle = '#ff4455'; ctx.shadowColor='#ff4455'; ctx.shadowBlur=8;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });

  bullets.forEach(function(b) {
    ctx.fillStyle = '#00d4ff'; ctx.shadowColor='#00d4ff'; ctx.shadowBlur=12;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });
  ctx.shadowBlur = 0;

  if (player.inv === 0 || Math.floor(player.inv/7) % 2 === 0) {
    drawShip(player.x, player.y, player.w, player.h);
  }

  explosions.forEach(function(ex) {
    var a = 1 - ex.r / ex.max;
    ctx.strokeStyle = 'rgba(255,180,50,' + a + ')';
    ctx.lineWidth = 2; ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(ex.x, ex.y, ex.r * 1.8, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0;
    for (var i = 0; i < 4; i++) {
      var angle = (i / 4) * Math.PI * 2 + ex.r * 0.2;
      var px = ex.x + Math.cos(angle) * ex.r;
      var py = ex.y + Math.sin(angle) * ex.r;
      ctx.fillStyle = 'rgba(255,200,50,' + a + ')';
      ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI*2); ctx.fill();
    }
  });
}

function gameOver() {
  ov.innerHTML = '<div class="t go">GAME OVER</div><div class="sc">СЧЁТ ' + score + '</div><div class="h">ПРОБЕЛ &mdash; ЗАНОВО</div>';
  ov.style.display = 'flex';
}

function start() {
  ov.style.display = 'none';
  init(); alive = true;
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(tick);
}

document.addEventListener('keydown', function(e) {
  keys[e.code] = true;
  if (e.code === 'Space') { e.preventDefault(); if (!alive) start(); return; }
  if (e.code==='ArrowLeft'||e.code==='ArrowRight'||e.code==='ArrowUp'||e.code==='ArrowDown')
    e.preventDefault();
});
document.addEventListener('keyup', function(e) { keys[e.code] = false; });

ctx.fillStyle = '#06060e'; ctx.fillRect(0, 0, W, H);
<\/script>
</body>
</html>`;

export default html;
