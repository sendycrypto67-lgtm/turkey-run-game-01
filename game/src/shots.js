// shots.js — the screenshot scenes behind ?shot=start|play|kitchen|end.
// Each one plays the real rules forward from a fresh world for a fixed
// number of steps, steered by a simple autopilot (jump the tall things,
// slide under the lanterns, dash away from a falling knife, chase corn),
// so the frame is what a short game really looks like and the same seed
// always gives the same frame.
import { CFG } from './config.js';
import { stepWorld, resetWorld, EVENT_OVER } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 5;
const PLAY_SECONDS = 27;
const END_LIMIT_SECONDS = 600;
const HORIZON_PLAY = 1.5;
const SAMPLE = 1 / 60;

/**
 * Seconds until the turkey, doing `action` from its CURRENT state (its real
 * height, speed and jumps left), hits an obstacle. Simulates the real
 * physics forward, so a turkey already in the air is not treated as standing
 * on the ground, and a jump that lands on a wide puddle is predicted as the
 * hit it is. Actions: none, jump (one press), djump (jump, then the double
 * jump at the apex, the only way across the widest puddles), slide.
 */
function timeToHit(world, action, horizon) {
  const t = world.turkey;
  let y = t.y;
  let vy = t.vy;
  let jumps = t.jumps;
  let sliding = false;
  let slideT = 0;
  if (action === 'jump' || action === 'djump') {
    if (y <= 0.5 && vy === 0) { vy = CFG.jumpVel; jumps = 1; }
    else if (jumps === 1) { vy = CFG.doubleJumpVel; jumps = 2; }
  }
  if (action === 'slide' && y <= 0.5) { sliding = true; slideT = 0.55; }
  for (let s = SAMPLE; s <= horizon; s += SAMPLE) {
    vy -= CFG.gravity * SAMPLE;
    y += vy * SAMPLE;
    if (y <= 0) { y = 0; vy = 0; jumps = 0; }
    // djump: fire the double jump at the apex, exactly as the runner does.
    if (action === 'djump' && jumps === 1 && vy <= 0 && y > 0.5) { vy = CFG.doubleJumpVel; jumps = 2; }
    if (slideT > 0) { slideT -= SAMPLE; if (slideT <= 0) sliding = false; }
    const h = sliding ? 34 : 62;
    const boxY = CFG.groundY - y - h;
    const boxX = CFG.turkeyX;
    for (const e of world.entities) {
      if (!e.active || e.kind === 'corn' || e.kind === 'feather') continue;
      const ex = e.x - (world.scrollX + world.speed * s);
      const ey = e.kind === 'knife' ? e.yOff + 1500 * Math.max(0, s - Math.max(0, e.warnT)) : CFG.groundY - e.yOff - e.h;
      if (ey + e.h < boxY || ey > boxY + h) continue;
      if (ex + e.w < boxX || ex > boxX + 52) continue;
      return s;
    }
  }
  return Infinity;
}

function autopilot(world, horizon) {
  // A knife warning right over the turkey: dash out of the way first.
  for (const e of world.entities) {
    if (e.kind === 'knife' && e.warnT > 0) {
      const ex = e.x - world.scrollX;
      if (Math.abs(ex - CFG.turkeyX) < 120) return 'dash';
    }
  }
  // Jump (or slide) only when doing it now clears everything in sight;
  // otherwise wait. A jump pressed merely to delay a hit burns the jump
  // (and the double jump) too early, and the turkey lands on the obstacle
  // it was meant to clear. Waiting for the right moment is the whole skill:
  // the sim says a jump clears once the obstacle is close enough.
  const tNone = timeToHit(world, 'none', horizon);
  if (tNone === Infinity) return 'none';
  if (timeToHit(world, 'jump', horizon) === Infinity) return 'jump';
  if (timeToHit(world, 'djump', horizon) === Infinity) return 'djump';
  if (timeToHit(world, 'slide', horizon) === Infinity) return 'slide';
  return 'none';
}

/** One autopilot step: edge-triggered jump/dash, djump at the apex. */
function pilotStep(world, state, i) {
  const action = autopilot(world, HORIZON_PLAY);
  const isJump = action === 'jump' || action === 'djump';
  const wantJump = isJump && (state.prevAction !== action || i - state.lastJumpStep > 10);
  if (action === 'djump' && wantJump) state.djumpArmed = true;
  const wantDouble = state.djumpArmed && world.turkey.jumps === 1 && world.turkey.vy <= 0 && world.turkey.y > 0.5;
  if (wantDouble) state.djumpArmed = false;
  if (wantJump) state.lastJumpStep = i;
  const input = {
    jumpPressed: wantJump || wantDouble,
    slide: action === 'slide',
    dashPressed: action === 'dash' && state.prevAction !== 'dash',
  };
  state.prevAction = action;
  return stepWorld(world, input, 1 / 60);
}

function runFor(world, seconds, horizon, wantOver) {
  const steps = Math.floor(seconds / (1 / 60));
  const state = { prevAction: 'none', lastJumpStep: -100, djumpArmed: false };
  for (let i = 0; i < steps; i += 1) {
    const events = pilotStep(world, state, i);
    if ((events & EVENT_OVER) !== 0) return true;
    if (wantOver && world.lives <= 1 && world.farmer > 60) {
      // keep stumbling: stop dodging once the end is near
    }
  }
  return world.over;
}

/**
 * Set `world` to the named scene and return the screen to draw and the best
 * score to show. Names: start, play, kitchen, end (anything else is start).
 */
export function stageShot(name, world) {
  resetWorld(world, 1);
  if (name !== 'play' && name !== 'kitchen' && name !== 'end') {
    // Title: let the turkey run a few seconds on autopilot behind the
    // title panel, so the scene is alive but nobody gets caught.
    runFor(world, START_SECONDS, HORIZON_PLAY, false);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'play') {
    runFor(world, PLAY_SECONDS, HORIZON_PLAY, false);
    return { screen: world.over ? SCREEN_OVER : SCREEN_PLAY, best: world.score };
  }
  if (name === 'kitchen') {
    // Run into the kitchen and stop mid-stage, while the ovens and knives
    // are flying: the autopilot is good enough to win the whole run, so a
    // plain time limit would show the escape screen instead of the kitchen.
    const state = { prevAction: 'none', lastJumpStep: -100, djumpArmed: false };
    const steps = Math.floor(300 * 60);
    for (let i = 0; i < steps; i += 1) {
      const events = pilotStep(world, state, i);
      if ((events & EVENT_OVER) !== 0 || world.distance >= 1850) break;
    }
    return { screen: world.over ? SCREEN_OVER : SCREEN_PLAY, best: world.score };
  }
  // end: a hurried player who stops dodging well, caught in the kitchen
  runFor(world, 60, HORIZON_PLAY, false);
  const steps = Math.floor(END_LIMIT_SECONDS * 60);
  for (let i = 0; i < steps; i += 1) {
    const events = stepWorld(world, { jumpPressed: false, slide: false, dashPressed: false }, 1 / 60);
    if ((events & EVENT_OVER) !== 0) break;
  }
  return { screen: SCREEN_OVER, best: world.score };
}
