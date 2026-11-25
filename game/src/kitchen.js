// Golden Ladle Bistro — kitchen.js
// The kitchen state and its rules: orders, the grill, the chopping board,
// the plate, serving and scoring. Drawing lives in draw.js, input in
// input.js; this file is the part you could unit-test without a canvas.

import { INGREDIENTS, RECIPES, plateMatches } from './recipes.js';

export const DAY_LENGTH = 150;
export const MAX_ORDERS = 3;
export const PLATE_MAX = 6;
export const GRILL_SLOTS = 2;

// Fixed station rectangles on the 1280x720 stage, shared by draw and input.
export const LAYOUT = {
  grill: { x: 48, y: 218, w: 372, h: 218 },
  board: { x: 452, y: 218, w: 372, h: 218 },
  pass: { x: 856, y: 218, w: 376, h: 218 },
  bins: { x: 48, y: 556, w: 1010, h: 132 },
  bell: { x: 1108, y: 300, w: 96, h: 96 },
  plate: { x: 900, y: 300, w: 180, h: 110 },
  trash: { x: 1096, y: 606, w: 120, h: 64 },
};

export function createKitchen() {
  return {
    screen: 'title',
    time: 0,
    dayLeft: DAY_LENGTH,
    score: 0,
    coins: 0,
    served: 0,
    failed: 0,
    combo: 0,
    bestCombo: 0,
    hearts: 3,
    orders: [],
    grill: [null, null],
    board: null,
    plate: [],
    popups: [],
    steam: [],
    message: '',
    messageLife: 0,
    shake: 0,
    flash: 0,
    nextOrderIn: 2.5,
    orderSeq: 1,
    rngState: 1234567,
    overReason: '',
  };
}

// Tiny deterministic RNG so staged scenes and replays agree.
export function nextRandom(state) {
  state.rngState = (state.rngState * 1103515245 + 12345) & 0x7fffffff;
  return state.rngState / 0x7fffffff;
}

export function pickRecipe(state, avoidId) {
  const pool = RECIPES.filter((r) => r.id !== avoidId);
  const index = Math.floor(nextRandom(state) * pool.length);
  return pool[index];
}

export function spawnOrder(state, patienceSeconds) {
  const last = state.orders[state.orders.length - 1];
  const recipe = pickRecipe(state, last ? last.recipe.id : null);
  const patience = patienceSeconds ?? Math.max(28, 52 - state.served * 1.5);
  state.orders.push({
    id: state.orderSeq,
    key: `order-${state.orderSeq}`,
    recipe,
    patience,
    maxPatience: patience,
    born: state.time,
  });
  state.orderSeq += 1;
}

export function startDay(state) {
  const fresh = createKitchen();
  fresh.screen = 'play';
  fresh.rngState = (Date.now() % 2147483647) | 1;
  Object.assign(state, fresh);
  spawnOrder(state);
  state.nextOrderIn = 9;
}

export function popup(state, x, y, text, color) {
  state.popups.push({ x, y, text, color: color ?? '#fff7d6', life: 1.2 });
}

export function say(state, text) {
  state.message = text;
  state.messageLife = 2.4;
}

// --- Player actions -------------------------------------------------------

export function addIngredient(state, id) {
  if (state.screen !== 'play') return false;
  const item = INGREDIENTS[id];
  if (!item) return false;
  if (item.prep === 'plate') {
    if (state.plate.length >= PLATE_MAX) {
      say(state, 'Plate is full! Serve it or trash something.');
      return false;
    }
    state.plate.push(id);
    puff(state, binCentre(id).x, binCentre(id).y - 40);
    return true;
  }
  if (item.prep === 'grill') {
    const slot = state.grill.findIndex((g) => g === null);
    if (slot === -1) {
      say(state, 'Grill is full! Wait for a patty to cook.');
      return false;
    }
    state.grill[slot] = { kind: id, cook: 0, done: false, burnt: false };
    return true;
  }
  // chop
  if (state.board) {
    say(state, 'Board is busy! Finish chopping first.');
    return false;
  }
  state.board = { kind: id, chopsLeft: item.chops, chopsTotal: item.chops };
  return true;
}

export function takeFromGrill(state, slot) {
  const patty = state.grill[slot];
  if (!patty) return false;
  if (!patty.done) {
    say(state, 'Still raw — let it sizzle a little longer.');
    return false;
  }
  if (patty.burnt) {
    state.grill[slot] = null;
    popup(state, 234, 300, 'Burnt! Tossed.', '#ff9a8a');
    return true;
  }
  if (state.plate.length >= PLATE_MAX) {
    say(state, 'Plate is full! Serve it or trash something.');
    return false;
  }
  state.plate.push('patty');
  state.grill[slot] = null;
  popup(state, 234, 300, 'Patty on the plate!', '#ffd97a');
  return true;
}

export function chopBoard(state) {
  const item = state.board;
  if (!item) return false;
  item.chopsLeft -= 1;
  puff(state, 638, 300);
  if (item.chopsLeft > 0) return true;
  if (state.plate.length >= PLATE_MAX) {
    say(state, 'Plate is full! Serve it or trash something.');
    state.board = { kind: item.kind, chopsLeft: 0, chopsTotal: item.chopsTotal };
    return false;
  }
  state.plate.push(item.kind);
  popup(state, 638, 300, `${INGREDIENTS[item.kind].name} chopped!`, '#b8f29a');
  state.board = null;
  return true;
}

export function removeFromPlate(state, index) {
  if (index < 0 || index >= state.plate.length) return false;
  state.plate.splice(index, 1);
  return true;
}

export function trashPlate(state) {
  if (state.plate.length === 0) return false;
  state.plate = [];
  state.combo = 0;
  say(state, 'Plate cleared.');
  return true;
}

export function servePlate(state) {
  if (state.screen !== 'play') return false;
  if (state.plate.length === 0) {
    say(state, 'Nothing on the plate yet!');
    return false;
  }
  const matchIndex = state.orders.findIndex((o) => plateMatches(o.recipe.needs, state.plate));
  if (matchIndex === -1) {
    state.shake = 0.35;
    state.combo = 0;
    say(state, 'No ticket matches this plate — check the order board!');
    return false;
  }
  const order = state.orders[matchIndex];
  state.orders.splice(matchIndex, 1);
  const speedBonus = Math.round((order.patience / order.maxPatience) * 60);
  const comboBonus = state.combo * 15;
  const earned = order.recipe.price + speedBonus + comboBonus;
  state.score += earned;
  state.coins += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.flash = 0.4;
  popup(state, 1000, 280, `+${earned}  ${order.recipe.name}!`, '#ffe066');
  if (state.combo >= 2) popup(state, 1000, 320, `COMBO x${state.combo}`, '#ff9f43');
  state.plate = [];
  state.nextOrderIn = Math.min(state.nextOrderIn, 4);
  return true;
}

// --- Simulation -----------------------------------------------------------

export function puff(state, x, y) {
  for (let i = 0; i < 6; i += 1) {
    state.steam.push({
      x: x + (nextRandom(state) - 0.5) * 30,
      y,
      vx: (nextRandom(state) - 0.5) * 12,
      vy: -22 - nextRandom(state) * 18,
      life: 0.7 + nextRandom(state) * 0.5,
      max: 1.2,
    });
  }
}

export function updateKitchen(state, dt) {
  if (state.screen !== 'play') return;
  state.time += dt;
  state.dayLeft -= dt;
  if (state.dayLeft <= 0) {
    state.dayLeft = 0;
    state.screen = 'over';
    state.overReason = state.hearts > 0 ? 'Day complete!' : 'The kitchen closed early.';
    return;
  }
  // Grill: cook, then burn if forgotten.
  for (let slot = 0; slot < state.grill.length; slot += 1) {
    const patty = state.grill[slot];
    if (!patty) continue;
    patty.cook += dt / INGREDIENTS.patty.cookTime;
    if (patty.cook >= 1 && !patty.done) {
      patty.done = true;
      popup(state, 150 + slot * 150, 300, 'Patty ready!', '#ffd97a');
    }
    if (patty.cook >= 1.9) patty.burnt = true;
  }
  // Orders: patience drains; an expired ticket costs a heart.
  for (let i = state.orders.length - 1; i >= 0; i -= 1) {
    const order = state.orders[i];
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders.splice(i, 1);
      state.failed += 1;
      state.hearts -= 1;
      state.combo = 0;
      state.shake = 0.5;
      say(state, `${order.recipe.name} walked out! -1 heart`);
      if (state.hearts <= 0) {
        state.screen = 'over';
        state.overReason = 'Too many walk-outs — the bistro lost its stars.';
        return;
      }
    }
  }
  // New tickets arrive faster as the day goes on.
  state.nextOrderIn -= dt;
  if (state.nextOrderIn <= 0 && state.orders.length < MAX_ORDERS) {
    spawnOrder(state);
    const rush = Math.max(0, 1 - state.dayLeft / DAY_LENGTH);
    state.nextOrderIn = 13 - rush * 5;
  }
  // Cosmetics.
  if (state.messageLife > 0) state.messageLife -= dt;
  if (state.shake > 0) state.shake -= dt;
  if (state.flash > 0) state.flash -= dt;
  for (let i = state.popups.length - 1; i >= 0; i -= 1) {
    state.popups[i].life -= dt;
    state.popups[i].y -= 26 * dt;
    if (state.popups[i].life <= 0) state.popups.splice(i, 1);
  }
  for (let i = state.steam.length - 1; i >= 0; i -= 1) {
    const s = state.steam[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt;
    if (s.life <= 0) state.steam.splice(i, 1);
  }
  // Idle sizzle steam over a cooking patty.
  if (Math.random() < dt * 6) {
    const cooking = state.grill.findIndex((g) => g && !g.done);
    if (cooking !== -1) puff(state, 150 + cooking * 150, 330);
  }
}

// Bin centres for popups and keyboard hints.
export function binCentre(id) {
  const index = ['bun', 'patty', 'cheese', 'tomato', 'lettuce', 'onion'].indexOf(id);
  const { x, y, w } = LAYOUT.bins;
  const bw = w / 6;
  return { x: x + bw * index + bw / 2, y: y + 58 };
}

export function binRect(index) {
  const { x, y, w, h } = LAYOUT.bins;
  const bw = w / 6;
  return { x: x + bw * index + 6, y: y + 8, w: bw - 12, h: h - 16 };
}
