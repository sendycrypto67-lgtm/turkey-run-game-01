// main.js — the loop for Gobble Dash: title, play, caught or escaped.
// Reads ?shot=start|play|kitchen|end to stage a screenshot instead of playing.
import { CFG } from './config.js';
import { createWorld, resetWorld, stepWorld, EVENT_CORN, EVENT_FEATHER, EVENT_HIT, EVENT_OVER, EVENT_WIN, EVENT_JUMP, EVENT_DASH, EVENT_STAGE } from './world.js';
import { drawWorld, SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER } from './render.js';
import { INPUT, attachInput, clearPressed } from './input.js';
import { sfxJump, sfxDash, sfxCorn, sfxFeather, sfxHit, sfxGobble, sfxCaught, sfxWin, sfxStage, startMusic, stopMusic, toggleMute } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = CFG.W * dpr;
  canvas.height = CFG.H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);
attachInput(canvas);

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const world = createWorld(1);
let screen = SCREEN_TITLE;
let best = 0;
let paused = false;
let last = performance.now();

if (shotName) {
  const staged = stageShot(shotName, world);
  screen = staged.screen;
  best = Math.floor(staged.best);
  drawWorld(ctx, world, screen, best);
} else {
  requestAnimationFrame(frame);
}

function announce(text) {
  if (status) status.textContent = text;
}

function startRun() {
  resetWorld(world, (Math.random() * 1e9) | 0);
  screen = SCREEN_PLAY;
  paused = false;
  startMusic();
  sfxGobble();
  announce('Running! Jump the fences, dodge the knives, reach the forest.');
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (INPUT.mutePressed) {
    const m = toggleMute();
    announce(m ? 'Sound off.' : 'Sound on.');
  }
  if (INPUT.pausePressed && screen === SCREEN_PLAY) {
    paused = !paused;
    announce(paused ? 'Paused.' : 'Running.');
  }
  if (INPUT.restartPressed && (screen === SCREEN_OVER || paused)) startRun();

  if (screen === SCREEN_TITLE && (INPUT.jumpPressed || INPUT.anyPressed)) {
    startRun();
  } else if (screen === SCREEN_OVER && (INPUT.jumpPressed || INPUT.restartPressed)) {
    startRun();
  } else if (screen === SCREEN_PLAY && !paused) {
    const events = stepWorld(world, INPUT, dt);
    if (events & EVENT_JUMP) sfxJump();
    if (events & EVENT_DASH) sfxDash();
    if (events & EVENT_CORN) sfxCorn();
    if (events & EVENT_FEATHER) sfxFeather();
    if (events & EVENT_STAGE) sfxStage();
    if (events & EVENT_HIT) {
      sfxHit();
      announce(`Ouch! ${world.lives} ${world.lives === 1 ? 'life' : 'lives'} left. The farmer is closer!`);
    }
    if (events & EVENT_OVER) {
      screen = SCREEN_OVER;
      stopMusic();
      best = Math.max(best, Math.floor(world.score));
      if (events & EVENT_WIN) {
        sfxWin();
        announce(`Escaped! Score ${Math.floor(world.score)}.`);
      } else {
        sfxCaught();
        announce(`Caught by the farmer. Score ${Math.floor(world.score)}.`);
      }
    }
  }

  drawWorld(ctx, world, paused && screen === SCREEN_PLAY ? SCREEN_PLAY : screen, best);
  if (paused && screen === SCREEN_PLAY) {
    ctx.fillStyle = 'rgba(20,16,10,0.55)';
    ctx.fillRect(0, 0, CFG.W, CFG.H);
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 56px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CFG.W / 2, CFG.H / 2);
    ctx.font = '22px sans-serif';
    ctx.fillText('P to resume — R to restart', CFG.W / 2, CFG.H / 2 + 44);
  }
  clearPressed();
  requestAnimationFrame(frame);
}
