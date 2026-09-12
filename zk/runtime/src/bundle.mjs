// Builds a deterministic, content-addressed proof bundle for one circuit.
// Library: import { buildBundle } from './bundle.mjs'
// CLI:     node runtime/src/bundle.mjs <circuit_name>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZK, sha256 } from './lib/kvch.mjs';

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

export function buildBundle(name) {
  const artifactRaw = readFileSync(join(ZK, `target/${name}.json`));
  const vkRaw = readFileSync(join(ZK, `target/${name}/vk`));
  const vkHashRaw = readFileSync(join(ZK, `target/${name}/vk_hash`));
  const proofRaw = readFileSync(join(ZK, `target/${name}/proof`));
  const publicInputsRaw = readFileSync(
    join(ZK, `target/${name}/public_inputs`),
  );
  const input = JSON.parse(
    readFileSync(join(ZK, `fixtures/${name}.input.json`), 'utf8'),
  );
  const manifest = readFileSync(
    join(ZK, 'manifests/predicate-semantics.v1.json'),
  );

  const flat = [];
  for (let i = 0; i < publicInputsRaw.length; i += 32) {
    flat.push('0x' + publicInputsRaw.subarray(i, i + 32).toString('hex'));
  }

  const policyDigest = sha256(manifest);

  const bundle = {
    schema: 'kvch.proof-bundle.v1',
    protocolVersion: 1,
    circuit: {
      name,
      artifactDigest: sha256(artifactRaw),
      vkDigest: sha256(vkRaw),
      vkHash: '0x' + vkHashRaw.toString('hex').trim(),
      proofFlavor: 'ultrahonk:noir-recursive-no-zk',
      toolchain: 'see toolchain.lock.json',
    },
    policy: {
      policyDigest,
      codebookDigest: policyDigest,
      manifest: 'manifests/predicate-semantics.v1.json',
    },
    publicInputs: { flat, named: input.public },
    proof: {
      encoding: 'raw-ultrahonk-fields',
      bytesBase64: proofRaw.toString('base64'),
      byteLength: proofRaw.length,
    },
    issuedAt: new Date().toISOString(),
    claims: {
      nonClaims:
        'Proof attests consistency with signed adapter inputs under the ' +
        'frozen predicate manifest — not real-world truth.',
    },
  };

  // Content-addressed digest over the canonical (key-sorted) serialization.
  bundle.bundleDigest = sha256(
    Buffer.from(JSON.stringify(stable(bundle)), 'utf8'),
  );
  bundle.bundleRefDigest = sha256(
    Buffer.from(`kvch-bundle:${name}:${bundle.bundleDigest}`, 'utf8'),
  );

  mkdirSync(join(ZK, 'bundles'), { recursive: true });
  const out = join(ZK, `bundles/${name}.bundle.json`);
  writeFileSync(out, JSON.stringify(bundle, null, 2));
  return { bundle, path: out };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const name = process.argv[2];
  if (!name) {
    console.error('usage: bundle.mjs <circuit_name>');
    process.exit(1);
  }
  const { bundle, path } = buildBundle(name);
  console.log(`wrote ${path}`);
  console.log(`bundleDigest: ${bundle.bundleDigest}`);
  console.log(`claim_id: ${bundle.publicInputs.named.claim_id ?? '(none)'}`);
}
