#!/usr/bin/env node
// Rebases fixture epochs to ~now. Circuit epochs are hours since unix epoch;
// the frozen fixtures were authored against base 493000. This shifts every
// epoch literal in kvch_fixtures + fixture_gen/Prover.toml by the same delta,
// then regenerates fixtures (two passes: endorsement target binds the
// recomputed threat claim_id).
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ZK = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIB = join(ZK, 'libraries/kvch_fixtures/src/lib.nr');
const TOML = join(ZK, 'circuits/fixture_gen/Prover.toml');

const lib = readFileSync(LIB, 'utf8');
const curBase = Number(/OBSERVED_EPOCH: u32 = (\d+)/.exec(lib)[1]);
// new base: next whole hour, rounded up to a clean boundary for readability
const newBase = Math.ceil(Date.now() / 3600000) + 2;
const delta = newBase - curBase;
console.log(`epoch base ${curBase} -> ${newBase} (delta ${delta})`);

// shift standalone integer literals that look like epochs (490000..599999)
const shiftEpochs = (s) =>
  s.replace(/\b(4[9]\d{4}|5\d{5})\b/g, (m) => {
    const n = Number(m);
    return n >= 490000 ? String(n + delta) : m;
  });

writeFileSync(LIB, shiftEpochs(lib));

let toml = readFileSync(TOML, 'utf8');
toml = shiftEpochs(toml);
// exact_observed_seconds mirrors OBSERVED_SECONDS = base*3600 + 1234
toml = toml.replace(
  /exact_observed_seconds = (\d+)/,
  (_, n) => `exact_observed_seconds = ${Number(n) + delta * 3600}`,
);
writeFileSync(TOML, toml);

// pass 1: recompute publics + claim ids
execSync('node scripts/gen_fixtures.mjs', { cwd: ZK, stdio: 'inherit' });

// extract the new threat claim_id and bind the endorsement target to it
const out = execSync('nargo execute', {
  cwd: join(ZK, 'circuits/fixture_gen'),
  encoding: 'utf8',
});
const m = /claim_id: (0x[0-9a-f]+)/.exec(out);
if (!m) throw new Error('claim_id not found in fixture_gen output');
const newClaimId = m[1];
console.log(`new threat claim_id: ${newClaimId}`);
toml = readFileSync(TOML, 'utf8').replace(
  /target_claim_id = "0x[0-9a-f]+"/,
  `target_claim_id = "${newClaimId}"`,
);
writeFileSync(TOML, toml);

// pass 2: regen with bound endorsement target
execSync('node scripts/gen_fixtures.mjs', { cwd: ZK, stdio: 'inherit' });
console.log('done — re-run nargo test + re-prove all circuits');
