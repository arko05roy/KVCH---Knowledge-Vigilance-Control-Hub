// End-to-end: bundle → 3 verifier attestations → quorum → on-chain submit.
// Usage:
//   node runtime/src/e2e.mjs --rpc <url> --chain-id <id> \
//     --deployment <contracts/deployments/latest.json> \
//     --publisher-key 0x... --verifier-keys k1,k2,k3 [--skip-endorsement]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { privateKeyToAccount } from 'viem/accounts';
import {
  ZK,
  clients,
  loadAbi,
  CELO_SEPOLIA,
  ANVIL,
} from './lib/kvch.mjs';
import { verifyAndAttest } from './verifier_node.mjs';
import {
  collectQuorum,
  claimHeaderFromBundle,
  endorsementHeaderFromBundle,
  preflight,
  submitClaim,
  submitEndorsement,
} from './aggregator.mjs';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i].replace(/^--/, '');
  args[k] = process.argv[i + 1]?.startsWith('--') ? true : process.argv[i + 1];
  if (args[k] === true) i--;
}
const rpcUrl = args.rpc ?? 'http://127.0.0.1:8545';
const chainId = Number(args['chain-id'] ?? 31337);
const chain = chainId === 11142220 ? CELO_SEPOLIA : ANVIL;
const deploymentRaw = JSON.parse(
  readFileSync(args.deployment ?? join(ZK, 'contracts/deployments/latest.json'), 'utf8'),
);

const deployment = {
  chainId: deploymentRaw.chainId,
  councilSetId: BigInt(deploymentRaw.councilSetId),
  contracts: {
    ClaimAttestationRegistry: deploymentRaw.ClaimAttestationRegistry,
    EndorsementRegistry: deploymentRaw.EndorsementRegistry,
    CouncilRegistry: deploymentRaw.CouncilRegistry,
    ArtifactPolicyRegistry: deploymentRaw.ArtifactPolicyRegistry,
  },
  ids: {
    circuitId: deploymentRaw.circuitId,
    circuitId2: deploymentRaw.circuitId2,
    policyId: deploymentRaw.policyId,
  },
};

const publisherKey = args['publisher-key'];
const verifierKeys = args['verifier-keys'].split(',');
const { publicClient, walletClient } = clients(rpcUrl, chain, publisherKey);

console.log(`chain ${chainId}, publisher ${walletClient.account.address}`);
console.log(`claims registry: ${deployment.contracts.ClaimAttestationRegistry}`);

async function anchor(name, mode) {
  console.log(`\n=== ${name} (${mode}) ===`);
  execSync(`node ${join(ZK, 'runtime/src/bundle.mjs')} ${name}`, {
    stdio: 'inherit',
  });
  const bundlePath = join(ZK, `bundles/${name}.bundle.json`);
  const bundle = JSON.parse(readFileSync(bundlePath, 'utf8'));
  const named = bundle.publicInputs.named;

  const results = [];
  for (const vk of verifierKeys) {
    const r = await verifyAndAttest({
      bundlePath,
      circuitName: name,
      verifierKey: vk,
      deployment,
      mode,
    });
    console.log(`  verifier ${r.attestation.verifier} attested`);
    results.push(r);
  }

  const atts = await collectQuorum(results);
  console.log(`  quorum: ${atts.length} attestations`);
  await preflight(publicClient, deployment, atts, deployment.councilSetId);

  if (mode === 'claim') {
    const header = claimHeaderFromBundle(bundle, deployment, named);
    const { hash } = await submitClaim(
      publicClient,
      walletClient,
      deployment,
      header,
      atts,
    );
    console.log(`  submitClaim tx: ${hash}`);
    const active = await publicClient.readContract({
      address: deployment.contracts.ClaimAttestationRegistry,
      abi: loadAbi('ClaimAttestationRegistry'),
      functionName: 'isClaimActive',
      args: [header.claimId],
    });
    console.log(`  isClaimActive(${header.claimId.slice(0, 18)}…): ${active}`);
    return header.claimId;
  }
  const depEndorse = {
    ...deployment,
    ids: { ...deployment.ids, circuitId: deployment.ids.circuitId2 },
  };
  const header = endorsementHeaderFromBundle(bundle, depEndorse, named);
  const { hash } = await submitEndorsement(
    publicClient,
    walletClient,
    depEndorse,
    header,
    atts,
  );
  console.log(`  submitEndorsement tx: ${hash}`);
  const count = await publicClient.readContract({
    address: deployment.contracts.EndorsementRegistry,
    abi: loadAbi('EndorsementRegistry'),
    functionName: 'endorsementCount',
    args: [header.targetClaimId],
  });
  console.log(`  endorsementCount(target): ${count}`);
  return header.endorsementId;
}

await anchor('threat_eligibility', 'claim');
if (!args['skip-endorsement']) {
  await anchor('peer_endorsement', 'endorsement');
}
console.log('\nE2E complete.');
