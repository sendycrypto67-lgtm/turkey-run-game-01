// world.js — the rules of Gobble Dash: running, jumping, the farmer's chase,
// obstacles, corn, stages and the escape. Pure stepping, no drawing, no sound.
import { CFG } from './config.js';
import { makeRng, pick, range } from './random.js';

export const EVENT_NONE = 0;
export const EVENT_HIT = 1;
export const EVENT_CORN = 2;
export const EVENT_FEATHER = 4;
export const EVENT_STAGE = 8;
export const EVENT_OVER = 16;
export const EVENT_WIN = 32;
export const EVENT_JUMP = 64;
export const EVENT_DASH = 128;

const STEP = 1 / 60;

function stageAt(distanceM) {
  const stages = CFG.stages;
  for (let i = 0; i < stages.length; i += 1) {
    if (distanceM < stages[i].to) return i;
  }
  return stages.length - 1;
}

function obstacleSize(kind) {
  switch (kind) {
    case 'fence': return { w: 30, h: 74, y: 0 };
    case 'hay': return { w: 80, h: 48, y: 0 };
    case 'puddle': return { w: 100, h: 16, y: 0 };
    case 'crate': return { w: 64, h: 62, y: 0 };
    case 'pitchfork': return { w: 22, h: 96, y: 0 };
    case 'lantern': return { w: 54, h: 96, y: 40 }; // hangs low: slide under it
    case 'oven': return { w: 116, h: 112, y: 0 };
    case 'pot': return { w: 74, h: 52, y: 0 };
    case 'knife': return { w: 26, h: 90, y: -1 }; // falls from the sky
    default: return { w: 40, h: 40, y: 0 };
  }
}

function isObstacle(kind) {
  return kind !== 'corn' && kind !== 'feather';
}

export function createWorld(seed = 1) {
  return {
    rng: makeRng(seed),
    seed,
    time: 0,
    scrollX: 0, // px scrolled; distance metres = scrollX / 12
    speed: CFG.baseSpeed,
    distance: 0,
    score: 0,
    corn: 0,
    lives: CFG.livesMax,
    farmer: 12, // 0 far behind, 100 on your tail
    stage: 0,
    stageFlash: 0,
    turkey: { y: 0, vy: 0, jumps: 0, sliding: false, slideT: 0, dashT: 0, dashX: 0, invulnT: 0, runPhase: 0 },
    entities: [],
    nextSpawnX: 900,
    shake: 0,
    flash: 0,
    over: false,
    won: false,
    overReason: '',
    message: '',
    messageT: 0,
  };
}

export function resetWorld(world, seed = 1) {
  const fresh = createWorld(seed);
  Object.keys(fresh).forEach((k) => { world[k] = fresh[k]; });
  world.rng = makeRng(seed);
}

function spawnEntity(world, kind, x) {
  const size = obstacleSize(kind);
  const e = { kind, x, w: size.w, h: size.h, yOff: size.y, passed: false, active: true, vy: 0, warnT: 0, bob: world.rng() * 6.28 };
  if (kind === 'knife') { e.yOff = -140; e.warnT = 0.7; e.vy = 0; }
  if (kind === 'corn') e.yOff = world.rng() < 0.5 ? 0 : 150; // ground corn or jump corn
  if (kind === 'feather') e.yOff = 170;
  world.entities.push(e);
}

function spawnAhead(world) {
  const stage = CFG.stages[world.stage];
  const [lo, hi] = stage.spawnGap;
  const x = world.nextSpawnX;
  const kind = pick(world.rng, stage.kinds);
  spawnEntity(world, kind, x);
  // Sometimes a pair: a second jumpable obstacle a little further on, far
  // enough apart that the turkey can land and jump again. Pairs never put
  // a lantern or a falling knife right behind another obstacle: a slide or
  // a dash straight after a jump would be unfair.
  if (world.rng() < 0.25) {
    const pairKinds = stage.kinds.filter((k) => k !== 'lantern' && k !== 'knife');
    const kind2 = pick(world.rng, pairKinds);
    spawnEntity(world, kind2, x + range(world.rng, 330, 430));
  }
  world.nextSpawnX = x + range(world.rng, lo, hi);
}

function turkeyBox(world) {
  const t = world.turkey;
  const sliding = t.sliding;
  const h = sliding ? 34 : 62;
  const w = sliding ? 62 : 52;
  return { x: CFG.turkeyX + t.dashX, y: CFG.groundY - t.y - h, w, h };
}

function hitTest(world) {
  const box = turkeyBox(world);
  for (const e of world.entities) {
    if (!e.active) continue;
    const ey = e.kind === 'knife' ? e.yOff : CFG.groundY - e.yOff - e.h;
    const ex = e.x - world.scrollX;
    if (ex + e.w < box.x || ex > box.x + box.w) continue;
    if (ey + e.h < box.y || ey > box.y + box.h) continue;
    return e;
  }
  return null;
}

export function stepWorld(world, input, dt = STEP) {
  let events = EVENT_NONE;
  if (world.over) return events;
  world.time += dt;
  const t = world.turkey;

  // --- speed and distance ---
  const target = Math.min(CFG.maxSpeed, CFG.baseSpeed + world.distance * 0.09);
  world.speed += (target - world.speed) * Math.min(1, dt * 0.5);
  const dashing = t.dashT > 0;
  const speed = world.speed + (dashing ? CFG.dashSpeed : 0);
  world.scrollX += speed * dt;
  world.distance = world.scrollX / 12;
  world.score += speed * dt * 0.1;
  t.runPhase += dt * (6 + speed / 60);

  // --- stage changes ---
  const stage = stageAt(world.distance);
  if (stage !== world.stage) {
    world.stage = stage;
    world.stageFlash = 2.2;
    world.score += CFG.stageBonus;
    events |= EVENT_STAGE;
    world.message = CFG.stages[stage].name;
    world.messageT = 2.4;
  }
  if (world.stageFlash > 0) world.stageFlash -= dt;
  if (world.messageT > 0) world.messageT -= dt;

  // --- turkey vertical ---
  if (input.jumpPressed) {
    if (t.y <= 0.5 && t.vy === 0) { t.vy = CFG.jumpVel; t.jumps = 1; events |= EVENT_JUMP; }
    else if (t.jumps === 1) { t.vy = CFG.doubleJumpVel; t.jumps = 2; events |= EVENT_JUMP; }
  }
  t.vy -= CFG.gravity * dt;
  t.y += t.vy * dt;
  if (t.y <= 0) { t.y = 0; t.vy = 0; t.jumps = 0; }

  // --- slide ---
  if (input.slide && t.y <= 0.5) { t.sliding = true; t.slideT = CFG.slideTime; }
  if (t.slideT > 0) { t.slideT -= dt; if (t.slideT <= 0) t.sliding = false; }

  // --- dash ---
  if (input.dashPressed && t.dashT <= 0) {
    t.dashT = CFG.dashTime;
    world.farmer = Math.max(0, world.farmer - CFG.farmerLossDash);
    events |= EVENT_DASH;
  }
  if (t.dashT > 0) {
    t.dashT -= dt;
    t.dashX = 120 * Math.sin((Math.PI * (CFG.dashTime - Math.max(0, t.dashT))) / CFG.dashTime);
  } else t.dashX = 0;

  if (t.invulnT > 0) t.invulnT -= dt;
  if (world.shake > 0) world.shake = Math.max(0, world.shake - dt * 3);
  if (world.flash > 0) world.flash = Math.max(0, world.flash - dt * 2);

  // --- farmer: drifts back while running clean, lunges on a hit ---
  world.farmer = Math.max(0, world.farmer - CFG.farmerLossPerSecond * dt);

  // --- spawn and move entities ---
  while (world.nextSpawnX < world.scrollX + CFG.W + 500) spawnAhead(world);
  for (const e of world.entities) {
    if (e.kind === 'knife') {
      if (e.warnT > 0) e.warnT -= dt;
      else e.yOff += 1500 * dt;
    }
  }
  // drop entities far behind
  world.entities = world.entities.filter((e) => e.x - world.scrollX > -260);

  // --- collisions ---
  const hit = hitTest(world);
  if (hit && t.invulnT <= 0) {
    if (hit.kind === 'corn') {
      hit.active = false;
      world.corn += 1;
      world.score += CFG.cornScore;
      events |= EVENT_CORN;
    } else if (hit.kind === 'feather') {
      hit.active = false;
      world.score += CFG.featherScore;
      if (world.lives < CFG.livesMax) world.lives += 1;
      events |= EVENT_FEATHER;
    } else {
      hit.active = false;
      world.lives -= 1;
      world.farmer = Math.min(100, world.farmer + CFG.farmerGainHit);
      t.invulnT = 1.6;
      world.shake = 1;
      world.flash = 1;
      events |= EVENT_HIT;
      if (world.lives <= 0 || world.farmer >= 100) {
        world.over = true;
        world.won = false;
        world.overReason = world.lives <= 0 ? 'caught' : 'caught';
        events |= EVENT_OVER;
      }
    }
  }

  // --- escape? ---
  if (!world.over && world.distance >= CFG.escapeAt) {
    world.over = true;
    world.won = true;
    world.overReason = 'escaped';
    world.score += 1000;
    events |= EVENT_WIN | EVENT_OVER;
  }
  return events;
}

export { STEP, stageAt, turkeyBox, isObstacle };
