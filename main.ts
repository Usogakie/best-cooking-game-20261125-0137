// Golden Ladle Bistro — the hand-in program (Node 22, standard library only).
//
// It hands the entry in: copy this repository's game/ and screenshots/
// beside this file into the output directory, then write dossier.json
// there with the vendored make.fun library. The grader runs it twice and
// both runs must write the same bytes, so it does nothing time- or
// order-dependent: plain recursive copies, then the dossier built from
// what was copied.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's caps, as the competition's rules state them: the dossier text
// cap, at most 4 screenshots of at most 256 KiB each, and game/ within
// 993 files, 48 MiB and 1000-byte paths.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function handIn() {
  // Pre-flight: fail loudly with a clear reason instead of copying a
  // half-built entry (a missing index.html would still produce a dossier,
  // but the gate would refuse it).
  const indexHtml = join(repoRoot, 'game', 'index.html');
  if (!existsSync(indexHtml)) {
    throw new Error(`missing game/index.html at ${indexHtml}`);
  }
  const shots = join(repoRoot, 'screenshots');
  if (!existsSync(shots)) {
    throw new Error(`missing screenshots/ at ${shots}`);
  }
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
  cpSync(shots, join(outDir, 'screenshots'), { recursive: true });
  const dossier = buildDossier(outDir, DOSSIER_CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log(`handed in: game/ + screenshots/ -> ${outDir} (dossier.json ${dossier.length} bytes)`);
}

handIn();
