// Golden Ladle Bistro — main.js
// Boot and the game loop. The canvas is fixed at 1280x720 and scaled by
// CSS; the loop steps the kitchen at a fixed 1/60 and redraws every frame.
// Two URL modes exist for testing and screenshots, both driven by the same
// state and renderer as real play:
//   ?shot=cover|start|rush|serve  — freeze one staged scene and draw it once
//   ?selftest=1                   — run the scripted rules test, print the
//                                  result into #testout for headless checks

import { createKitchen, updateKitchen } from './kitchen.js';
import { drawKitchen } from './draw.js';
import { eventPoint, handleClick, handleKey } from './input.js';
import { runSelfTest, stageScene } from './scenes.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const testout = document.getElementById('testout');
const params = new URLSearchParams(window.location.search);

// --- Tiny sound synth (WebAudio, no files) -------------------------------
let audioCtx = null;
function blip(freq, dur, type) {
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type ?? 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch {
    // Sound is garnish; a browser without audio still plays fine.
  }
}
window.addEventListener('pointerdown', () => blip(520, 0.07, 'triangle'), { once: true });

// --- Boot -----------------------------------------------------------------
let state = createKitchen();

if (params.get('selftest') === '1') {
  const result = runSelfTest();
  testout.textContent = `${result.summary} :: ${result.detail}`;
  document.title = result.summary;
  drawKitchen(ctx, state);
} else if (params.has('shot')) {
  // Frozen scene for screenshots: draw once, no loop, no timers.
  state = stageScene(params.get('shot'));
  drawKitchen(ctx, state);
  document.title = `Golden Ladle Bistro — ${params.get('shot')} scene`;
} else {
  // Real play.
  let last = performance.now();
  let announced = '';
  canvas.addEventListener('pointerdown', (event) => {
    const point = eventPoint(canvas, event);
    handleClick(state, point.x, point.y);
    blip(660, 0.06, 'triangle');
  });
  window.addEventListener('keydown', (event) => {
    if ([' ', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
    handleKey(state, event.key);
  });
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    updateKitchen(state, dt);
    drawKitchen(ctx, state);
    const line = state.screen === 'play'
      ? `Score ${state.score}, ${state.served} served, ${state.dayLeft.toFixed(0)} seconds left`
      : state.screen === 'over'
        ? `Day over. Score ${state.score}, ${state.served} dishes served.`
        : 'Golden Ladle Bistro. Press Enter or click Start the Day to play.';
    if (line !== announced) {
      announced = line;
      status.textContent = line;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
