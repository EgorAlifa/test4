/* eslint-disable */
var html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#5c94fc; overflow:hidden; user-select:none; width:100vw; height:100vh; font-family:'Courier New',monospace; }
canvas { display:block; image-rendering:pixelated; position:absolute; top:0; left:0; }
#hud {
  position:fixed; top:0; left:0; right:0; z-index:10; display:flex;
  justify-content:space-between; padding:8px 14px; font-size:12px;
  letter-spacing:2px; color:#fff; text-transform:uppercase; pointer-events:none;
  text-shadow:1px 1px 0 #000; background:rgba(0,0,0,0.35);
}
#overlay {
  position:fixed; inset:0; background:rgba(0,0,0,0.85);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:12px; z-index:20;
}
.t    { font-size:34px; font-weight:900; letter-spacing:5px; color:#ff4400;
        text-shadow:0 0 10px #ff4400, 0 0 35px #ff4400; }
.win  { color:#ffcc00; text-shadow:0 0 10px #ffcc00, 0 0 35px #ffcc00; }
.sc   { font-size:18px; color:#fff; letter-spacing:2px; }
.praise { font-size:13px; color:#ffcc00; letter-spacing:3px; margin-top:4px; }
.h    { font-size:11px; color:#3a3a55; letter-spacing:2px; margin-top:6px; }
.btn-row { display:none; gap:12px; margin-top:14px; justify-content:center; }
.btn-redo { background:#ff4400; color:#fff; border:none; padding:9px 22px;
            font-family:inherit; font-size:11px; letter-spacing:3px; cursor:pointer; border-radius:4px; font-weight:900; }
.btn-menu { background:transparent; color:#556; border:1px solid #2a2a40; padding:9px 22px;
            font-family:inherit; font-size:11px; letter-spacing:3px; cursor:pointer; border-radius:4px; }
.btn-menu:hover { border-color:#888; color:#aaa; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="hud">
  <span>MARIO &#x1F344;</span>
  <span>COINS &nbsp;<span id="co">0</span></span>
  <span>SCORE &nbsp;<span id="sc">0</span></span>
  <span>LIVES &nbsp;<span id="li">3</span></span>
</div>
<div id="overlay">
  <div class="t" id="ot">&#x1F344; MARIO</div>
  <div class="sc" id="ov-sc" style="display:none"></div>
  <div class="praise" id="ov-pr" style="display:none"></div>
  <div class="h" id="h1">← → — ДВИЖЕНИЕ</div>
  <div class="h" id="h2">↑ / ПРОБЕЛ — ПРЫЖОК</div>
  <div class="h" id="h3" style="margin-top:10px;color:#556;letter-spacing:1px;">КЛИК ИЛИ ПРОБЕЛ — НАЧАТЬ</div>
  <div class="btn-row" id="btn-row">
    <button class="btn-redo" onclick="restart()">↺ ЗАНОВО</button>
    <button class="btn-menu" onclick="goMenu()">← МЕНЮ</button>
  </div>
</div>
<script>
var c   = document.getElementById('c');
var ctx = c.getContext('2d');

/* logical game size */
var GW = 640, GH = 320, TILE = 32;
var LW = 50; /* level width in tiles */
var LH = 10; /* level height in tiles */

/* canvas sized to window, game drawn scaled */
var SCALE = 1;
function resize() {
  c.width  = window.innerWidth;
  c.height = window.innerHeight;
  SCALE = Math.min(c.width/GW, c.height/GH);
}
window.addEventListener('resize', resize);
resize();

/* === LEVEL MAP === */
/* 10 rows × 50 cols, row 0 = top (sky), row 9 = bottom (ground) */
/* chars: ' '=empty, '#'=solid, 'B'=brick, '?'=question, 'E'=enemy, 'F'=flag, 'C'=coin */
var LEVEL = [
/*0*/ "                                                  ",
/*1*/ "                                         F        ",
/*2*/ "                                         #        ",
/*3*/ "      BB     ??         BB               #   BB   ",
/*4*/ "                                         #        ",
/*5*/ "         E          E      E             #  E     ",
/*6*/ "    BBBBB      BBBBB    BBB              #  BBB   ",
/*7*/ "                                         #        ",
/*8*/ "#####  ######  #########  ######  #######  #######",
/*9*/ "#####  ######  #########  ######  #######  #######"
];

/* tile constants */
var T_EMPTY=0,T_SOLID=1,T_BRICK=2,T_QBLOCK=3,T_QUSED=4,T_FLAG=5;

function charToTile(ch) {
  if(ch==='#') return T_SOLID;
  if(ch==='B') return T_BRICK;
  if(ch==='?') return T_QBLOCK;
  if(ch==='F') return T_FLAG;
  return T_EMPTY;
}

/* parse level */
var MAP = [], ENEMY_SPAWNS = [], COIN_SPAWNS = [];
function buildMap() {
  MAP = []; ENEMY_SPAWNS = []; COIN_SPAWNS = [];
  for(var r=0;r<LH;r++) {
    MAP[r] = [];
    var row = LEVEL[r] || '';
    for(var cl=0;cl<LW;cl++) {
      var ch = row[cl] || ' ';
      if(ch==='E') { ENEMY_SPAWNS.push({row:r,col:cl}); MAP[r][cl]=T_EMPTY; }
      else if(ch==='C') { COIN_SPAWNS.push({row:r,col:cl}); MAP[r][cl]=T_EMPTY; }
      else MAP[r][cl]=charToTile(ch);
    }
  }
}
buildMap();

function tileAt(col,row) {
  if(row<0||row>=LH||col<0||col>=LW) return T_SOLID;
  return MAP[row][col];
}
function solidAt(col,row) {
  var t=tileAt(col,row);
  return t===T_SOLID||t===T_BRICK||t===T_QBLOCK||t===T_QUSED;
}

/* === WEB AUDIO === */
var audio;
try { audio=new (window.AudioContext||window.webkitAudioContext)(); } catch(e){}
function resumeAudio(){if(audio&&audio.state==='suspended')audio.resume();}
function sndJump(){
  if(!audio)return;
  var o=audio.createOscillator(),g=audio.createGain();
  o.type='square'; o.frequency.setValueAtTime(300,audio.currentTime);
  o.frequency.exponentialRampToValueAtTime(600,audio.currentTime+0.1);
  g.gain.setValueAtTime(0.2,audio.currentTime); g.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.15);
  o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime+0.16);
}
function sndCoin(){
  if(!audio)return;
  var o=audio.createOscillator(),g=audio.createGain();
  o.type='sine'; o.frequency.setValueAtTime(1047,audio.currentTime);
  o.frequency.setValueAtTime(1319,audio.currentTime+0.08);
  g.gain.setValueAtTime(0.3,audio.currentTime); g.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.2);
  o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime+0.21);
}
function sndStomp(){
  if(!audio)return;
  var o=audio.createOscillator(),g=audio.createGain();
  o.type='sawtooth'; o.frequency.setValueAtTime(200,audio.currentTime);
  o.frequency.exponentialRampToValueAtTime(60,audio.currentTime+0.12);
  g.gain.setValueAtTime(0.35,audio.currentTime); g.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.13);
  o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime+0.14);
}
function sndDeath(){
  if(!audio)return;
  var notes=[494,440,370,330,262]; var t=audio.currentTime;
  notes.forEach(function(f,i){
    var o=audio.createOscillator(),g=audio.createGain();
    o.type='square'; o.frequency.value=f;
    g.gain.setValueAtTime(0.2,t+i*0.1); g.gain.exponentialRampToValueAtTime(0.001,t+i*0.1+0.09);
    o.connect(g); g.connect(audio.destination); o.start(t+i*0.1); o.stop(t+i*0.1+0.1);
  });
}
function sndWin(){
  if(!audio)return;
  var notes=[523,659,784,1047,784,1047]; var t=audio.currentTime;
  notes.forEach(function(f,i){
    var o=audio.createOscillator(),g=audio.createGain();
    o.type='square'; o.frequency.value=f;
    g.gain.setValueAtTime(0.22,t+i*0.12); g.gain.exponentialRampToValueAtTime(0.001,t+i*0.12+0.11);
    o.connect(g); g.connect(audio.destination); o.start(t+i*0.12); o.stop(t+i*0.12+0.12);
  });
}

/* === GAME STATE === */
var player, enemies, coins, qAnims, camX;
var totalScore, totalCoins, lives, alive, animId, keys, deathTimer;
var gameOver, gameWin;

var coEl=document.getElementById('co'), scEl=document.getElementById('sc');
var liEl=document.getElementById('li'), ov=document.getElementById('overlay');
var otEl=document.getElementById('ot'), ovSc=document.getElementById('ov-sc');
var ovPr=document.getElementById('ov-pr'), btnRow=document.getElementById('btn-row');

function spawnPlayer() {
  player={x:1.5*TILE, y:6*TILE, vx:0, vy:0, onGround:false, dir:1, frame:0, inv:0, dead:false};
}

function initLevel() {
  buildMap();
  spawnPlayer();
  enemies=ENEMY_SPAWNS.map(function(sp){
    return {x:sp.col*TILE+4, y:sp.row*TILE, vx:0.8, alive:true, dead:false, deadT:0};
  });
  coins=COIN_SPAWNS.map(function(sp){
    return {x:sp.col*TILE+TILE/2, y:sp.row*TILE+TILE/2, alive:true};
  });
  qAnims=[];
  camX=0;
}

function init() {
  totalScore=0; totalCoins=0; lives=3; alive=false; gameOver=false; gameWin=false; deathTimer=0;
  scEl.textContent=0; coEl.textContent=0; liEl.textContent=3;
  initLevel();
}

/* === PHYSICS === */
var GRAVITY=0.45, JUMP_VY=-10.5, WALK=3.2;

function playerAABB() { return {x:player.x, y:player.y, w:22, h:28}; }
function resolvePlayerTile() {
  var pw=22,ph=28;
  var tileCol=function(x){return Math.floor(x/TILE);};
  var tileRow=function(y){return Math.floor(y/TILE);};
  /* vertical */
  if (player.vy>0) {
    var bRow=tileRow(player.y+ph), lCol=tileCol(player.x+2), rCol=tileCol(player.x+pw-3);
    if(solidAt(lCol,bRow)||solidAt(rCol,bRow)){
      player.y=bRow*TILE-ph; player.vy=0; player.onGround=true;
    }
  }
  if (player.vy<0) {
    var tRow=tileRow(player.y), lCol2=tileCol(player.x+2), rCol2=tileCol(player.x+pw-3);
    /* bump ? block */
    var hitQB=function(col,row){
      var t=tileAt(col,row);
      if(t===T_QBLOCK){MAP[row][col]=T_QUSED; totalScore+=100; scEl.textContent=totalScore;
        qAnims.push({col:col,row:row,t:0}); sndCoin(); return true;}
      return t===T_SOLID||t===T_BRICK||t===T_QUSED;
    };
    if(hitQB(lCol2,tRow)||hitQB(rCol2,tRow)){
      player.y=tRow*TILE+TILE; player.vy=0;
    }
  }
  /* horizontal */
  if (player.vx>0) {
    var rC=tileCol(player.x+pw), tR=tileRow(player.y+4), bR=tileRow(player.y+ph-4);
    if(solidAt(rC,tR)||solidAt(rC,bR)) { player.x=rC*TILE-pw; player.vx=0; }
  }
  if (player.vx<0) {
    var lC=tileCol(player.x), tR2=tileRow(player.y+4), bR2=tileRow(player.y+ph-4);
    if(solidAt(lC,tR2)||solidAt(lC,bR2)) { player.x=lC*TILE+TILE; player.vx=0; }
  }
}

/* === TICK === */
function tick() {
  if(!alive) { animId=requestAnimationFrame(tick); return; }

  if(player.dead) {
    deathTimer--;
    player.vy += GRAVITY;
    player.y  += player.vy;
    if(deathTimer<=0) {
      lives--;
      liEl.textContent=Math.max(0,lives);
      if(lives<=0) { showLose(); return; }
      else { initLevel(); }
    }
    draw(); animId=requestAnimationFrame(tick); return;
  }

  player.frame++;
  if(player.inv>0) player.inv--;

  /* input */
  if(keys['ArrowLeft']||keys['KeyA'])  { player.vx=-WALK; player.dir=-1; }
  else if(keys['ArrowRight']||keys['KeyD']) { player.vx= WALK; player.dir= 1; }
  else player.vx *= 0.7;

  if((keys['Space']||keys['ArrowUp']||keys['KeyW'])&&player.onGround) {
    player.vy=JUMP_VY; player.onGround=false; sndJump();
  }

  player.vy += GRAVITY;
  if(player.vy>14) player.vy=14;
  player.x  += player.vx;
  player.y  += player.vy;
  player.onGround=false;
  /* bounds */
  if(player.x<0) player.x=0;
  if(player.x>LW*TILE-22) player.x=LW*TILE-22;
  resolvePlayerTile();

  /* fall death */
  if(player.y>LH*TILE+60) { killPlayer(); }

  /* enemies */
  enemies.forEach(function(e){
    if(!e.alive) {
      if(e.dead){ e.deadT++; e.y+=2; } return;
    }
    e.x+=e.vx;
    e.vy=(e.vy||0)+GRAVITY;
    e.y+=e.vy;
    /* tile collision */
    var ec=Math.floor(e.x/TILE), er=Math.floor((e.y+28)/TILE);
    if(solidAt(ec,er)) { e.y=er*TILE-28; e.vy=0; }
    if(solidAt(Math.floor(e.x/TILE),Math.floor((e.y+14)/TILE))||
       solidAt(Math.floor((e.x+28)/TILE),Math.floor((e.y+14)/TILE))){
      e.vx=-e.vx;
    }
    if(e.x<0) { e.x=0; e.vx=Math.abs(e.vx); }
    if(e.x>LW*TILE-28) { e.x=LW*TILE-28; e.vx=-Math.abs(e.vx); }
    /* collision with player */
    if(player.inv===0&&Math.abs(player.x+11-e.x-14)<22&&Math.abs(player.y+14-e.y-14)<28) {
      /* stomp from above */
      if(player.vy>0&&player.y+28<e.y+18){
        e.alive=false; e.dead=true; e.deadT=0; player.vy=-7;
        totalScore+=200; scEl.textContent=totalScore; sndStomp();
      } else { killPlayer(); }
    }
  });

  /* coins (map-defined, on ? blocks pop) */
  /* check flag */
  var flagCol=Math.floor((player.x+11)/TILE), flagRow=Math.floor((player.y+14)/TILE);
  if(tileAt(flagCol,flagRow)===T_FLAG) { showWin(); return; }

  /* camera */
  var targetX=player.x-GW/3;
  camX+=(targetX-camX)*0.12;
  camX=Math.max(0,Math.min(camX,LW*TILE-GW));

  /* q-block anims */
  qAnims.forEach(function(q){q.t++;});
  qAnims=qAnims.filter(function(q){return q.t<20;});

  draw();
  animId=requestAnimationFrame(tick);
}

function killPlayer() {
  if(player.dead) return;
  player.dead=true; player.vy=-9; deathTimer=80;
  sndDeath();
}

/* === DRAW === */
function draw() {
  ctx.save();
  /* letterbox centering */
  var offX=(c.width  - GW*SCALE)/2;
  var offY=(c.height - GH*SCALE)/2;
  ctx.translate(offX,offY); ctx.scale(SCALE,SCALE);

  /* sky */
  ctx.fillStyle='#5c94fc'; ctx.fillRect(0,0,GW,GH);

  /* clouds (static decorative) */
  [[50,30],[200,20],[400,50],[580,30]].forEach(function(p){
    ctx.fillStyle='#fff';
    ctx.fillRect(p[0]-camX*0.3%GW,p[1],36,14);
    ctx.fillRect(p[0]-camX*0.3%GW-8,p[1]+6,52,10);
  });

  ctx.save(); ctx.translate(-camX,0);

  /* tiles */
  for(var r=0;r<LH;r++) {
    for(var cl=0;cl<LW;cl++) {
      var t=MAP[r][cl];
      if(t===T_EMPTY) continue;
      var tx=cl*TILE, ty=r*TILE;
      if(t===T_SOLID)  { ctx.fillStyle='#8B4513'; ctx.fillRect(tx,ty,TILE,TILE);
        ctx.fillStyle='#228B22'; ctx.fillRect(tx,ty,TILE,4); }
      else if(t===T_BRICK) { ctx.fillStyle='#cc5500'; ctx.fillRect(tx,ty,TILE,TILE);
        ctx.strokeStyle='#883300'; ctx.lineWidth=2; ctx.strokeRect(tx+1,ty+1,TILE-2,TILE-2); }
      else if(t===T_QBLOCK||t===T_QUSED) {
        ctx.fillStyle=t===T_QBLOCK?'#ffcc00':'#8B6914';
        ctx.fillRect(tx,ty,TILE,TILE);
        ctx.fillStyle=t===T_QBLOCK?'#ff8800':'#666';
        ctx.font='bold 18px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(t===T_QBLOCK?'?':'·',tx+TILE/2,ty+TILE/2);
      }
      else if(t===T_FLAG) { ctx.fillStyle='#888'; ctx.fillRect(tx+TILE/2-2,ty,4,TILE);
        ctx.fillStyle='#00cc00'; ctx.fillRect(tx+TILE/2+2,ty+2,14,10); }
    }
  }

  /* q-block animations (coin pop) */
  qAnims.forEach(function(q){
    var t=q.t/20;
    var coinY=q.row*TILE - t*TILE*1.2;
    ctx.fillStyle='#ffcc00'; ctx.shadowColor='#ffcc00'; ctx.shadowBlur=6;
    ctx.beginPath(); ctx.arc(q.col*TILE+TILE/2,coinY,7*(1-t),0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  });

  /* enemies (goombas) */
  enemies.forEach(function(e){
    if(e.dead) { /* squished */
      ctx.fillStyle='#8B4513';
      ctx.fillRect(e.x, e.y+20, 28, 8);
      return;
    }
    if(!e.alive) return;
    /* body */
    ctx.fillStyle='#8B4513'; ctx.fillRect(e.x+2,e.y+10,24,18);
    /* head */
    ctx.fillStyle='#cc6600'; ctx.beginPath(); ctx.arc(e.x+14,e.y+10,12,0,Math.PI*2); ctx.fill();
    /* angry eyes */
    ctx.fillStyle='#fff'; ctx.fillRect(e.x+5,e.y+4,7,6); ctx.fillRect(e.x+16,e.y+4,7,6);
    ctx.fillStyle='#000'; ctx.fillRect(e.x+7,e.y+5,4,4); ctx.fillRect(e.x+18,e.y+5,4,4);
    /* feet */
    ctx.fillStyle='#333';
    ctx.fillRect(e.x+1, e.y+26, 10, 6);
    ctx.fillRect(e.x+17,e.y+26, 10, 6);
  });

  /* player */
  if(!player.dead || (player.dead && player.vy<0)) {
    var px=player.x, py=player.y;
    var blink=player.inv>0&&Math.floor(player.inv/4)%2===1;
    if(!blink) {
      /* legs (animated) */
      var legOff=(player.onGround?Math.sin(player.frame*0.25)*4:0);
      ctx.fillStyle='#0000CC';
      ctx.fillRect(px+3, py+18, 8, 10+Math.max(0,legOff));
      ctx.fillRect(px+11,py+18, 8, 10-Math.min(0,legOff));
      /* shoes */
      ctx.fillStyle='#330000';
      ctx.fillRect(px+1, py+27, 10, 5);
      ctx.fillRect(px+11,py+27, 10, 5);
      /* body */
      ctx.fillStyle='#CC0000'; ctx.fillRect(px+2,py+8,18,12);
      /* overalls */
      ctx.fillStyle='#0000CC'; ctx.fillRect(px+6,py+6,10,10);
      /* head */
      ctx.fillStyle='#FFD09A'; ctx.fillRect(px+4,py+2,14,9);
      /* hat */
      ctx.fillStyle='#CC0000';
      ctx.fillRect(px+1,py-1,20,4);
      ctx.fillRect(px+4,py-7,14,7);
      /* eye */
      ctx.fillStyle='#000'; ctx.fillRect(px+(player.dir>0?13:5),py+4,3,3);
      /* mustache */
      ctx.fillStyle='#330000'; ctx.fillRect(px+5,py+8,12,2);
      /* buttons */
      ctx.fillStyle='#ffcc00'; ctx.fillRect(px+5,py+10,4,4); ctx.fillRect(px+13,py+10,4,4);
    }
  }

  ctx.restore(); /* un-translate camera */
  ctx.restore(); /* un-scale/translate letterbox */
}

/* === SCREENS === */
function showLose() {
  alive=false;
  ovSc.style.display='block'; ovSc.textContent='СЧЁТ '+totalScore;
  ovPr.style.display='none';
  otEl.className='t'; otEl.textContent='GAME OVER';
  document.getElementById('h1').style.display='none';
  document.getElementById('h2').style.display='none';
  document.getElementById('h3').style.display='none';
  btnRow.style.display='flex';
  ov.style.display='flex';
}

var WIN_PRAISE=['ВЫ — НАСТОЯЩИЙ МАРИО!','ПРИНЦЕССА СПАСЕНА!','ГЕРОЙ КОРОЛЕВСТВА!'];
function showWin() {
  alive=false; cancelAnimationFrame(animId); sndWin();
  ovSc.style.display='block'; ovSc.textContent='СЧЁТ '+totalScore+' · МОНЕТ '+totalCoins;
  ovPr.style.display='block'; ovPr.textContent=WIN_PRAISE[Math.floor(Math.random()*WIN_PRAISE.length)];
  otEl.className='t win'; otEl.textContent='🎉 ПОБЕДА!';
  document.getElementById('h1').style.display='none';
  document.getElementById('h2').style.display='none';
  document.getElementById('h3').style.display='none';
  btnRow.style.display='flex';
  ov.style.display='flex';
}

function restart() {
  document.getElementById('h1').style.display='block';
  document.getElementById('h2').style.display='block';
  document.getElementById('h3').style.display='block';
  btnRow.style.display='none';
  ovSc.style.display='none'; ovPr.style.display='none';
  ov.style.display='none';
  otEl.className='t'; otEl.textContent='🍄 MARIO';
  init(); alive=true; resumeAudio();
  cancelAnimationFrame(animId);
  animId=requestAnimationFrame(tick);
}

function goMenu() { window.parent.postMessage({type:'exit'}, '*'); }

function start() {
  ov.style.display='none';
  init(); alive=true; resumeAudio();
  cancelAnimationFrame(animId);
  animId=requestAnimationFrame(tick);
}

/* === INPUT === */
keys={};
document.addEventListener('keydown',function(e){
  keys[e.code]=true;
  if(e.code==='Space'){ e.preventDefault(); if(!alive&&!gameOver) start(); }
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].indexOf(e.code)>-1) e.preventDefault();
});
document.addEventListener('keyup',function(e){keys[e.code]=false;});
document.addEventListener('click',function(){if(!alive&&!gameOver) start();});
window.addEventListener('message',function(e){
  var d=e.data;
  if(d==='start'||(d&&d.type==='start')){ if(!alive&&!gameOver) start(); }
});

init();
draw();
<\/script>
</body>
</html>`;

export default html;
