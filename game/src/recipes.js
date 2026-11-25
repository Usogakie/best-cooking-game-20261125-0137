// Golden Ladle Bistro — recipes.js
// The menu: every ingredient, what prep it needs, and every dish the
// order board can ask for. Nothing here knows about drawing or input.

export const INGREDIENTS = {
  bun:     { id: 'bun',     name: 'Bun',     prep: 'plate', color: '#e8a94e', dark: '#b97a24', key: '1' },
  patty:   { id: 'patty',   name: 'Patty',   prep: 'grill', color: '#8a5a33', dark: '#5f3a1d', key: '2', cookTime: 6 },
  cheese:  { id: 'cheese',  name: 'Cheese',  prep: 'plate', color: '#f7c948', dark: '#d9a41f', key: '3' },
  tomato:  { id: 'tomato',  name: 'Tomato',  prep: 'chop',  color: '#e5484d', dark: '#b02a2e', key: '4', chops: 3 },
  lettuce: { id: 'lettuce', name: 'Lettuce', prep: 'chop',  color: '#7bc950', dark: '#4c8a2e', key: '5', chops: 2 },
  onion:   { id: 'onion',   name: 'Onion',   prep: 'chop',  color: '#f3e9f7', dark: '#b48ec2', key: '6', chops: 3 },
};

export const BIN_ORDER = ['bun', 'patty', 'cheese', 'tomato', 'lettuce', 'onion'];

// A recipe is a multiset of ingredient ids: the plate must hold exactly
// these, in any order, to match the ticket.
export const RECIPES = [
  { id: 'classic', name: 'Classic Burger', needs: ['bun', 'patty', 'cheese', 'lettuce'], price: 120 },
  { id: 'melt',    name: 'Cheese Melt',    needs: ['bun', 'patty', 'cheese', 'cheese'],  price: 110 },
  { id: 'garden',  name: 'Garden Stack',   needs: ['bun', 'tomato', 'lettuce', 'onion', 'cheese'], price: 140 },
  { id: 'double',  name: 'Double Trouble', needs: ['bun', 'patty', 'patty', 'cheese', 'tomato'],   price: 180 },
  { id: 'smash',   name: 'Onion Smash',    needs: ['bun', 'patty', 'onion', 'cheese', 'lettuce'],  price: 150 },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) ?? RECIPES[0];
}

// Count each ingredient id in a list, for multiset comparison.
export function tally(list) {
  const counts = {};
  for (const item of list) counts[item] = (counts[item] ?? 0) + 1;
  return counts;
}

export function plateMatches(needs, plate) {
  const want = tally(needs);
  const have = tally(plate);
  const keys = new Set([...Object.keys(want), ...Object.keys(have)]);
  for (const key of keys) {
    if ((want[key] ?? 0) !== (have[key] ?? 0)) return false;
  }
  return true;
}

// How close the plate is to a recipe (0..1): used to tint the ticket
// that the plate is nearest to, so the player can see what to fix.
export function plateCloseness(needs, plate) {
  const want = tally(needs);
  const have = tally(plate);
  let hit = 0;
  let total = 0;
  for (const [key, count] of Object.entries(want)) {
    total += count;
    hit += Math.min(count, have[key] ?? 0);
  }
  const extra = Object.entries(have).reduce(
    (sum, [key, count]) => sum + Math.max(0, count - (want[key] ?? 0)),
    0,
  );
  if (total === 0) return 0;
  return Math.max(0, (hit - extra) / total);
}
