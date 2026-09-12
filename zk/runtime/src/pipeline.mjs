// ZK pipeline CLI — JSON on stdout, human logs on stderr.
// Subcommands:
//   prove    --circuit <name>
//   bundle   --circuit <name>
//   attest   --circuit <name> --mode claim|endorsement --deployment <file> --key 0x..
//   publish  --mode claim|endorsement --deployment <file> --rpc <url>
//            --chain-id <id> --key 0x.. --bundle-file <f> --atts-file <f>
//            [--circuit-id <bytes32>] (endorsement: use circuitId2)
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ZK,
  clients,
  CELO_SEPOLIA,
  ANVIL,
  sha256,
  jsonStringify,
  jsonParse,
  loadAbi,
} from './lib/kvch.mjs';
import { buildBundle } from './bundle.mjs';
import { verifyAndAttest } from './verifier_node.mjs';
import {
  collectQuorum,
  claimHeaderFromBundle,
  endorsementHeaderFromBundle,
  preflight,
  submitClaim,
  submitEndorsement,
} from './aggregator.mjs';

const BB = process.env.BB_BIN ?? '/Users/arkoroy/.bb/bb';

function args() {
  const out = { _: [] };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) out[a[i].slice(2)] = a[i + 1]?.startsWith('--') ? true : a[++i];
    else out._.push(a[i]);
  }
  return out;
}
const A = args();
const cmd = A._[0];
const out = (o) => { process.stdout.write(jsonStringify(o) + '\n'); };
const log = (s) => process.stderr.write(s + '\n');

function loadDeployment(file) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  return {
    chainId: raw.chainId,
    councilSetId: BigInt(raw.councilSetId),
    contracts: {
      ClaimAttestationRegistry: raw.ClaimAttestationRegistry,
      EndorsementRegistry: raw.EndorsementRegistry,
      CouncilRegistry: raw.CouncilRegistry,
      ArtifactPolicyRegistry: raw.ArtifactPolicyRegistry,
    },
    ids: { circuitId: raw.circuitId, circuitId2: raw.circuitId2, policyId: raw.policyId },
  };
}

if (cmd === 'prove') {
  const name = A.circuit;
  execFileSync('nargo', ['execute'], {
    cwd: join(ZK, `circuits/${name}`),
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  execFileSync(BB, [
    'prove', '-t', 'noir-recursive-no-zk',
    '-b', `target/${name}.json`, '-w', `target/${name}.gz`,
    '-o', `target/${name}`, '--write_vk',
  ], { cwd: ZK, stdio: ['ignore', 'ignore', 'inherit'] });
  const vk = readFileSync(join(ZK, `target/${name}/vk`));
  const artifact = readFileSync(join(ZK, `target/${name}.json`));
  execFileSync(BB, [
    'verify', '-t', 'noir-recursive-no-zk',
    '-p', `target/${name}/proof`, '-k', `target/${name}/vk`,
    '-i', `target/${name}/public_inputs`,
  ], { cwd: ZK, stdio: ['ignore', 'ignore', 'inherit'] });
  out({ ok: true, artifactDigest: sha256(artifact), vkDigest: sha256(vk) });
} else if (cmd === 'bundle') {
  const { bundle, path } = buildBundle(A.circuit);
  out({
    ok: true,
    bundlePath: path,
    bundleDigest: bundle.bundleDigest,
    bundleRefDigest: bundle.bundleRefDigest,
    artifactDigest: bundle.circuit.artifactDigest,
    vkDigest: bundle.circuit.vkDigest,
    policyDigest: bundle.policy.policyDigest,
    named: bundle.publicInputs.named,
  });
} else if (cmd === 'attest') {
  const deployment = loadDeployment(A.deployment);
  const bundlePath = join(ZK, `bundles/${A.circuit}.bundle.json`);
  const r = await verifyAndAttest({
    bundlePath,
    circuitName: A.circuit,
    verifierKey: A.key,
    deployment,
    mode: A.mode ?? 'claim',
  });
  out({ ok: true, ...r });
} else if (cmd === 'publish') {
  const deployment = loadDeployment(A.deployment);
  const chain = Number(A['chain-id']) === 11142220 ? CELO_SEPOLIA : ANVIL;
  const { publicClient, walletClient } = clients(A.rpc, chain, A.key);
  const bundle = JSON.parse(readFileSync(A['bundle-file'], 'utf8'));
  const results = jsonParse(readFileSync(A['atts-file'], 'utf8'));
  const named = bundle.publicInputs.named;
  const atts = await collectQuorum(results);
  log(`quorum ${atts.length} attestations`);
  await preflight(publicClient, deployment, atts, deployment.councilSetId);
  if (A.mode === 'claim') {
    const header = claimHeaderFromBundle(bundle, deployment, named);
    const { hash, receipt } = await submitClaim(publicClient, walletClient, deployment, header, atts);
    out({ ok: true, txHash: hash, blockNumber: Number(receipt.blockNumber), status: receipt.status, header });
  } else {
    const dep = { ...deployment, ids: { ...deployment.ids, circuitId: deployment.ids.circuitId2 } };
    const header = endorsementHeaderFromBundle(bundle, dep, named);
    const { hash, receipt } = await submitEndorsement(publicClient, walletClient, dep, header, atts);
    out({ ok: true, txHash: hash, blockNumber: Number(receipt.blockNumber), status: receipt.status, header });
  }
} else if (cmd === 'header') {
  const deployment = loadDeployment(A.deployment);
  const bundle = JSON.parse(readFileSync(A['bundle-file'], 'utf8'));
  const named = bundle.publicInputs.named;
  const header =
    A.mode === 'claim'
      ? claimHeaderFromBundle(bundle, deployment, named)
      : endorsementHeaderFromBundle(
          bundle,
          { ...deployment, ids: { ...deployment.ids, circuitId: deployment.ids.circuitId2 } },
          named,
        );
  out({ ok: true, header });
} else if (cmd === 'claim') {
  const deployment = loadDeployment(A.deployment);
  const chain = Number(A['chain-id']) === 11142220 ? CELO_SEPOLIA : ANVIL;
  const { publicClient } = clients(A.rpc, chain, undefined);
  const registry = deployment.contracts.ClaimAttestationRegistry;
  const claimAbi = loadAbi('ClaimAttestationRegistry');
  const [active, claim] = await Promise.all([
    publicClient.readContract({
      address: registry, abi: claimAbi,
      functionName: 'isClaimActive', args: [A['claim-id']],
    }),
    publicClient.readContract({
      address: registry, abi: claimAbi,
      functionName: 'claims', args: [A['claim-id']],
    }).catch(() => null),
  ]);
  out({ ok: true, active, claim });
} else {
  console.error('usage: pipeline.mjs prove|bundle|attest|publish|header|claim ...');
  process.exit(1);
}
