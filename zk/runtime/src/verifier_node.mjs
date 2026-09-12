// Independent verifier node: validates a proof bundle, re-verifies the
// UltraHonk proof, and produces an EIP-712 VerificationAttestation.
//
// Usage (library): import { verifyAndAttest } from './verifier_node.mjs'
//   await verifyAndAttest({ bundle, bundlePath, circuitName, verifierKey,
//                           deployment, mode: 'claim' | 'endorsement' })
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Noir } from '@noir-lang/noir_js';
import { Barretenberg, UltraHonkBackend } from '@aztec/bb.js';
import { privateKeyToAccount } from 'viem/accounts';
import {
  ZK,
  sha256,
  ATTESTATION_TYPES,
  ENDORSEMENT_TYPES,
  endorsementIdFor,
  randomNonce,
} from './lib/kvch.mjs';

function stable(o) {
  if (Array.isArray(o)) return o.map(stable);
  if (o && typeof o === 'object')
    return Object.fromEntries(
      Object.keys(o)
        .sort()
        .map((k) => [k, stable(o[k])]),
    );
  return o;
}

export async function verifyAndAttest({
  bundlePath,
  circuitName,
  verifierKey,
  deployment,
  mode = 'claim',
}) {
  const bundle = JSON.parse(readFileSync(bundlePath, 'utf8'));

  // 1. bundle digest integrity
  const { bundleDigest, bundleRefDigest, ...rest } = bundle;
  const recomputed = sha256(
    Buffer.from(JSON.stringify(stable(rest)), 'utf8'),
  );
  if (recomputed !== bundleDigest)
    throw new Error(`bundle digest mismatch: ${recomputed} != ${bundleDigest}`);

  // 2. artifact digests against local pinned copies
  const artifact = readFileSync(join(ZK, `target/${circuitName}.json`));
  const vk = readFileSync(join(ZK, `target/${circuitName}/vk`));
  if (sha256(artifact) !== bundle.circuit.artifactDigest)
    throw new Error('artifact digest mismatch');
  if (sha256(vk) !== bundle.circuit.vkDigest)
    throw new Error('vk digest mismatch');

  // 3. re-verify the proof with bb.js (pinned toolchain path)
  const circuit = JSON.parse(artifact.toString('utf8'));
  const api = await Barretenberg.new({ threads: 1 });
  const backend = new UltraHonkBackend(circuit.bytecode, api);
  const proofBytes = Buffer.from(bundle.proof.bytesBase64, 'base64');
  const ok = await backend.verifyProof(
    {
      proof: new Uint8Array(proofBytes),
      publicInputs: bundle.publicInputs.flat,
    },
    { verifierTarget: 'noir-recursive-no-zk' },
  );
  await api.destroy();
  if (!ok) throw new Error('proof verification failed');

  // 4. public-input internal consistency
  const named = bundle.publicInputs.named;
  if (named.claim_id === undefined && mode === 'claim')
    throw new Error('public inputs missing claim_id');
  const claimId =
    mode === 'claim' ? named.claim_id : named.endorsement_id ?? named.claim_id;

  // 5. sign the EIP-712 attestation
  const account = privateKeyToAccount(verifierKey);
  const isEndorsement = mode === 'endorsement';
  const domain = {
    name: isEndorsement
      ? 'KVCHEndorsementRegistry'
      : 'KVCHClaimAttestationRegistry',
    version: '1',
    chainId: deployment.chainId,
    verifyingContract: isEndorsement
      ? deployment.contracts.EndorsementRegistry
      : deployment.contracts.ClaimAttestationRegistry,
  };
  const policyDigest = bundle.policy.policyDigest;
  const base = {
    bundleDigest,
    publicInputDigest:
      named.public_input_digest ??
      sha256(
        Buffer.concat(
          bundle.publicInputs.flat.map((h) => Buffer.from(h.slice(2), 'hex')),
        ),
      ),
    circuitDigest: bundle.circuit.artifactDigest,
    vkDigest: bundle.circuit.vkDigest,
    policyDigest,
    councilSetId: BigInt(deployment.councilSetId),
    verifier: account.address,
    decision: 1,
    reasonCode: 0,
    nonce: randomNonce(),
    issuedAt: BigInt(Math.floor(Date.now() / 1000)),
    deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
  };
  const message = isEndorsement
    ? {
        endorsementId: endorsementIdFor(named),
        targetClaimId: named.target_claim_id,
        ...base,
      }
    : { claimId, ...base };

  const signature = await account.signTypedData({
    domain,
    types: isEndorsement ? ENDORSEMENT_TYPES : ATTESTATION_TYPES,
    primaryType: isEndorsement
      ? 'EndorsementAttestation'
      : 'VerificationAttestation',
    message,
  });

  return {
    attestation: {
      verifier: account.address,
      decision: 1,
      reasonCode: 0,
      nonce: base.nonce,
      issuedAt: Number(base.issuedAt),
      deadline: Number(base.deadline),
      signature,
    },
    domain,
    types: isEndorsement ? ENDORSEMENT_TYPES : ATTESTATION_TYPES,
    primaryType: isEndorsement
      ? 'EndorsementAttestation'
      : 'VerificationAttestation',
    message,
  };
}
