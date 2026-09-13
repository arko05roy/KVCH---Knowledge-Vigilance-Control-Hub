#!/usr/bin/env node
// GIE-512 filtration dry-run harness.
//
//   node src/bench.js                     -> sizes 10,20,30,100,1000,10000
//   node src/bench.js --sizes 10,1000     -> custom sizes
//   node src/bench.js --rate 0.10         -> attack fraction (default 0.05)
//   node src/bench.js --dump              -> write out/defects-N.ndjson
//
// Phases per run (mirrors whitepaper §8.3 rollout):
//   Phase 1  baselining   — learn AST shape hashes of known query templates
//   Phase 2  adaptation   — per-source adapters parse heterogeneous lines
//   Phase 3  evaluation   — T(s) tensor built per event, D(s) computed
//   Phase 4  filtration   — D(s)=0 dropped/sampled; D(s)>0 -> defect stream

import { performance } from 'node:perf_hooks';
import { generate } from './genlogs.js';
import { adapt } from './adapters.js';
import { GieEngine } from './engine.js';
import { Baseline } from './baseline.js';
import { IMPLEMENTED, DECLARED, declaredCount, groupOf } from './checks.js';
import { buildFrame } from './frame.js';
import { DefectStream, ColdStore, NdjsonWriter } from './sink.js';
import { mulberry32 } from './prng.js';

const args = process.argv.slice(2);
const arg = (k, d) => {
  const i = args.indexOf('--' + k);
  return i >= 0 ? args[i + 1] : d;
};
const SIZES = String(arg('sizes', '10,20,30,100,1000,10000')).split(',').map(Number);
const RATE = Number(arg('rate', '0.05'));
const SEED = Number(arg('seed', '42'));
const DUMP = args.includes('--dump');

console.log('GIE-512 filtration layer — dry run');
console.log(`functionals: ${IMPLEMENTED.length} implemented + ${declaredCount()} declared (vacuous pass) = 512-bit tensor`);
console.log(`attack rate: ${(RATE * 100).toFixed(1)}%   seed: ${SEED}\n`);

const summary = [];

for (const n of SIZES) {
  const { lines, truth, templates, nAttacks } = generate(n, { rate: RATE, seed: SEED });

  // Phase 1 — CI/CD baselining: register template AST shape hashes.
  const baseline = new Baseline();
  templates.forEach((t) => baseline.learn(t));

  const engine = new GieEngine({ baseline });
  const stream = new DefectStream();
  const cold = new ColdStore(DUMP ? new NdjsonWriter(`out/sampled_pass-${n}.ndjson`) : null);
  const framesOut = DUMP ? new NdjsonWriter(`out/defects-${n}.ndjson`) : null;
  const rng = mulberry32(SEED ^ n);

  let deadletters = 0, pass = 0;
  let tAdapt = 0, tEval = 0;
  const checkHits = new Map();
  const groupHits = [0, 0, 0, 0];
  const frames = [];

  const t0 = performance.now();
  lines.forEach((line, i) => {
    const ref = `line:${i}`;
    const a0 = performance.now();
    const evt = adapt(line, ref);
    const a1 = performance.now(); tAdapt += a1 - a0;

    if (!evt) return;
    if (evt.channel === 'deadletter') { deadletters++; return; }

    const e0 = performance.now();
    const r = engine.evaluate(evt);
    const e1 = performance.now(); tEval += e1 - e0;

    if (r.isDefect) {
      const frame = buildFrame(evt, r.tensor, r.failed);
      frames.push({ frame, truthIdx: i });
      stream.push(frame);
      framesOut?.write(frame);
      for (const c of r.failed) {
        checkHits.set(c.id, (checkHits.get(c.id) || 0) + 1);
        groupHits[groupOf(c.id) - 1]++;
      }
    } else {
      pass++;
      cold.offer(evt, rng());
    }
  });
  const t1 = performance.now();
  const wall = t1 - t0;

  // FP/FN vs generator ground truth.
  const defectIdx = new Set(frames.map((f) => f.truthIdx));
  const frameByIdx = new Map(frames.map((f) => [f.truthIdx, f]));
  let fp = 0, fn = 0, checkMisses = 0;
  truth.forEach((exp, i) => {
    if (exp === null) { if (defectIdx.has(i)) fp++; }
    else if (!defectIdx.has(i)) fn++;
    else {
      const got = new Set(frameByIdx.get(i).frame.failed_checks.map((c) => c.id));
      for (const id of exp) if (!got.has(id)) checkMisses++;
    }
  });

  stream.drain();
  framesOut?.close(); cold.w?.close();

  const defects = stream.pushed;
  const evPerSec = Math.round(lines.length / (wall / 1000));
  const reduction = ((1 - defects / lines.length) * 100);

  console.log(`── run n=${n} ${'─'.repeat(Math.max(2, 46 - String(n).length))}`);
  console.log(`  raw lines      : ${lines.length}  (${nAttacks} attack injections spliced)`);
  console.log(`  deadletters    : ${deadletters}`);
  console.log(`  D(s)=0 pass    : ${pass} dropped, ${cold.stored} sampled -> cold store`);
  console.log(`  D(s)>0 defects : ${defects} frames -> DefectStream  (backend sees ${(100 - reduction).toFixed(2)}% of raw volume, -${reduction.toFixed(1)}%)`);
  console.log(`  wall time      : ${wall.toFixed(1)} ms  |  ${evPerSec.toLocaleString()} ev/s  |  adapt ${(tAdapt / lines.length * 1000).toFixed(1)} µs/ev + eval ${(tEval / lines.length * 1000).toFixed(1)} µs/ev`);
  console.log(`  ground truth   : FP=${fp}  FN=${fn}  expected-check misses=${checkMisses}`);
  const top = [...checkHits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([id, c]) => `#${id}×${c}`).join('  ');
  console.log(`  checks fired   : ${top || '(none)'}`);
  console.log(`  groups hit     : H1=${groupHits[0]} H2=${groupHits[1]} H3=${groupHits[2]} H4=${groupHits[3]}`);
  if (frames.length > 0) {
    const f = frames[0].frame;
    console.log(`  sample frame   : ${JSON.stringify({ channel: f.channel, failed_checks: f.failed_checks.map(c => c.id), verdict: f.verdict, severity: f.severity })}`);
  }
  console.log('');

  summary.push({ n: lines.length, defects, deadletters, pass, cold: cold.stored, reduction, evPerSec, wall, fp, fn });
}

console.log('── aggregate ──────────────────────────────────────────────');
console.log('  raw_logs | defects | pass+sampled | backend load | ev/s     | wall ms');
for (const s of summary) {
  console.log(
    `  ${String(s.n).padStart(8)} | ${String(s.defects).padStart(7)} | ${String(s.pass + s.cold).padStart(12)} | ${(100 - s.reduction).toFixed(2).padStart(9)}% | ${String(s.evPerSec).padStart(8)} | ${s.wall.toFixed(1).padStart(7)}`
  );
}
console.log('\nDeclared-but-unevaluated ranges (vacuous pass):');
for (const d of DECLARED) {
  const r = Array.isArray(d[0]) ? `${d[0][0]}-${d[0][1]}` : `${d[0]}`;
  console.log(`  checks ${r.padEnd(8)} ${d[1]}`);
}
if (DUMP) console.log('\ndefect frames written to out/defects-<n>.ndjson');
