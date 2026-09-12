import { readFileSync } from 'node:fs';
import { Noir } from '@noir-lang/noir_js';
import { Barretenberg, UltraHonkBackend } from '@aztec/bb.js';

const circuit = JSON.parse(
  readFileSync(new URL('../../circuits/compatibility_spike/target/compatibility_spike.json', import.meta.url)),
);

const noir = new Noir(circuit);
const { witness } = await noir.execute({ x: '3', y: '5' });
console.log('witness executed, bytes:', witness.length);

const api = await Barretenberg.new({ threads: 1 });
const backend = new UltraHonkBackend(circuit.bytecode, api);

const proofData = await backend.generateProof(witness, { verifierTarget: 'noir-recursive-no-zk' });
console.log('proof generated:', proofData.proof.length, 'bytes, publicInputs:', proofData.publicInputs);

const ok = await backend.verifyProof(proofData, { verifierTarget: 'noir-recursive-no-zk' });
console.log('proof verified:', ok);

await api.destroy();
process.exit(ok ? 0 : 1);
