import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Noir } from '@noir-lang/noir_js';
import { Barretenberg, UltraHonkBackend } from '@aztec/bb.js';

const ZK = join(dirname(fileURLToPath(import.meta.url)), '../..');
const CIRCUITS = [
  'threat_eligibility',
  'stakeholder_risk_band',
  'peer_endorsement',
  'evidence_inclusion',
];

const api = await Barretenberg.new({ threads: 1 });
let allOk = true;

for (const name of CIRCUITS) {
  const circuit = JSON.parse(readFileSync(join(ZK, `target/${name}.json`), 'utf8'));
  const input = JSON.parse(readFileSync(join(ZK, `fixtures/${name}.input.json`), 'utf8'));

  const noir = new Noir(circuit);
  const { witness } = await noir.execute(input);
  console.log(`[${name}] witness executed (${witness.length} bytes)`);

  const backend = new UltraHonkBackend(circuit.bytecode, api);
  const proofData = await backend.generateProof(witness, {
    verifierTarget: 'noir-recursive-no-zk',
  });
  const ok = await backend.verifyProof(proofData, {
    verifierTarget: 'noir-recursive-no-zk',
  });
  console.log(
    `[${name}] proof ${proofData.proof.length} bytes, ` +
      `${proofData.publicInputs.length} public inputs, verified: ${ok}`,
  );
  allOk = allOk && ok;
}

await api.destroy();
process.exit(allOk ? 0 : 1);
