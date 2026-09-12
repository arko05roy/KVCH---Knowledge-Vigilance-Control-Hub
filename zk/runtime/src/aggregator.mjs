// Quorum aggregator / publication gateway. Validates EIP-712 attestations
// locally, dedupes + sorts by signer, re-checks council threshold and
// artifact state on-chain, then submits the anchored claim transaction.
import { recoverTypedDataAddress, getAddress, padHex } from 'viem';
import {
  loadAbi,
  epochToUnix,
  endorsementIdFor,
  sha256,
} from './lib/kvch.mjs';

const ROLE_VERIFIER = 1n;

/// Verify, dedupe, sort attestations; returns sorted attestation array
/// matching the Solidity `Attestation[]` calldata layout.
export async function collectQuorum(results) {
  const seen = new Map();
  for (const r of results) {
    const recovered = await recoverTypedDataAddress({
      domain: r.domain,
      types: r.types,
      primaryType: r.primaryType,
      message: r.message,
      signature: r.attestation.signature,
    });
    if (getAddress(recovered) !== getAddress(r.attestation.verifier))
      throw new Error(`attestation signature mismatch for ${r.attestation.verifier}`);
    seen.set(getAddress(r.attestation.verifier), r.attestation);
  }
  return [...seen.entries()]
    .sort(([a], [b]) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
    .map(([, a]) => ({
      verifier: a.verifier,
      decision: a.decision,
      reasonCode: a.reasonCode,
      nonce: a.nonce,
      issuedAt: a.issuedAt,
      deadline: a.deadline,
      signature: a.signature,
    }));
}

/// Build the on-chain ClaimHeader from a bundle + deployment config.
const b32 = (v) => padHex(v, { size: 32, dir: 'left' });

export function claimHeaderFromBundle(bundle, deployment, named) {
  return {
    claimId: b32(named.claim_id),
    claimSeriesId: b32(named.claim_series_id),
    claimVersion: BigInt(named.claim_version),
    bundleDigest: bundle.bundleDigest,
    bundleRefDigest: bundle.bundleRefDigest,
    publicInputDigest: b32(named.public_input_digest),
    disclosureNullifier: b32(named.disclosure_nullifier),
    circuitId: deployment.ids.circuitId,
    policyId: deployment.ids.policyId,
    councilSetId: BigInt(deployment.councilSetId),
    issuerCompanyCode: BigInt(named.issuer_company_code),
    expiryEpoch: epochToUnix(named.expiry_epoch),
  };
}

export function endorsementHeaderFromBundle(bundle, deployment, named) {
  return {
    endorsementId: endorsementIdFor(named),
    targetClaimId: b32(named.target_claim_id),
    bundleDigest: bundle.bundleDigest,
    bundleRefDigest: bundle.bundleRefDigest,
    publicInputDigest: sha256Flat(bundle.publicInputs.flat),
    endorsementNullifier: b32(named.endorsement_nullifier),
    circuitId: deployment.ids.circuitId,
    policyId: deployment.ids.policyId,
    councilSetId: BigInt(deployment.councilSetId),
    endorserCompanyCode: BigInt(named.endorser_company_code),
    expiryEpoch: epochToUnix(named.expiry_epoch),
    matchBandCode: Number(named.match_class_code),
  };
}

function sha256Flat(flat) {
  return sha256(
    Buffer.concat(flat.map((h) => Buffer.from(h.slice(2), 'hex'))),
  );
}

/// Pre-submission checks against live chain state.
export async function preflight(publicClient, deployment, atts, councilSetId) {
  const councilAbi = loadAbi('CouncilRegistry');
  const councilAddr = deployment.contracts.CouncilRegistry;
  const threshold = await publicClient.readContract({
    address: councilAddr,
    abi: councilAbi,
    functionName: 'thresholdFor',
    args: [councilSetId, ROLE_VERIFIER],
  });
  if (atts.length < Number(threshold))
    throw new Error(`quorum shortfall: ${atts.length} < ${threshold}`);
  for (const a of atts) {
    const ok = await publicClient.readContract({
      address: councilAddr,
      abi: councilAbi,
      functionName: 'isActiveMember',
      args: [councilSetId, a.verifier, ROLE_VERIFIER],
    });
    if (!ok) throw new Error(`${a.verifier} is not an active verifier`);
  }
  return threshold;
}

/// Simulate then broadcast submitClaim.
export async function submitClaim(publicClient, walletClient, deployment, header, atts) {
  const abi = loadAbi('ClaimAttestationRegistry');
  const addr = deployment.contracts.ClaimAttestationRegistry;
  const { request } = await publicClient.simulateContract({
    address: addr,
    abi,
    functionName: 'submitClaim',
    args: [header, atts],
    account: walletClient.account,
  });
  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

export async function submitEndorsement(publicClient, walletClient, deployment, header, atts) {
  const abi = loadAbi('EndorsementRegistry');
  const addr = deployment.contracts.EndorsementRegistry;
  const { request } = await publicClient.simulateContract({
    address: addr,
    abi,
    functionName: 'submitEndorsement',
    args: [header, atts],
    account: walletClient.account,
  });
  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}
