// Golden Ladle Bistro — input.js
// Mouse and keyboard: turn a click or a keypress into a kitchen action.
// Hit-testing reuses the station rectangles from kitchen.js, so the
// clickable areas are exactly the areas draw.js paints.

import { BIN_ORDER } from './recipes.js';
import {
  LAYOUT,
  addIngredient,
  binRect,
  chopBoard,
  servePlate,
  startDay,
  takeFromGrill,
  trashPlate,
} from './kitchen.js';

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function grillSlotRect(slot) {
  const g = LAYOUT.grill;
  return { x: g.x + 52 + slot * 168 - 70, y: g.y + 60, w: 140, h: 130 };
}

export function handleClick(state, x, y) {
  if (state.screen === 'title') {
    if (inside(x, y, { x: 480, y: 366, w: 320, h: 56 })) startDay(state);
    return;
  }
  if (state.screen === 'over') {
    if (inside(x, y, { x: 490, y: 424, w: 300, h: 52 })) startDay(state);
    return;
  }
  // Ingredient bins along the bottom counter.
  for (let i = 0; i < BIN_ORDER.length; i += 1) {
    if (inside(x, y, binRect(i))) {
      addIngredient(state, BIN_ORDER[i]);
      return;
    }
  }
  // Grill burners.
  for (let slot = 0; slot < 2; slot += 1) {
    if (inside(x, y, grillSlotRect(slot))) {
      takeFromGrill(state, slot);
      return;
    }
  }
  // Chopping board.
  if (inside(x, y, LAYOUT.board)) {
    chopBoard(state);
    return;
  }
  // Serve bell.
  if (inside(x, y, LAYOUT.bell)) {
    servePlate(state);
    return;
  }
  // Trash can clears the plate.
  if (inside(x, y, LAYOUT.trash)) {
    trashPlate(state);
    return;
  }
  // Clicking a layer on the plate removes that layer.
  if (inside(x, y, LAYOUT.plate) && state.plate.length > 0) {
    state.plate.pop();
  }
}

export function handleKey(state, key) {
  const lower = key.toLowerCase();
  if (state.screen === 'title' && (lower === 'enter' || lower === ' ')) {
    startDay(state);
    return;
  }
  if (state.screen === 'over' && (lower === 'enter' || lower === 'r')) {
    startDay(state);
    return;
  }
  if (state.screen !== 'play') return;
  const byKey = BIN_ORDER.find((id) => {
    const meta = { bun: '1', patty: '2', cheese: '3', tomato: '4', lettuce: '5', onion: '6' }[id];
    return meta === lower;
  });
  if (byKey) {
    addIngredient(state, byKey);
    return;
  }
  if (lower === ' ') {
    servePlate(state);
    return;
  }
  if (lower === 'c') {
    chopBoard(state);
    return;
  }
  if (lower === 'g') {
    const slot = state.grill.findIndex((g) => g && g.done);
    if (slot !== -1) takeFromGrill(state, slot);
    return;
  }
  if (lower === 'x') trashPlate(state);
}

// Convert a pointer event on the canvas to stage coordinates (the canvas
// is scaled by CSS, so the raw offset is not the game coordinate).
export function eventPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * 1280,
    y: ((event.clientY - rect.top) / rect.height) * 720,
  };
}
