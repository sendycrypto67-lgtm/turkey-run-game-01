// input.js — keyboard and mouse, read fresh every frame by the loop.
export const INPUT = {
  jump: false, jumpPressed: false, slide: false, dashPressed: false,
  pausePressed: false, mutePressed: false, restartPressed: false, anyPressed: false,
};

const keys = new Set();

function press(name) {
  if (name === 'jump') { INPUT.jumpPressed = true; INPUT.jump = true; }
  if (name === 'slide') INPUT.slide = true;
  if (name === 'dash') INPUT.dashPressed = true;
  if (name === 'pause') INPUT.pausePressed = true;
  if (name === 'mute') INPUT.mutePressed = true;
  if (name === 'restart') INPUT.restartPressed = true;
  INPUT.anyPressed = true;
}

function release(name) {
  if (name === 'jump') INPUT.jump = false;
  if (name === 'slide') INPUT.slide = false;
}

export function attachInput(canvas) {
  const down = (event) => {
    if (event.repeat) return;
    const code = event.code;
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') { press('jump'); keys.add('jump'); event.preventDefault(); }
    if (code === 'ArrowDown' || code === 'KeyS') { press('slide'); keys.add('slide'); event.preventDefault(); }
    if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyX') press('dash');
    if (code === 'KeyP' || code === 'Escape') press('pause');
    if (code === 'KeyM') press('mute');
    if (code === 'KeyR' || code === 'Enter') press('restart');
  };
  const up = (event) => {
    const code = event.code;
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') { release('jump'); keys.delete('jump'); }
    if (code === 'ArrowDown' || code === 'KeyS') { release('slide'); keys.delete('slide'); }
  };
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    press('jump');
  });
  canvas.addEventListener('pointerup', () => release('jump'));
  window.addEventListener('blur', () => { keys.clear(); release('jump'); release('slide'); });
}

/** Clear the one-frame pressed flags after the loop has read them. */
export function clearPressed() {
  INPUT.jumpPressed = false;
  INPUT.dashPressed = false;
  INPUT.pausePressed = false;
  INPUT.mutePressed = false;
  INPUT.restartPressed = false;
  INPUT.anyPressed = false;
}
