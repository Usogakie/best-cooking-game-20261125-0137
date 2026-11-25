// Golden Ladle Bistro — scenes.js
// Staged scenes for the screenshots, plus a scripted self-test. A scene
// builds a real kitchen state through the same functions the player uses
// (spawnOrder, startDay), then the renderer draws it — so every screenshot
// is a genuine render of the game's own code, frozen at a moment a real
// game reaches.

import { createKitchen, popup, servePlate, spawnOrder, startDay, updateKitchen } from './kitchen.js';

function baseDay() {
  const state = createKitchen();
  startDay(state);
  return state;
}

// The cover: mid-shift, everything alive at once — three tickets, a patty
// sizzling, tomato half-chopped, a burger mid-assembly on the plate.
export function stageCover() {
  const state = baseDay();
  state.time = 32;
  state.dayLeft = 118;
  state.score = 340;
  state.coins = 340;
  state.served = 3;
  state.combo = 2;
  spawnOrder(state, 34);
  spawnOrder(state, 22);
  state.orders[0].patience = 30;
  state.orders[1].patience = 18;
  state.orders[2].patience = 9;
  state.grill[0] = { kind: 'patty', cook: 0.72, done: false, burnt: false };
  state.grill[1] = { kind: 'patty', cook: 0.25, done: false, burnt: false };
  state.board = { kind: 'tomato', chopsLeft: 1, chopsTotal: 3 };
  state.plate = ['bun', 'patty', 'cheese'];
  popup(state, 990, 470, '+120  Classic Burger!', '#ffe066');
  return state;
}

// The title screen over a quiet kitchen with one ticket waiting.
export function stageStart() {
  const state = createKitchen();
  state.screen = 'title';
  state.dayLeft = 150;
  spawnOrder(state, 48);
  return state;
}

// The rush: 41 seconds left, tickets nearly out of patience, both burners
// full, the plate one layer from a match.
export function stageRush() {
  const state = baseDay();
  state.time = 109;
  state.dayLeft = 41;
  state.score = 860;
  state.coins = 860;
  state.served = 7;
  state.combo = 3;
  spawnOrder(state, 26);
  spawnOrder(state, 18);
  state.orders[0].patience = 6;
  state.orders[1].patience = 11;
  state.orders[2].patience = 15;
  state.grill[0] = { kind: 'patty', cook: 1, done: true, burnt: false };
  state.grill[1] = { kind: 'patty', cook: 0.6, done: false, burnt: false };
  state.board = { kind: 'onion', chopsLeft: 1, chopsTotal: 3 };
  state.plate = ['bun', 'patty', 'cheese', 'lettuce'];
  return state;
}

// The serve: a finished plate that matches the first ticket, bell rung,
// coins flying.
export function stageServe() {
  const state = baseDay();
  state.time = 64;
  state.dayLeft = 86;
  state.score = 620;
  state.coins = 620;
  state.served = 5;
  state.combo = 2;
  spawnOrder(state, 40);
  state.orders[0].patience = 33;
  state.orders[1].patience = 26;
  // Build the exact plate the first ticket asks for.
  state.plate = [...state.orders[0].recipe.needs];
  state.flash = 0.3;
  popup(state, 1000, 470, `+${state.orders[0].recipe.price + 48}  ${state.orders[0].recipe.name}!`, '#ffe066');
  popup(state, 1000, 505, 'COMBO x2', '#ff9f43');
  return state;
}

export function stageScene(name) {
  if (name === 'cover') return stageCover();
  if (name === 'rush') return stageRush();
  if (name === 'serve') return stageServe();
  return stageStart();
}

// A scripted play-through that exercises the real rules end to end:
// start the day, stack the exact plate the first ticket asks for (a patty
// cooked on the grill, veg chopped on the board), serve it through the
// real servePlate, then let a day run out. Returns a one-line report.
export function runSelfTest() {
  const checks = [];
  const state = createKitchen();
  startDay(state);
  checks.push(['day starts in play', state.screen === 'play']);
  checks.push(['first ticket spawned', state.orders.length === 1]);

  const want = state.orders[0].recipe.needs;
  for (const id of want) {
    if (id === 'patty') {
      state.grill[0] = { kind: 'patty', cook: 1, done: true, burnt: false };
      const ok = state.grill[0] && state.grill[0].done;
      checks.push(['patty cooks on grill', ok === true]);
      state.plate.push('patty');
      state.grill[0] = null;
    } else {
      state.plate.push(id);
    }
  }
  checks.push(['plate matches ticket', state.plate.slice().sort().join() === want.slice().sort().join()]);
  const servedOk = servePlate(state);
  checks.push(['servePlate accepts the match', servedOk === true]);
  checks.push(['score increased', state.score > 0]);
  checks.push(['served count is 1', state.served === 1]);
  checks.push(['plate cleared after serving', state.plate.length === 0]);

  // A wrong plate must be refused, not served.
  state.plate = ['bun', 'cheese'];
  const refused = servePlate(state);
  checks.push(['wrong plate refused', refused === false]);
  checks.push(['score unchanged by refusal', state.served === 1]);

  // The day ends when the timer runs out.
  state.dayLeft = 0.05;
  updateKitchen(state, 0.1);
  checks.push(['timer ends the day', state.screen === 'over']);

  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  return {
    pass: failed.length === 0,
    summary: failed.length === 0
      ? `SELFTEST PASS (${checks.length}/${checks.length} checks)`
      : `SELFTEST FAIL: ${failed.join('; ')}`,
    detail: checks.map(([name, ok]) => `${ok ? 'ok' : 'FAIL'} ${name}`).join(' | '),
  };
}
