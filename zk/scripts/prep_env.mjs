#!/usr/bin/env node
// Computes deployment env values: circuit/policy IDs, artifact digests,
// verifier keys (generated once, reused). Writes zk/.env.deploy.
// Usage: node scripts/prep_env.mjs [deployer_address]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { keccak256, toBytes } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ZK, sha256 } from '../runtime/src/lib/kvch.mjs';

const ENV_PATH = join(ZK, '.env.deploy');
const existing = existsSync(ENV_PATH)
  ? Object.fromEntries(
      readFileSync(ENV_PATH, 'utf8')
        .split('\n')
        .filter((l) => l.includes('='))
        .map((l) => l.split('=')),
    )
  : {};

const artifactDigest = (name) =>
  sha256(readFileSync(join(ZK, `target/${name}.json`)));
const vkDigest = (name) =>
  sha256(readFileSync(join(ZK, `target/${name}/vk`)));

const manifest = readFileSync(join(ZK, 'manifests/predicate-semantics.v1.json'));
const policyDigest = sha256(manifest);

const kid = (s) => keccak256(toBytes(s));

const verifierKeys = [1, 2, 3].map(
  (i) =>
    existing[`VERIFIER_KEY_${i}`] ??
    '0x' + randomBytes(32).toString('hex'),
);
const verifierKey = (i) => verifierKeys[i - 1];

const deployer = process.argv[2] ?? existing.DEPLOYER_ADDR ?? '0x0000000000000000000000000000000000000000';

const env = {
  GUARDIAN_ADDR: deployer,
  GOVERNOR_ADDR: deployer,
  ACTIVATION_DELAY: '60',
  CIRCUIT_ID: kid('kvch.circuit.threat_eligibility.v1'),
  ARTIFACT_DIGEST: artifactDigest('threat_eligibility'),
  VK_DIGEST: vkDigest('threat_eligibility'),
  CIRCUIT_ID_2: kid('kvch.circuit.peer_endorsement.v1'),
  ARTIFACT_DIGEST_2: artifactDigest('peer_endorsement'),
  VK_DIGEST_2: vkDigest('peer_endorsement'),
  POLICY_ID: kid('kvch.policy.predicate-semantics.v1'),
  POLICY_DIGEST: policyDigest,
  CODEBOOK_DIGEST: policyDigest,
  VERIFIER_KEY_1: verifierKey(1),
  VERIFIER_KEY_2: verifierKey(2),
  VERIFIER_KEY_3: verifierKey(3),
  VERIFIER_1: privateKeyToAccount(verifierKey(1)).address,
  VERIFIER_2: privateKeyToAccount(verifierKey(2)).address,
  VERIFIER_3: privateKeyToAccount(verifierKey(3)).address,
};

const body = Object.entries(env)
  .map(([k, v]) => `${k}=${v}`)
  .join('\n');
writeFileSync(ENV_PATH, body + '\n');
console.log(`wrote ${ENV_PATH}`);
console.log(`verifiers: ${env.VERIFIER_1} ${env.VERIFIER_2} ${env.VERIFIER_3}`);
