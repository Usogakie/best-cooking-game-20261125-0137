// Golden Ladle Bistro — draw.js
// Every pixel of the kitchen: wall, order tickets, grill, chopping board,
// pass counter, ingredient bins and the food itself. All art is drawn with
// canvas shapes — no image files, no network.

import { INGREDIENTS, BIN_ORDER, plateCloseness } from './recipes.js';
import { LAYOUT, binRect } from './kitchen.js';

const W = 1280;
const H = 720;

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight ?? 700} ${size}px "Trebuchet MS", "Segoe UI", Verdana, sans-serif`;
  ctx.textAlign = align ?? 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function shadowText(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.font = `${weight ?? 700} ${size}px "Trebuchet MS", "Segoe UI", Verdana, sans-serif`;
  ctx.textAlign = align ?? 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x + 2, y + 2);
  text(ctx, str, x, y, size, color, weight, align);
}

// --- Food icons -----------------------------------------------------------

export function drawIngredient(ctx, id, x, y, size, opts) {
  const o = opts ?? {};
  const s = size / 64;
  ctx.save();
  ctx.translate(x, y);
  if (o.shadow !== false) {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.42, size * 0.42, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (id === 'bun') {
    ctx.fillStyle = '#e8a94e';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.08, size * 0.44, size * 0.3, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#f6cf8a';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.05, size * 0.36, size * 0.2, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fff3d0';
    for (const [dx, dy] of [[-14, -8], [0, -14], [14, -8], [-7, 2], [8, 2]]) {
      ctx.beginPath();
      ctx.ellipse(dx * s, dy * s, 2.4 * s, 1.6 * s, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#c98a2e';
    rr(ctx, -size * 0.44, size * 0.08, size * 0.88, size * 0.16, size * 0.08);
    ctx.fill();
  } else if (id === 'patty') {
    const cooked = o.cooked ?? 1;
    ctx.fillStyle = cooked >= 1 ? '#7a4a26' : '#a86a4a';
    rr(ctx, -size * 0.46, -size * 0.14, size * 0.92, size * 0.34, size * 0.16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2.5 * s;
    for (const dx of [-20, 0, 20]) {
      ctx.beginPath();
      ctx.moveTo(dx * s - 4 * s, -size * 0.1);
      ctx.lineTo(dx * s + 4 * s, size * 0.16);
      ctx.stroke();
    }
    if (o.burnt) {
      ctx.fillStyle = 'rgba(20,10,5,0.55)';
      rr(ctx, -size * 0.46, -size * 0.14, size * 0.92, size * 0.34, size * 0.16);
      ctx.fill();
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.moveTo(-size * 0.44, size * 0.16);
    ctx.lineTo(size * 0.44, size * 0.16);
    ctx.lineTo(size * 0.44, -size * 0.02);
    ctx.lineTo(-size * 0.44, -size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e0a92a';
    for (const [dx, dy] of [[-14, 4], [6, 8], [16, -2]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'tomato') {
    ctx.fillStyle = '#e5484d';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f28b8e';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcfd1';
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * size * 0.16, Math.sin(a) * size * 0.16, size * 0.1, size * 0.05, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#e5484d';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#7bc950';
    ctx.beginPath();
    for (let i = 0; i < 7; i += 1) {
      const a = (i / 7) * Math.PI * 2;
      ctx.ellipse(Math.cos(a) * size * 0.2, Math.sin(a) * size * 0.14, size * 0.24, size * 0.13, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#a8e07e';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.26, size * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'onion') {
    ctx.fillStyle = '#f3e9f7';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a6d8';
    ctx.lineWidth = 2.5 * s;
    for (const r of [0.28, 0.18, 0.09]) {
      ctx.beginPath();
      ctx.arc(0, 0, size * r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// A plate stack: layers pile up like a sandwich, bottom bun first.
export function drawPlateStack(ctx, plate, x, y, size) {
  const layerH = size * 0.16;
  let top = y;
  ctx.fillStyle = '#f4f6f8';
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.1, size * 0.62, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#dfe6ea';
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.06, size * 0.5, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < plate.length; i += 1) {
    const id = plate[i];
    const ly = y - size * 0.02 - i * layerH;
    if (id === 'bun' && i === 0) {
      drawIngredient(ctx, 'bun', x, ly - size * 0.1, size * 0.9, { shadow: false });
    } else if (id === 'patty') {
      ctx.fillStyle = '#7a4a26';
      rr(ctx, x - size * 0.44, ly - size * 0.14, size * 0.88, size * 0.2, size * 0.08);
      ctx.fill();
    } else if (id === 'cheese') {
      ctx.fillStyle = '#f7c948';
      ctx.beginPath();
      ctx.moveTo(x - size * 0.46, ly);
      ctx.lineTo(x + size * 0.46, ly);
      ctx.lineTo(x + size * 0.4, ly - size * 0.12);
      ctx.lineTo(x - size * 0.4, ly - size * 0.12);
      ctx.closePath();
      ctx.fill();
    } else if (id === 'tomato') {
      ctx.fillStyle = '#e5484d';
      rr(ctx, x - size * 0.4, ly - size * 0.12, size * 0.8, size * 0.14, size * 0.07);
      ctx.fill();
    } else if (id === 'lettuce') {
      ctx.fillStyle = '#7bc950';
      for (let k = 0; k < 5; k += 1) {
        ctx.beginPath();
        ctx.ellipse(x - size * 0.34 + k * size * 0.17, ly - size * 0.05, size * 0.12, size * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === 'onion') {
      ctx.strokeStyle = '#c9a6d8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, ly - size * 0.05, size * 0.34, size * 0.07, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    top = ly;
  }
  return top;
}

// --- Kitchen ----------------------------------------------------------------

function drawWall(ctx, t) {
  ctx.fillStyle = '#f6e3c2';
  ctx.fillRect(0, 0, W, 560);
  ctx.fillStyle = '#e8cfa3';
  for (let y = 64; y < 176; y += 32) {
    ctx.fillRect(0, y, W, 2);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let x = 0; x < W; x += 64) {
    for (let y = 66; y < 176; y += 32) {
      ctx.fillRect(x + ((y / 32) % 2) * 32, y, 2, 30);
    }
  }
  // Window with a sunny street.
  ctx.fillStyle = '#8a5a33';
  rr(ctx, 560, 76, 170, 92, 10);
  ctx.fill();
  ctx.fillStyle = '#bfe6f7';
  rr(ctx, 568, 84, 154, 76, 6);
  ctx.fill();
  ctx.fillStyle = '#ffd97a';
  ctx.beginPath();
  ctx.arc(690, 106, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8ecb7a';
  ctx.beginPath();
  ctx.ellipse(600, 158, 40, 10, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(680, 158, 34, 9, 0, Math.PI, 0);
  ctx.fill();
  // Shelf with jars and a hanging pan rail.
  ctx.fillStyle = '#a9713f';
  ctx.fillRect(48, 176, 380, 10);
  const jarColors = ['#e5484d', '#7bc950', '#f7c948', '#f3e9f7'];
  jarColors.forEach((c, i) => {
    ctx.fillStyle = c;
    rr(ctx, 70 + i * 52, 138, 34, 38, 6);
    ctx.fill();
    ctx.fillStyle = '#5f3a1d';
    ctx.fillRect(70 + i * 52 + 4, 132, 26, 8);
  });
  ctx.fillStyle = '#3d3d3d';
  ctx.fillRect(880, 84, 330, 6);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = '#c8ccd2';
    ctx.beginPath();
    ctx.arc(920 + i * 110, 118, 26, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(916 + i * 110, 92, 8, 26);
  }
  // Poster: the bistro's motto.
  ctx.fillStyle = '#fff7e6';
  rr(ctx, 1080, 120, 150, 56, 8);
  ctx.fill();
  ctx.strokeStyle = '#d9a41f';
  ctx.lineWidth = 2;
  rr(ctx, 1080, 120, 150, 56, 8);
  ctx.stroke();
  text(ctx, 'FRESH • FAST', 1155, 143, 15, '#8a5a33', 800, 'center');
  text(ctx, 'TASTY', 1155, 164, 15, '#e5484d', 800, 'center');
}

function drawTicket(ctx, order, x, y, w, h, state) {
  const frac = Math.max(0, order.patience / order.maxPatience);
  const urgent = frac < 0.35;
  const close = state.plate.length > 0 ? plateCloseness(order.recipe.needs, state.plate) : 0;
  ctx.save();
  if (urgent && state.screen === 'play') {
    ctx.translate(Math.sin(state.time * 22) * 1.5, 0);
  }
  ctx.fillStyle = urgent ? '#ffe3de' : '#fffdf4';
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = close > 0.85 ? '#2ecc71' : urgent ? '#e5484d' : '#d9c9a3';
  ctx.lineWidth = close > 0.85 ? 3 : 2;
  rr(ctx, x, y, w, h, 10);
  ctx.stroke();
  text(ctx, `#${order.id}  ${order.recipe.name}`, x + 12, y + 22, 15, '#4a3220', 800);
  text(ctx, `$${order.recipe.price}`, x + w - 12, y + 22, 15, '#b97a24', 800, 'right');
  order.recipe.needs.forEach((id, i) => {
    drawIngredient(ctx, id, x + 26 + i * 38, y + 48, 30, { shadow: false });
  });
  // Patience bar.
  ctx.fillStyle = '#e8ddc9';
  rr(ctx, x + 12, y + h - 16, w - 24, 8, 4);
  ctx.fill();
  ctx.fillStyle = urgent ? '#e5484d' : frac < 0.6 ? '#f39c12' : '#2ecc71';
  rr(ctx, x + 12, y + h - 16, (w - 24) * frac, 8, 4);
  ctx.fill();
  if (close > 0.85) {
    text(ctx, '✓ MATCH!', x + w - 12, y + h - 24, 13, '#27ae60', 800, 'right');
  }
  ctx.restore();
}

function drawGrill(ctx, state) {
  const g = LAYOUT.grill;
  ctx.fillStyle = '#6b4a2f';
  rr(ctx, g.x - 8, g.y - 8, g.w + 16, g.h + 16, 14);
  ctx.fill();
  text(ctx, 'GRILL', g.x + 16, g.y + 26, 16, '#ffd97a', 800);
  ctx.fillStyle = '#3a3f46';
  rr(ctx, g.x + 12, g.y + 38, g.w - 24, g.h - 56, 10);
  ctx.fill();
  for (let slot = 0; slot < 2; slot += 1) {
    const bx = g.x + 52 + slot * 168;
    const by = g.y + 118;
    ctx.fillStyle = '#23272d';
    ctx.beginPath();
    ctx.ellipse(bx, by, 66, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a4f57';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(bx - 52, by + i * 16);
      ctx.lineTo(bx + 52, by + i * 16);
      ctx.stroke();
    }
    const patty = state.grill[slot];
    if (patty) {
      const heat = Math.min(1, patty.cook);
      drawIngredient(ctx, 'patty', bx, by - 6, 96, { cooked: heat, burnt: patty.burnt });
      if (patty.done && !patty.burnt) {
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(bx + 44, by - 44, 13, 0, Math.PI * 2);
        ctx.fill();
        text(ctx, '✓', bx + 44, by - 39, 15, '#ffffff', 800, 'center');
      }
      if (patty.burnt) {
        text(ctx, 'BURNT!', bx, by - 58, 14, '#ff9a8a', 800, 'center');
      } else {
        ctx.fillStyle = '#e8ddc9';
        rr(ctx, bx - 44, by + 52, 88, 7, 3);
        ctx.fill();
        ctx.fillStyle = patty.done ? '#2ecc71' : '#f39c12';
        rr(ctx, bx - 44, by + 52, 88 * Math.min(1, patty.cook), 7, 3);
        ctx.fill();
        text(ctx, patty.done ? 'READY — click!' : 'sizzling…', bx, by + 76, 12, '#ffd97a', 700, 'center');
      }
    } else {
      text(ctx, 'click a patty', bx, by + 4, 13, '#aab2bb', 600, 'center');
      text(ctx, 'to start cooking', bx, by + 22, 13, '#aab2bb', 600, 'center');
    }
  }
  text(ctx, '2 = patty', g.x + g.w - 16, g.y + 26, 13, '#c9a06a', 600, 'right');
}

function drawBoard(ctx, state) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#6b4a2f';
  rr(ctx, b.x - 8, b.y - 8, b.w + 16, b.h + 16, 14);
  ctx.fill();
  text(ctx, 'CHOPPING BOARD', b.x + 16, b.y + 26, 16, '#ffd97a', 800);
  ctx.fillStyle = '#d9a86c';
  rr(ctx, b.x + 40, b.y + 52, b.w - 80, b.h - 84, 12);
  ctx.fill();
  ctx.fillStyle = '#c08d4e';
  rr(ctx, b.x + 52, b.y + 64, b.w - 104, b.h - 108, 8);
  ctx.fill();
  const item = state.board;
  if (item) {
    drawIngredient(ctx, item.kind, b.x + b.w / 2, b.y + 118, 110);
    const done = item.chopsTotal - item.chopsLeft;
    for (let i = 0; i < item.chopsTotal; i += 1) {
      ctx.fillStyle = i < done ? '#2ecc71' : '#e8ddc9';
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2 - 30 + i * 30, b.y + 168, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    text(ctx, `click to chop (${item.chopsLeft} left)`, b.x + b.w / 2, b.y + 196, 14, '#5f3a1d', 700, 'center');
  } else {
    // A knife resting on the board.
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + 120);
    ctx.rotate(-0.5);
    ctx.fillStyle = '#c8ccd2';
    rr(ctx, -70, -12, 110, 24, 12);
    ctx.fill();
    ctx.fillStyle = '#5f3a1d';
    rr(ctx, 40, -10, 46, 20, 8);
    ctx.fill();
    ctx.restore();
    text(ctx, 'click tomato, lettuce or onion', b.x + b.w / 2, b.y + 196, 14, '#7a5a34', 600, 'center');
  }
}

function drawPass(ctx, state) {
  const p = LAYOUT.pass;
  ctx.fillStyle = '#6b4a2f';
  rr(ctx, p.x - 8, p.y - 8, p.w + 16, p.h + 16, 14);
  ctx.fill();
  text(ctx, 'PASS — PLATE & SERVE', p.x + 16, p.y + 26, 16, '#ffd97a', 800);
  // The plate.
  const plate = LAYOUT.plate;
  if (state.plate.length === 0) {
    ctx.fillStyle = '#f4f6f8';
    ctx.beginPath();
    ctx.ellipse(plate.x + plate.w / 2, plate.y + 66, 84, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, 'empty plate', plate.x + plate.w / 2, plate.y + 100, 13, '#c9a06a', 600, 'center');
  } else {
    drawPlateStack(ctx, state.plate, plate.x + plate.w / 2, plate.y + 66, 120);
    text(ctx, `${state.plate.length} / ${6} layers`, plate.x + plate.w / 2, plate.y + 104, 12, '#ffd97a', 700, 'center');
  }
  // The serve bell.
  const bell = LAYOUT.bell;
  const ringing = state.flash > 0;
  ctx.save();
  if (ringing) ctx.translate(Math.sin(state.time * 40) * 2, 0);
  ctx.fillStyle = '#f7c948';
  ctx.beginPath();
  ctx.arc(bell.x + bell.w / 2, bell.y + bell.h / 2 - 6, 34, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(bell.x + bell.w / 2 - 34, bell.y + bell.h / 2 - 8, 68, 8);
  ctx.fillStyle = '#8a5a33';
  rr(ctx, bell.x + bell.w / 2 - 44, bell.y + bell.h - 16, 88, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#5f3a1d';
  ctx.beginPath();
  ctx.arc(bell.x + bell.w / 2, bell.y + bell.h / 2 - 42, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  text(ctx, 'SERVE!', bell.x + bell.w / 2, bell.y + bell.h + 2, 15, '#ffd97a', 800, 'center');
  text(ctx, 'Space', bell.x + bell.w / 2, bell.y + bell.h + 20, 11, '#c9a06a', 600, 'center');
}

function drawBins(ctx, state) {
  const bins = LAYOUT.bins;
  ctx.fillStyle = '#8a5a33';
  rr(ctx, 38, 546, 1204, 152, 16);
  ctx.fill();
  ctx.fillStyle = '#a9713f';
  ctx.fillRect(38, 546, 1204, 12);
  BIN_ORDER.forEach((id, i) => {
    const r = binRect(i);
    ctx.fillStyle = '#fff7e6';
    rr(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#d9c9a3';
    ctx.lineWidth = 2;
    rr(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.stroke();
    drawIngredient(ctx, id, r.x + r.w / 2, r.y + 46, 62);
    const meta = INGREDIENTS[id];
    text(ctx, meta.name, r.x + r.w / 2, r.y + 92, 15, '#4a3220', 800, 'center');
    const hint = meta.prep === 'grill' ? '→ grill' : meta.prep === 'chop' ? '→ board' : '→ plate';
    text(ctx, `${meta.key} ${hint}`, r.x + r.w / 2, r.y + 110, 12, '#8a7a5a', 600, 'center');
  });
  // Trash can.
  const t = LAYOUT.trash;
  ctx.fillStyle = '#5a6068';
  rr(ctx, t.x, t.y, t.w, t.h, 8);
  ctx.fill();
  ctx.fillStyle = '#7a828c';
  ctx.fillRect(t.x + 6, t.y - 4, t.w - 12, 8);
  text(ctx, 'TRASH', t.x + t.w / 2, t.y + 40, 13, '#ffffff', 800, 'center');
}

function drawHud(ctx, state) {
  ctx.fillStyle = '#3d2b1a';
  ctx.fillRect(0, 0, W, 56);
  // Hearts.
  for (let i = 0; i < 3; i += 1) {
    const x = 30 + i * 34;
    ctx.fillStyle = i < state.hearts ? '#e5484d' : '#5a4632';
    ctx.beginPath();
    ctx.arc(x, 26, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 11, 26, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 9, 30);
    ctx.lineTo(x + 22, 30);
    ctx.lineTo(x + 6, 48);
    ctx.closePath();
    ctx.fill();
  }
  // Day timer — big, centre.
  const mins = Math.floor(state.dayLeft / 60);
  const secs = Math.floor(state.dayLeft % 60);
  const low = state.dayLeft < 30;
  const timerColor = low ? '#ff6b5e' : '#ffe066';
  shadowText(ctx, `${mins}:${String(secs).padStart(2, '0')}`, W / 2, 40, 34, timerColor, 800, 'center');
  text(ctx, 'DAY TIMER', W / 2 - 118, 38, 13, '#c9a06a', 700, 'right');
  // Score, coins, served.
  text(ctx, `SCORE ${state.score}`, W - 300, 36, 20, '#ffffff', 800, 'right');
  text(ctx, `🪙 ${state.coins}`, W - 170, 36, 20, '#ffd97a', 800, 'right');
  text(ctx, `served ${state.served}`, W - 24, 36, 16, '#c9a06a', 700, 'right');
  if (state.combo >= 2) {
    text(ctx, `COMBO x${state.combo}`, W - 300, 52, 13, '#ff9f43', 800, 'right');
  }
}

function drawTickets(ctx, state) {
  text(ctx, 'ORDER BOARD', 48, 92, 15, '#8a5a33', 800);
  text(ctx, 'match a ticket, then ring the bell', 48, 110, 12, '#a98f68', 600);
  for (let i = 0; i < 3; i += 1) {
    const x = 48 + i * 404;
    const order = state.orders[i];
    if (order) {
      drawTicket(ctx, order, x, 118, 388, 92, state);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      rr(ctx, x, 118, 388, 92, 10);
      ctx.fill();
      ctx.strokeStyle = '#d9c9a3';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      rr(ctx, x, 118, 388, 92, 10);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'waiting for the next ticket…', x + 194, 168, 14, '#a98f68', 600, 'center');
    }
  }
}

function drawPopups(ctx, state) {
  for (const p of state.popups) {
    ctx.globalAlpha = Math.min(1, p.life);
    shadowText(ctx, p.text, p.x, p.y, 20, p.color, 800, 'center');
    ctx.globalAlpha = 1;
  }
  for (const s of state.steam) {
    ctx.globalAlpha = Math.max(0, s.life / s.max) * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (state.messageLife > 0 && state.message) {
    ctx.globalAlpha = Math.min(1, state.messageLife);
    ctx.fillStyle = 'rgba(61,43,26,0.92)';
    const w = ctx.measureText(state.message).width + 36;
    rr(ctx, W / 2 - 260, 448, 520, 40, 20);
    ctx.fill();
    text(ctx, state.message, W / 2, 474, 16, '#fff7d6', 700, 'center');
    ctx.globalAlpha = 1;
  }
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(40,24,12,0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff7e6';
  rr(ctx, 290, 120, 700, 330, 20);
  ctx.fill();
  ctx.strokeStyle = '#d9a41f';
  ctx.lineWidth = 3;
  rr(ctx, 290, 120, 700, 330, 20);
  ctx.stroke();
  shadowText(ctx, '🍔  GOLDEN LADLE', 640, 196, 46, '#e5484d', 800, 'center');
  shadowText(ctx, 'BISTRO', 640, 246, 46, '#b97a24', 800, 'center');
  text(ctx, 'A rush-hour cooking game', 640, 282, 20, '#8a5a33', 600, 'center');
  text(ctx, 'Take tickets • grill patties • chop veg • stack the plate • ring the bell', 640, 314, 16, '#4a3220', 600, 'center');
  text(ctx, 'Click the bins (or press 1–6) — serve before tickets walk out!', 640, 340, 16, '#4a3220', 600, 'center');
  ctx.fillStyle = '#2ecc71';
  rr(ctx, 480, 366, 320, 56, 14);
  ctx.fill();
  text(ctx, '▶  START THE DAY', 640, 402, 22, '#ffffff', 800, 'center');
  text(ctx, '150 seconds • 3 hearts • combos pay extra', 640, 440, 14, '#8a7a5a', 600, 'center');
}

function drawOver(ctx, state) {
  ctx.fillStyle = 'rgba(40,24,12,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff7e6';
  rr(ctx, 330, 150, 620, 340, 20);
  ctx.fill();
  ctx.strokeStyle = '#d9a41f';
  ctx.lineWidth = 3;
  rr(ctx, 330, 150, 620, 340, 20);
  ctx.stroke();
  shadowText(ctx, state.overReason || 'Day complete!', 640, 224, 34, '#4a3220', 800, 'center');
  text(ctx, `SCORE  ${state.score}`, 640, 282, 28, '#e5484d', 800, 'center');
  text(ctx, `Dishes served: ${state.served}     Walk-outs: ${state.failed}`, 640, 322, 18, '#4a3220', 700, 'center');
  text(ctx, `Best combo: x${state.bestCombo}     Coins earned: ${state.coins}`, 640, 352, 18, '#4a3220', 700, 'center');
  const stars = state.served >= 12 ? '★★★' : state.served >= 8 ? '★★☆' : state.served >= 4 ? '★☆☆' : '☆☆☆';
  text(ctx, stars, 640, 402, 36, '#f7c948', 800, 'center');
  ctx.fillStyle = '#2ecc71';
  rr(ctx, 490, 424, 300, 52, 14);
  ctx.fill();
  text(ctx, '↻  COOK AGAIN', 640, 458, 20, '#ffffff', 800, 'center');
}

export function drawKitchen(ctx, state) {
  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake * 24, (Math.random() - 0.5) * state.shake * 24);
  }
  drawWall(ctx, state.time);
  drawTickets(ctx, state);
  drawGrill(ctx, state);
  drawBoard(ctx, state);
  drawPass(ctx, state);
  drawBins(ctx, state);
  drawHud(ctx, state);
  drawPopups(ctx, state);
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255, 224, 102, ${state.flash * 0.5})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (state.screen === 'title') drawTitle(ctx, state);
  if (state.screen === 'over') drawOver(ctx, state);
  ctx.restore();
}
