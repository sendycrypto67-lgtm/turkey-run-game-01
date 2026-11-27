// render.js — draws Gobble Dash on a 1280x720 canvas: autumn farm, barn and
// kitchen scenes, the turkey, the chasing farmer, the HUD and the screens.
import { CFG } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

function palette(world) {
  return CFG.colours[CFG.stages[world.stage].palette];
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawSky(ctx, world, pal) {
  const g = ctx.createLinearGradient(0, 0, 0, CFG.groundY);
  g.addColorStop(0, pal.skyTop);
  g.addColorStop(0.55, pal.skyMid);
  g.addColorStop(1, pal.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CFG.W, CFG.groundY);
  // sun
  ctx.fillStyle = pal.sun;
  ctx.beginPath();
  ctx.arc(1080, 110, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,217,77,0.25)';
  ctx.beginPath();
  ctx.arc(1080, 110, 78, 0, Math.PI * 2);
  ctx.fill();
  // clouds drift with the scroll
  ctx.fillStyle = pal.cloud;
  for (let i = 0; i < 5; i += 1) {
    const cx = ((i * 340 - world.scrollX * 0.15) % (CFG.W + 300) + CFG.W + 300) % (CFG.W + 300) - 150;
    const cy = 70 + i * 36;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 70, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 44, cy + 8, 48, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHills(ctx, world, pal) {
  ctx.fillStyle = pal.farHill;
  ctx.beginPath();
  ctx.moveTo(0, CFG.groundY);
  for (let x = 0; x <= CFG.W; x += 40) {
    const y = CFG.groundY - 90 - 40 * Math.sin((x + world.scrollX * 0.3) / 260);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(CFG.W, CFG.groundY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = pal.nearHill;
  ctx.beginPath();
  ctx.moveTo(0, CFG.groundY);
  for (let x = 0; x <= CFG.W; x += 40) {
    const y = CFG.groundY - 34 - 22 * Math.sin((x + world.scrollX * 0.55) / 180 + 2);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(CFG.W, CFG.groundY);
  ctx.closePath();
  ctx.fill();
}

function drawGround(ctx, world, pal) {
  ctx.fillStyle = pal.ground;
  ctx.fillRect(0, CFG.groundY, CFG.W, CFG.H - CFG.groundY);
  ctx.fillStyle = pal.groundDark;
  ctx.fillRect(0, CFG.groundY, CFG.W, 8);
  // grass tufts and pebbles scrolling past
  ctx.fillStyle = pal.grass;
  for (let i = 0; i < 40; i += 1) {
    const gx = ((i * 173 - world.scrollX) % (CFG.W + 80) + CFG.W + 80) % (CFG.W + 80) - 40;
    const gy = CFG.groundY + 24 + ((i * 37) % 80);
    ctx.fillRect(gx, gy, 4, 12);
    ctx.fillRect(gx + 6, gy + 3, 4, 9);
  }
}

function drawScenery(ctx, world, pal) {
  const stage = world.stage;
  // distant props, one per ~900 px of world
  for (let wx = Math.floor(world.scrollX / 900) * 900; wx < world.scrollX + CFG.W + 900; wx += 900) {
    const sx = wx - world.scrollX;
    if (stage === 0) drawFarmhouse(ctx, sx + 120, pal);
    if (stage === 1) drawBarn(ctx, sx + 120, pal);
    if (stage === 2) drawKitchenWindow(ctx, sx + 120, pal);
  }
  // pumpkins and autumn trees in every stage
  for (let i = 0; i < 6; i += 1) {
    const wx = Math.floor((world.scrollX + i * 520) / 520) * 520 + 260;
    const sx = wx - world.scrollX;
    if (sx < -80 || sx > CFG.W + 80) continue;
    if (i % 2 === 0) drawPumpkin(ctx, sx, pal);
    else drawAutumnTree(ctx, sx, pal);
  }
}

function drawFarmhouse(ctx, x, pal) {
  ctx.fillStyle = '#f2e6c8';
  ctx.fillRect(x, 470, 150, 130);
  ctx.fillStyle = pal.barnRed;
  ctx.beginPath();
  ctx.moveTo(x - 12, 472);
  ctx.lineTo(x + 75, 410);
  ctx.lineTo(x + 162, 472);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x + 60, 530, 30, 70);
  ctx.fillStyle = '#7ec8e3';
  ctx.fillRect(x + 18, 500, 28, 28);
  ctx.fillRect(x + 104, 500, 28, 28);
}

function drawBarn(ctx, x, pal) {
  ctx.fillStyle = pal.barnRed;
  ctx.fillRect(x, 440, 180, 160);
  ctx.fillStyle = '#7a2a20';
  ctx.beginPath();
  ctx.moveTo(x - 8, 442);
  ctx.lineTo(x + 90, 380);
  ctx.lineTo(x + 188, 442);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f2e6c8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 90, 452);
  ctx.lineTo(x + 90, 600);
  ctx.moveTo(x + 20, 520);
  ctx.lineTo(x + 160, 520);
  ctx.stroke();
}

function drawKitchenWindow(ctx, x, pal) {
  ctx.fillStyle = '#2e1c14';
  ctx.fillRect(x, 400, 170, 200);
  ctx.fillStyle = '#ffcf7a';
  ctx.fillRect(x + 16, 420, 60, 70);
  ctx.fillRect(x + 94, 420, 60, 70);
  ctx.strokeStyle = '#2e1c14';
  ctx.lineWidth = 5;
  ctx.strokeRect(x + 16, 420, 60, 70);
  ctx.strokeRect(x + 94, 420, 60, 70);
}

function drawPumpkin(ctx, x, pal) {
  ctx.fillStyle = '#e07820';
  ctx.beginPath();
  ctx.ellipse(x, CFG.groundY - 14, 26, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c85a10';
  ctx.beginPath();
  ctx.ellipse(x - 12, CFG.groundY - 14, 12, 18, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 12, CFG.groundY - 14, 12, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5a7a2a';
  ctx.fillRect(x - 3, CFG.groundY - 38, 6, 12);
}

function drawAutumnTree(ctx, x, pal) {
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(x - 6, CFG.groundY - 90, 12, 90);
  ctx.fillStyle = '#d9622b';
  ctx.beginPath();
  ctx.arc(x, CFG.groundY - 110, 42, 0, Math.PI * 2);
  ctx.arc(x - 30, CFG.groundY - 88, 28, 0, Math.PI * 2);
  ctx.arc(x + 30, CFG.groundY - 88, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8a13c';
  ctx.beginPath();
  ctx.arc(x + 8, CFG.groundY - 128, 22, 0, Math.PI * 2);
  ctx.fill();
}

function drawTurkey(ctx, world) {
  const t = world.turkey;
  const C = CFG.turkey;
  const x = CFG.turkeyX + t.dashX;
  const groundY = CFG.groundY - t.y;
  const sliding = t.sliding;
  const blink = t.invulnT > 0 && Math.floor(world.time * 12) % 2 === 0;
  ctx.save();
  if (blink) ctx.globalAlpha = 0.35;
  if (world.shake > 0) ctx.translate((Math.random() - 0.5) * 6 * world.shake, (Math.random() - 0.5) * 6 * world.shake);
  const run = Math.sin(t.runPhase) * (t.y > 0.5 ? 0 : 1);
  const bodyY = groundY - (sliding ? 22 : 38) + run * 2;
  // tail fan
  const tailCols = [C.tail1, C.tail2, C.tail3, C.tail2, C.tail1];
  for (let i = 0; i < 5; i += 1) {
    const ang = Math.PI * (0.72 + i * 0.14);
    const tx = x - 26 + Math.cos(ang) * 34;
    const ty = bodyY - 6 + Math.sin(ang) * 34;
    ctx.strokeStyle = tailCols[i];
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 24, bodyY - 4);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  }
  // legs
  ctx.strokeStyle = C.leg;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const legSwing = t.y > 0.5 ? 14 : run * 12;
  ctx.beginPath();
  ctx.moveTo(x - 6, bodyY + 16);
  ctx.lineTo(x - 10 + legSwing, groundY);
  ctx.moveTo(x + 8, bodyY + 16);
  ctx.lineTo(x + 12 - legSwing, groundY);
  ctx.stroke();
  // body
  ctx.fillStyle = C.body;
  ctx.beginPath();
  ctx.ellipse(x, bodyY, sliding ? 34 : 30, sliding ? 18 : 26, sliding ? 0.25 : 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.belly;
  ctx.beginPath();
  ctx.ellipse(x + 8, bodyY + 8, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // wing
  const flap = t.y > 0.5 ? -0.9 : run * 0.25;
  ctx.save();
  ctx.translate(x - 2, bodyY - 4);
  ctx.rotate(flap);
  ctx.fillStyle = C.wing;
  ctx.beginPath();
  ctx.ellipse(-6, 4, 20, 10, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // head
  const hx = x + 24;
  const hy = bodyY - (sliding ? 8 : 30);
  ctx.fillStyle = C.head;
  ctx.beginPath();
  ctx.arc(hx, hy, 13, 0, Math.PI * 2);
  ctx.fill();
  // beak + wattle
  ctx.fillStyle = C.beak;
  ctx.beginPath();
  ctx.moveTo(hx + 10, hy - 2);
  ctx.lineTo(hx + 24, hy + 3);
  ctx.lineTo(hx + 10, hy + 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = C.wattle;
  ctx.beginPath();
  ctx.ellipse(hx + 8, hy + 12, 5, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // eye
  ctx.fillStyle = C.eye;
  ctx.beginPath();
  ctx.arc(hx + 4, hy - 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFarmer(ctx, world) {
  const F = CFG.farmer;
  const x = 60 + world.farmer * 1.9;
  const y = CFG.groundY;
  const run = Math.sin(world.time * 14) * 8;
  ctx.save();
  // legs
  ctx.strokeStyle = F.boot;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 46);
  ctx.lineTo(x - 10 + run, y);
  ctx.moveTo(x + 6, y - 46);
  ctx.lineTo(x + 12 - run, y);
  ctx.stroke();
  // overalls
  ctx.fillStyle = F.overalls;
  roundRect(ctx, x - 16, y - 92, 34, 50, 8);
  ctx.fill();
  // shirt arms
  ctx.fillStyle = F.shirt;
  ctx.beginPath();
  ctx.ellipse(x - 18, y - 76, 8, 16, 0.5, 0, Math.PI * 2);
  ctx.ellipse(x + 20, y - 76, 8, 16, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // head
  ctx.fillStyle = F.skin;
  ctx.beginPath();
  ctx.arc(x + 2, y - 106, 15, 0, Math.PI * 2);
  ctx.fill();
  // angry eyes + moustache
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 112);
  ctx.lineTo(x - 1, y - 109);
  ctx.moveTo(x + 10, y - 112);
  ctx.lineTo(x + 5, y - 109);
  ctx.stroke();
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(x - 4, y - 98, 14, 4);
  // straw hat
  ctx.fillStyle = F.hat;
  ctx.beginPath();
  ctx.ellipse(x + 2, y - 118, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 2, y - 120, 13, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = F.hatBand;
  ctx.fillRect(x - 11, y - 122, 26, 4);
  // pitchfork
  ctx.strokeStyle = F.fork;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 26, y - 40);
  ctx.lineTo(x + 34, y - 130);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 30, y - 130);
  ctx.lineTo(x + 26, y - 146);
  ctx.moveTo(x + 34, y - 130);
  ctx.lineTo(x + 34, y - 148);
  ctx.moveTo(x + 38, y - 130);
  ctx.lineTo(x + 42, y - 146);
  ctx.stroke();
  ctx.restore();
  // shout bubble when close
  if (world.farmer > 55) {
    ctx.fillStyle = '#fff3d6';
    roundRect(ctx, x - 10, y - 190, 150, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#3a2a1a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('COME BACK HERE!', x + 2, y - 164);
  }
}

function drawEntity(ctx, world, e) {
  const pal = palette(world);
  const sx = e.x - world.scrollX;
  if (sx < -200 || sx > CFG.W + 200) return;
  const gy = CFG.groundY;
  switch (e.kind) {
    case 'fence': {
      ctx.fillStyle = pal.fence;
      ctx.fillRect(sx, gy - 74, 6, 74);
      ctx.fillRect(sx + 24, gy - 74, 6, 74);
      ctx.fillRect(sx - 6, gy - 66, 42, 8);
      ctx.fillRect(sx - 6, gy - 38, 42, 8);
      break;
    }
    case 'hay': {
      ctx.fillStyle = pal.hay;
      ctx.beginPath();
      ctx.ellipse(sx + e.w / 2, gy - 22, e.w / 2, 24, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#b98a2e';
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(sx + e.w / 2 + i * 14, gy - 44);
        ctx.lineTo(sx + e.w / 2 + i * 14, gy - 6);
        ctx.stroke();
      }
      break;
    }
    case 'puddle': {
      ctx.fillStyle = '#5a8ac8';
      ctx.beginPath();
      ctx.ellipse(sx + e.w / 2, gy - 6, e.w / 2, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.ellipse(sx + e.w / 2 - 20, gy - 8, 18, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'crate': {
      ctx.fillStyle = '#a8763a';
      ctx.fillRect(sx, gy - 62, 64, 62);
      ctx.strokeStyle = '#7a5222';
      ctx.lineWidth = 4;
      ctx.strokeRect(sx + 2, gy - 60, 60, 58);
      ctx.beginPath();
      ctx.moveTo(sx + 2, gy - 60);
      ctx.lineTo(sx + 62, gy - 2);
      ctx.moveTo(sx + 62, gy - 60);
      ctx.lineTo(sx + 2, gy - 2);
      ctx.stroke();
      break;
    }
    case 'pitchfork': {
      ctx.strokeStyle = '#8a8a9a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(sx + 11, gy);
      ctx.lineTo(sx + 11, gy - 96);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx + 3, gy - 96);
      ctx.lineTo(sx + 3, gy - 76);
      ctx.moveTo(sx + 11, gy - 96);
      ctx.lineTo(sx + 11, gy - 74);
      ctx.moveTo(sx + 19, gy - 96);
      ctx.lineTo(sx + 19, gy - 76);
      ctx.stroke();
      break;
    }
    case 'lantern': {
      // hangs from a branch the turkey must slide under
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sx + 27, 380);
      ctx.lineTo(sx + 27, 464);
      ctx.stroke();
      ctx.fillStyle = '#3a2a1a';
      ctx.beginPath();
      ctx.moveTo(sx - 10, 380);
      ctx.lineTo(sx + 64, 380);
      ctx.lineTo(sx + 54, 392);
      ctx.lineTo(sx, 392);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffcf5a';
      roundRect(ctx, sx, 464, 54, 96, 10);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,207,90,0.35)';
      ctx.beginPath();
      ctx.arc(sx + 27, 512, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(sx + 20, 500, 14, 22);
      break;
    }
    case 'oven': {
      ctx.fillStyle = '#5a5a62';
      roundRect(ctx, sx, gy - 112, 116, 112, 10);
      ctx.fill();
      ctx.fillStyle = '#2a2a30';
      roundRect(ctx, sx + 12, gy - 96, 92, 56, 6);
      ctx.fill();
      ctx.fillStyle = '#ff7a2a';
      ctx.beginPath();
      ctx.ellipse(sx + 58, gy - 66, 30, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd94d';
      ctx.beginPath();
      ctx.ellipse(sx + 58, gy - 66, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c8c8d0';
      ctx.fillRect(sx + 12, gy - 28, 92, 8);
      break;
    }
    case 'pot': {
      ctx.fillStyle = '#3a3a42';
      ctx.beginPath();
      ctx.ellipse(sx + 37, gy - 52, 37, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(sx, gy - 52, 74, 50);
      ctx.fillStyle = '#e8e8f0';
      ctx.fillRect(sx - 6, gy - 48, 10, 8);
      ctx.fillRect(sx + 70, gy - 48, 10, 8);
      // steam
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sx + 20, gy - 56);
      ctx.quadraticCurveTo(sx + 14, gy - 76, sx + 22, gy - 92);
      ctx.moveTo(sx + 50, gy - 56);
      ctx.quadraticCurveTo(sx + 56, gy - 76, sx + 48, gy - 92);
      ctx.stroke();
      break;
    }
    case 'knife': {
      if (e.warnT > 0) {
        // telegraph: flashing marker on the ground
        ctx.fillStyle = Math.floor(world.time * 10) % 2 === 0 ? 'rgba(255,60,40,0.75)' : 'rgba(255,60,40,0.3)';
        ctx.beginPath();
        ctx.ellipse(sx + 13, gy - 4, 34, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff5a4e';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', sx + 13, gy - 120);
      }
      const ky = e.yOff;
      ctx.save();
      ctx.translate(sx + 13, ky + 45);
      ctx.rotate(0.35);
      ctx.fillStyle = '#e8e8f0';
      ctx.beginPath();
      ctx.moveTo(0, -45);
      ctx.lineTo(10, -10);
      ctx.lineTo(6, 20);
      ctx.lineTo(-6, 20);
      ctx.lineTo(-10, -10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5a3a22';
      ctx.fillRect(-7, 20, 14, 22);
      ctx.restore();
      break;
    }
    case 'corn': {
      const cy = gy - e.yOff - 20 + Math.sin(world.time * 3 + e.bob) * 4;
      ctx.fillStyle = '#f2c230';
      ctx.beginPath();
      ctx.ellipse(sx + 15, cy, 12, 18, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d9a520';
      for (let i = -1; i <= 1; i += 1) ctx.fillRect(sx + 11 + i * 5, cy - 12, 2, 24);
      ctx.fillStyle = '#5a8a2a';
      ctx.fillRect(sx + 13, cy + 16, 4, 12);
      break;
    }
    case 'feather': {
      const fy = gy - e.yOff - 20 + Math.sin(world.time * 3 + e.bob) * 5;
      ctx.fillStyle = '#ffd94d';
      ctx.beginPath();
      ctx.ellipse(sx + 15, fy, 10, 22, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c89a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + 15, fy - 22);
      ctx.lineTo(sx + 15, fy + 22);
      ctx.stroke();
      break;
    }
    default:
      break;
  }
}

function drawHud(ctx, world, best) {
  const stage = CFG.stages[world.stage];
  ctx.fillStyle = CFG.hudPanel;
  roundRect(ctx, 16, 14, 420, 92, 12);
  ctx.fill();
  ctx.fillStyle = CFG.hudText;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${Math.floor(world.score)}`, 32, 48);
  ctx.font = '20px sans-serif';
  ctx.fillStyle = CFG.hudDim;
  ctx.fillText(`🌽 ${world.corn}   BEST ${best}`, 32, 78);
  ctx.fillText(stage.name, 32, 100 - 0); // stage line sits under the panel
  // distance to freedom, top right
  const remain = Math.max(0, CFG.escapeAt - world.distance);
  ctx.fillStyle = CFG.hudPanel;
  roundRect(ctx, CFG.W - 436, 14, 420, 92, 12);
  ctx.fill();
  ctx.fillStyle = CFG.hudText;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`FREEDOM ${Math.ceil(remain)} m`, CFG.W - 32, 48);
  ctx.font = '20px sans-serif';
  ctx.fillStyle = CFG.hudDim;
  ctx.fillText(`DISTANCE ${Math.floor(world.distance)} m`, CFG.W - 32, 78);
  // farmer proximity bar, centre top
  const bw = 260;
  ctx.fillStyle = CFG.hudPanel;
  roundRect(ctx, (CFG.W - bw) / 2 - 10, 14, bw + 20, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#3a2a1a';
  roundRect(ctx, (CFG.W - bw) / 2, 30, bw, 14, 7);
  ctx.fill();
  ctx.fillStyle = world.farmer > 60 ? CFG.hudRed : CFG.hudAmber;
  roundRect(ctx, (CFG.W - bw) / 2, 30, (bw * world.farmer) / 100, 14, 7);
  ctx.fill();
  ctx.fillStyle = CFG.hudText;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FARMER', CFG.W / 2, 60);
  // lives, bottom left hearts
  for (let i = 0; i < CFG.livesMax; i += 1) {
    const hx = 34 + i * 40;
    const hy = CFG.H - 34;
    ctx.fillStyle = i < world.lives ? '#ff5a6e' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(hx - 7, hy - 4, 9, 0, Math.PI * 2);
    ctx.arc(hx + 7, hy - 4, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 15, hy - 2);
    ctx.lineTo(hx, hy + 13);
    ctx.lineTo(hx + 15, hy - 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = CFG.hudText;
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SPACE jump ×2   ↓ slide   SHIFT dash', 150, CFG.H - 26);
  // stage banner
  if (world.messageT > 0) {
    ctx.globalAlpha = Math.min(1, world.messageT);
    ctx.fillStyle = 'rgba(20,16,10,0.8)';
    roundRect(ctx, (CFG.W - 560) / 2, 180, 560, 90, 14);
    ctx.fill();
    ctx.fillStyle = CFG.hudAmber;
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(world.message, CFG.W / 2, 220);
    ctx.fillStyle = CFG.hudText;
    ctx.font = '19px sans-serif';
    ctx.fillText(CFG.stages[world.stage].sub, CFG.W / 2, 250);
    ctx.globalAlpha = 1;
  }
}

function drawTitle(ctx, world, best) {
  ctx.fillStyle = 'rgba(20,16,10,0.45)';
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 84px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GOBBLE DASH', CFG.W / 2, 190);
  ctx.fillStyle = CFG.hudAmber;
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('The Great Thanksgiving Escape', CFG.W / 2, 238);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '22px sans-serif';
  ctx.fillText('Thanksgiving is coming. The farmer has the oven on, the carving knife', CFG.W / 2, 300);
  ctx.fillText('is out, and you are the main course. Run 2,400 metres to the forest', CFG.W / 2, 330);
  ctx.fillText('and you are free. Stumble three times and dinner is served.', CFG.W / 2, 360);
  ctx.fillStyle = CFG.hudPanel;
  roundRect(ctx, (CFG.W - 620) / 2, 400, 620, 150, 14);
  ctx.fill();
  ctx.fillStyle = CFG.hudText;
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('SPACE / CLICK — jump (twice, in the air)', CFG.W / 2, 438);
  ctx.fillText('↓ / S — slide under the lanterns', CFG.W / 2, 470);
  ctx.fillText('SHIFT — dash away from the farmer', CFG.W / 2, 502);
  ctx.fillText('P pause    M sound    R restart', CFG.W / 2, 534);
  ctx.fillStyle = CFG.hudGreen;
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Press SPACE or click to run!', CFG.W / 2, 610);
  if (best > 0) {
    ctx.fillStyle = CFG.hudDim;
    ctx.font = '20px sans-serif';
    ctx.fillText(`Best score so far: ${best}`, CFG.W / 2, 648);
  }
}

function drawOver(ctx, world, best) {
  ctx.fillStyle = world.won ? 'rgba(20,60,20,0.55)' : 'rgba(60,10,10,0.55)';
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 76px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(world.won ? 'ESCAPED!' : 'CAUGHT!', CFG.W / 2, 210);
  ctx.fillStyle = CFG.hudAmber;
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(
    world.won
      ? 'You made it to the forest. No Thanksgiving dinner this year.'
      : 'The farmer got you. Dinner is served... better luck next run.',
    CFG.W / 2, 262,
  );
  ctx.fillStyle = '#fff3d6';
  ctx.font = '26px sans-serif';
  ctx.fillText(`Score ${Math.floor(world.score)}   •   Distance ${Math.floor(world.distance)} m   •   Corn ${world.corn}`, CFG.W / 2, 330);
  ctx.fillText(`Best score: ${Math.max(best, Math.floor(world.score))}`, CFG.W / 2, 366);
  ctx.fillStyle = CFG.hudGreen;
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Press R or click to run again', CFG.W / 2, 440);
}

export function drawWorld(ctx, world, screen, best) {
  const pal = palette(world);
  ctx.clearRect(0, 0, CFG.W, CFG.H);
  drawSky(ctx, world, pal);
  drawHills(ctx, world, pal);
  drawScenery(ctx, world, pal);
  drawGround(ctx, world, pal);
  for (const e of world.entities) drawEntity(ctx, world, e);
  drawFarmer(ctx, world);
  drawTurkey(ctx, world);
  if (world.flash > 0) {
    ctx.fillStyle = `rgba(255,40,30,${0.25 * world.flash})`;
    ctx.fillRect(0, 0, CFG.W, CFG.H);
  }
  if (screen === SCREEN_PLAY) drawHud(ctx, world, best);
  if (screen === SCREEN_TITLE) drawTitle(ctx, world, best);
  if (screen === SCREEN_OVER) drawOver(ctx, world, best);
}
