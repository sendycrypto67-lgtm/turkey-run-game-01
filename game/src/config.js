// config.js — tuning numbers and colours for Tom's Great Escape, in one place.
export const CFG = {
  W: 1280, H: 720,
  groundY: 600,
  // turkey
  turkeyX: 300,
  gravity: 2400,
  jumpVel: 1020,
  doubleJumpVel: 900,
  slideTime: 0.55,
  dashTime: 0.28,
  dashSpeed: 620,
  // run
  baseSpeed: 300,
  maxSpeed: 560,
  speedRamp: 6, // px/s gained per second of running
  // stages: distance in metres (1 m = 10 px of scroll)
  stages: [
    {
      name: 'STAGE 1 — THE FARMYARD',
      sub: 'Dawn on the farm. Jump the fences, mind the puddles.',
      from: 0, to: 800,
      palette: 'farmyard',
      spawnGap: [480, 760],
      kinds: ['fence', 'hay', 'puddle', 'corn', 'corn', 'feather'],
    },
    {
      name: 'STAGE 2 — THE BARN',
      sub: 'Through the barn. Crates, pitchforks, and a very cross farmer.',
      from: 800, to: 1600,
      palette: 'barn',
      spawnGap: [400, 640],
      kinds: ['crate', 'pitchfork', 'lantern', 'corn', 'corn', 'feather'],
    },
    {
      name: 'STAGE 3 — THE KITCHEN',
      sub: 'The kitchen! Ovens, falling carving knives, and the dinner table.',
      from: 1600, to: 2400,
      palette: 'kitchen',
      spawnGap: [360, 580],
      kinds: ['oven', 'knife', 'knife', 'pot', 'corn', 'corn', 'feather'],
    },
  ],
  escapeAt: 2400, // metres: reach the forest gate and you are free
  livesMax: 3,
  cornScore: 50,
  featherScore: 150,
  stageBonus: 500,
  // farmer chase: 0 = far behind (safe), 100 = on your tail (caught)
  farmerGainHit: 34,
  farmerGainSlow: 2.2, // per second while the turkey dawdles (no dash)
  farmerLossDash: 26,
  farmerLossPerSecond: 3.5, // drifts back while running clean
  colours: {
    farmyard: {
      skyTop: '#7ec8e3', skyMid: '#bfe6f2', skyLow: '#ffe9b0',
      sun: '#ffd94d', cloud: '#ffffff',
      farHill: '#8fbf6a', nearHill: '#6da34e',
      ground: '#c98f4e', groundDark: '#a9713a', grass: '#7cb84e',
      fence: '#8a5a2b', hay: '#e8b64c', barnRed: '#b3402f',
    },
    barn: {
      skyTop: '#5a3a28', skyMid: '#8a5a34', skyLow: '#e8a54c',
      sun: '#ffcf7a', cloud: '#d9b48a',
      farHill: '#6b4a2f', nearHill: '#54371f',
      ground: '#7a5230', groundDark: '#5d3d22', grass: '#8a6a3a',
      fence: '#4a2f18', hay: '#d9a53c', barnRed: '#8f2f22',
    },
    kitchen: {
      skyTop: '#3a2a4a', skyMid: '#6b3a52', skyLow: '#e07840',
      sun: '#ffb36b', cloud: '#8a5a6b',
      farHill: '#4a2f3d', nearHill: '#38222e',
      ground: '#6b4a3a', groundDark: '#503722', grass: '#7a5a42',
      fence: '#2e1c14', hay: '#c98f3c', barnRed: '#7a2a20',
    },
  },
  turkey: {
    body: '#8a5a2b', belly: '#d9a05b', wing: '#6b4423',
    tail1: '#c8552e', tail2: '#e8a13c', tail3: '#8a3d2b',
    head: '#e8b48a', wattle: '#d92b2b', beak: '#f2a93b',
    leg: '#f2a93b', eye: '#1a1a1a',
  },
  farmer: {
    skin: '#e8b48a', shirt: '#4a7a3a', overalls: '#3a5a8a',
    hat: '#e8c85a', hatBand: '#8a5a2b', boot: '#4a2f18', fork: '#c8c8d0',
  },
  hudPanel: 'rgba(20,16,10,0.72)', hudText: '#fff3d6', hudDim: '#d9c8a0',
  hudAmber: '#ffc857', hudRed: '#ff5a4e', hudGreen: '#7dff9a',
};
