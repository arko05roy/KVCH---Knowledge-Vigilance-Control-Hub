import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export const ZK = join(dirname(fileURLToPath(import.meta.url)), '../../..');
export const CONTRACTS = join(ZK, 'contracts');

export const sha256 = (buf) =>
  '0x' + createHash('sha256').update(buf).digest('hex');

export const CELO_SEPOLIA = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://forno.celo-sepolia.celo-testnet.org'] },
  },
});

export const ANVIL = defineChain({
  id: 31337,
  name: 'Anvil',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
});

export function loadAbi(name) {
  const artifact = JSON.parse(
    readFileSync(join(CONTRACTS, `out/${name}.sol/${name}.json`), 'utf8'),
  );
  return artifact.abi;
}

export function clients(rpcUrl, chain, privateKey) {
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  const walletClient = privateKey
    ? createWalletClient({
        account: privateKeyToAccount(privateKey),
        chain,
        transport: http(rpcUrl),
      })
    : null;
  return { publicClient, walletClient };
}

// EIP-712 definitions — must match the Solidity typehashes verbatim.
export const ATTESTATION_TYPES = {
  VerificationAttestation: [
    { name: 'claimId', type: 'bytes32' },
    { name: 'bundleDigest', type: 'bytes32' },
    { name: 'publicInputDigest', type: 'bytes32' },
    { name: 'circuitDigest', type: 'bytes32' },
    { name: 'vkDigest', type: 'bytes32' },
    { name: 'policyDigest', type: 'bytes32' },
    { name: 'councilSetId', type: 'uint256' },
    { name: 'verifier', type: 'address' },
    { name: 'decision', type: 'uint8' },
    { name: 'reasonCode', type: 'uint8' },
    { name: 'nonce', type: 'uint256' },
    { name: 'issuedAt', type: 'uint64' },
    { name: 'deadline', type: 'uint64' },
  ],
};

export const ENDORSEMENT_TYPES = {
  EndorsementAttestation: [
    { name: 'endorsementId', type: 'bytes32' },
    { name: 'targetClaimId', type: 'bytes32' },
    { name: 'bundleDigest', type: 'bytes32' },
    { name: 'publicInputDigest', type: 'bytes32' },
    { name: 'circuitDigest', type: 'bytes32' },
    { name: 'vkDigest', type: 'bytes32' },
    { name: 'policyDigest', type: 'bytes32' },
    { name: 'councilSetId', type: 'uint256' },
    { name: 'verifier', type: 'address' },
    { name: 'decision', type: 'uint8' },
    { name: 'reasonCode', type: 'uint8' },
    { name: 'nonce', type: 'uint256' },
    { name: 'issuedAt', type: 'uint64' },
    { name: 'deadline', type: 'uint64' },
  ],
};

export function randomNonce() {
  return BigInt('0x' + randomBytes(31).toString('hex'));
}

/// Circuit epochs are hours since unix epoch; chain expects unix seconds.
export const epochToUnix = (e) => BigInt(e) * 3600n;

/// BigInt-safe JSON for pipeline stdout/files.
export const jsonStringify = (o) =>
  JSON.stringify(o, (_k, v) => (typeof v === 'bigint' ? `0xBI${v.toString(10)}` : v));
export const jsonParse = (s) =>
  JSON.parse(s, (_k, v) =>
    typeof v === 'string' && v.startsWith('0xBI') ? BigInt(v.slice(4)) : v,
  );

/// Deterministic endorsement ID bound to target+endorser+nullifier.
export function endorsementIdFor(named) {
  return sha256(
    Buffer.from(
      `endorse:${named.target_claim_id}:${named.endorser_company_code}:${named.endorsement_nullifier}`,
      'utf8',
    ),
  );
}
