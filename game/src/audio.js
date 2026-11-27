// audio.js — all sounds are synthesized with WebAudio, no audio files.
// A cheerful banjo-ish pluck loop plays while running; gobbles, thuds and
// jingles are one-shot blips. Audio starts on the first user gesture.
let ctx = null;
let muted = false;
let musicTimer = null;
let musicStep = 0;

// A simple farmyard tune: C major pentatonic, 8 steps a bar.
const TUNE = [523, 659, 784, 659, 587, 659, 523, 392, 523, 659, 784, 880, 784, 659, 587, 523];

export function isMuted() { return muted; }

export function toggleMute() {
  muted = !muted;
  if (muted) stopMusic();
  else startMusic();
  return muted;
}

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, vol, when = 0, slideTo = 0) {
  if (muted) return;
  const ac = ensureCtx();
  if (!ac) return;
  const t = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function sfxJump() { tone(300, 0.18, 'sine', 0.18, 0, 620); }
export function sfxDoubleJump() { tone(420, 0.16, 'sine', 0.16, 0, 840); }
export function sfxDash() { tone(180, 0.14, 'sawtooth', 0.08, 0, 520); }
export function sfxCorn() { tone(880, 0.09, 'square', 0.10); tone(1320, 0.12, 'square', 0.08, 0.07); }
export function sfxFeather() { tone(660, 0.1, 'triangle', 0.14); tone(880, 0.1, 'triangle', 0.14, 0.09); tone(1100, 0.18, 'triangle', 0.14, 0.18); }
export function sfxHit() { tone(160, 0.25, 'sawtooth', 0.22, 0, 60); tone(90, 0.3, 'square', 0.16, 0.02, 40); }
export function sfxGobble() {
  tone(220, 0.09, 'square', 0.14, 0, 180);
  tone(260, 0.09, 'square', 0.14, 0.1, 200);
  tone(200, 0.14, 'square', 0.14, 0.2, 150);
}
export function sfxCaught() {
  tone(392, 0.2, 'sawtooth', 0.16, 0, 196);
  tone(311, 0.2, 'sawtooth', 0.16, 0.2, 155);
  tone(233, 0.5, 'sawtooth', 0.18, 0.4, 110);
}
export function sfxWin() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.16, i * 0.13));
  tone(1319, 0.5, 'triangle', 0.16, 0.55);
}
export function sfxStage() { tone(523, 0.12, 'triangle', 0.14); tone(784, 0.2, 'triangle', 0.14, 0.1); }

export function startMusic() {
  if (muted || musicTimer) return;
  ensureCtx();
  musicStep = 0;
  musicTimer = window.setInterval(() => {
    if (muted) return;
    const f = TUNE[musicStep % TUNE.length];
    tone(f, 0.22, 'triangle', 0.05);
    if (musicStep % 4 === 0) tone(f / 2, 0.3, 'sine', 0.05);
    musicStep += 1;
  }, 210);
}

export function stopMusic() {
  if (musicTimer) { window.clearInterval(musicTimer); musicTimer = null; }
}
