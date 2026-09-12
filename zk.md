---
agent: devin-local
session: polar-crane
created: 2026-09-12T13:30:43Z
---
# KVCH Plug-and-Play ZK Pilot Implementation

Implement a production-shaped, adapter-driven KVCH zero-knowledge subsystem using Noir, NoirJS, and Barretenberg, with a governed off-chain M-of-N verification council and minimized claim attestations anchored on Celo Sepolia.

## Summary

Build the ZK subsystem as an independently testable and deployable module that accepts signed, immutable inputs from the rest of KVCH, constructs witnesses only inside the company boundary, generates and locally verifies Barretenberg proofs, collects an M-of-N verification decision from a governed council, and anchors only minimized claim/attestation/lifecycle data on Celo Sepolia.

The implementation must not rebuild the risk engine, production identity provider, DLP engine, report generator, or stakeholder workflow. It must instead publish strict versioned adapter contracts for those systems, provide synthetic fixtures for development, and fail closed when a required signed input is absent or invalid.

## Fixed Decisions

1. Deliver the full pilot ZK subsystem, not only a single demo circuit.
2. Implement the four pilot claim capabilities:
   - `ThreatEligibilityV1` for consortium threat eligibility.
   - `StakeholderRiskBandV1` for stakeholder risk-band assurance.
   - `PeerEndorsementV1` for privacy-preserving proof of a peer-local match while the endorsing company remains identified in V1.
   - `EvidenceInclusionV1` for evidence/report integrity and controlled audit opening.
3. Use Noir for circuits, NoirJS for witness execution/integration, and Barretenberg UltraHonk as the proving backend, subject to an exact-version compatibility spike.
4. Generate witnesses and proofs inside the proving company’s controlled environment.
5. Use an identified proving company and identified council members in V1. Do not promise anonymous origin or anonymous endorsement.
6. Use the same governed council member entities for policy/governance, disclosure approval, verifier-node operation, and final attestation authorization, but separate every duty by action type, key purpose, signature domain, nonce, and audit record.
7. Use configurable M-of-N thresholds. Begin with a 2-of-3 development council; require a council-approved threshold policy before pilot use.
8. Verify proofs off-chain on independent verifier nodes. The Celo contract does not execute a Barretenberg verifier in the selected V1 mode.
9. Anchor accepted claim attestations and lifecycle events on Celo Sepolia, chain ID `11142220`. Do not target the retired Alfajores testnet.
10. Use Celo Sepolia only as the attestation/lifecycle ledger. Never place raw findings, exact risk values, witnesses, salts, private approval material, detailed STIX payloads, or secrets on-chain.
11. Keep every external input plug-and-play through signed, versioned adapters. The ZK subsystem must not depend on the other team’s database tables or internal service implementation.
12. Treat AI-generated disclosure content as advisory input only. The ZK subsystem accepts only a deterministic DLP/policy result signed by an authorized upstream adapter.

## Current Repository Baseline

The plan must account for the repository as it exists, not as the PRD imagines it:

- `web/` is Next.js 16.3.4, React 19.2.8, Prisma 6.19.3, PostgreSQL, and pg-boss.
- Current persisted application records cover extensions, artifacts, evaluations, deployments, scheduled runs, and findings.
- A scheduled evaluated extension can produce a persisted `Finding` with a `kvch.finding/v1` envelope.
- The current WebSocket server validates and rebroadcasts findings but does not persist WebSocket-originated findings.
- Production authentication, company roles, approval/audit records, risk snapshots, disclosure drafts, stakeholder rooms, consortium workflows, and ledger integration are absent.
- No Noir, NoirJS, Barretenberg, Foundry, contract, or Celo dependency is present.
- `nargo` and `bb` are not installed on the current machine.
- The current official Noir documentation is versioned at `v1.0.0-beta.26`; npm has newer release candidates, and current NoirJS/Barretenberg releases are moving independently. No version is accepted until the compatibility spike passes.
- Poseidon is no longer assumed to be a stable built-in Noir standard-library API; the selected Poseidon/Poseidon2 dependency and parameterization must be pinned and audited.

## Practical Stage Validation

Implementation proceeds in dependency order without gate manifests, signoff files, evidence state machines, or administrative gate records.

For each stage:

1. implement the smallest complete working slice;
2. add the relevant unit, negative, integration, fuzz, invariant, or end-to-end tests;
3. run the affected tests, typecheck, lint, and build;
4. fix failures before depending on that code in the next stage;
5. rerun affected earlier tests whenever shared schemas, circuits, commitments, signatures, contracts, or public inputs change.

A stage is ready when its code works, its listed `Exit gate` behavior is demonstrated by tests or direct verification, and the existing regression suite remains green. The `Exit gate` labels below mean practical code-validation checkpoints only; they do not require separate gate files or human signoff artifacts.

## Target Architecture

```text
Other KVCH systems
  ├─ Finding source adapter
  ├─ Risk-result adapter
  ├─ DLP/policy-decision adapter
  ├─ Approval/identity adapter
  └─ CTI payload adapter
          │ signed versioned envelopes
          ▼
KVCH ZK orchestration plugin in web/
  ├─ schema and signature validation
  ├─ immutable input-bundle registration
  ├─ snapshot/commitment construction
  ├─ claim composition and approval binding
  ├─ pg-boss proof jobs
  └─ lifecycle/index state
          │ opaque IDs + expected digests
          ▼
Company-local prover service
  ├─ reload and revalidate signed inputs
  ├─ deterministic canonicalization
  ├─ NoirJS witness execution
  ├─ Barretenberg UltraHonk proof generation
  ├─ independent local pre-verification
  └─ witness cleanup/zeroization
          │ public proof bundle only
          ▼
Independent verifier council nodes
  ├─ verify artifact manifest and proof
  ├─ verify public inputs and policy compatibility
  ├─ verify approval/DLP/source signatures
  ├─ check freshness, status, and replay domain
  └─ sign EIP-712 VerificationAttestation
          │ M unique attestations from active set N
          ▼
Quorum aggregator/publication gateway
  ├─ deduplicate and order signatures
  ├─ re-check threshold and current set
  ├─ submit minimized claim header
  └─ track transaction/finality/reconciliation
          ▼
Celo Sepolia contracts
  ├─ CouncilRegistry
  ├─ ArtifactPolicyRegistry
  ├─ ClaimAttestationRegistry
  ├─ EndorsementRegistry
  └─ DisputeLifecycleRegistry
          │ finalized events
          ▼
KVCH indexer and read APIs
  ├─ stakeholder verifier view
  ├─ consortium claim feed
  ├─ status/revocation checks
  └─ downloadable independent-verification bundle
```

## Intended Repository Shape

```text
sih/
├── zk/
│   ├── Nargo.toml
│   ├── circuits/
│   │   ├── threat_eligibility/
│   │   ├── stakeholder_risk_band/
│   │   ├── peer_endorsement/
│   │   └── evidence_inclusion/
│   ├── libraries/
│   │   ├── kvch_encoding/
│   │   ├── kvch_commitments/
│   │   ├── kvch_merkle/
│   │   ├── kvch_policy/
│   │   └── kvch_approval/
│   ├── fixtures/
│   ├── test-vectors/
│   ├── manifests/
│   └── scripts/
├── packages/
│   ├── zk-protocol/
│   │   ├── src/schemas/
│   │   ├── src/canonicalization/
│   │   ├── src/commitments/
│   │   ├── src/signatures/
│   │   ├── src/claims/
│   │   └── test/
│   └── zk-adapters/
│       ├── src/contracts/
│       ├── src/validators/
│       ├── src/clients/
│       └── test/
├── services/
│   ├── zk-prover/
│   │   ├── src/
│   │   ├── test/
│   │   └── Dockerfile
│   └── zk-verifier/
│       ├── src/
│       ├── test/
│       └── Dockerfile
├── contracts/
│   ├── src/
│   ├── test/
│   ├── script/
│   ├── deployments/
│   └── foundry.toml
└── web/
    ├── app/api/zk/
    ├── app/zk/
    ├── lib/zk/
    ├── lib/ledger/
    ├── lib/queue/zk-*.ts
    ├── prisma/schema.prisma
    └── scripts/kvch-worker.ts
```

The final names may be adjusted to repository conventions during implementation, but circuits, protocol schemas, prover, verifier, contracts, and web orchestration must remain separable.

## Strict Step-by-Step Implementation Plan

### Step 1 — Freeze subsystem boundaries and ownership ✅

1. Create a responsibility matrix before coding.
2. Assign the ZK subsystem ownership of schemas, canonicalization, commitments, circuits, proof generation, proof verification, council attestations, ledger submission, indexing, and independent verification bundles.
3. Assign the other KVCH team ownership of risk calculations, finding production, production identity, DLP scanning, disclosure drafting, approval UX, stakeholder entitlement, and peer-local matching logic.
4. Define that upstream teams integrate only through signed adapter envelopes; direct reads from their private tables are forbidden.
5. Define that the ZK subsystem may store immutable copies or digests of accepted input envelopes but may not reinterpret upstream business calculations.
6. Define failure behavior: missing schema version, invalid signature, unknown issuer, stale input, mismatched digest, inactive policy, or unavailable adapter produces a terminal validation error and no proof/publication.
7. Record the exact non-claims shown to users: proof validity does not prove real-world truth, model accuracy, security, compliance, or absence of undisclosed incidents.

**Exit gate:** every required input and output has one owning subsystem and one named trust assumption.

### Step 2 — Freeze exact predicate semantics before selecting tools ✅

1. Write a one-sentence statement for each circuit.
2. Freeze half-open monetary ranges as `[lower, upper)`.
3. Freeze integer-only monetary values in minor currency units.
4. Freeze confidence as unsigned basis points `0..10000`.
5. Freeze severity as a versioned integer enum.
6. Freeze time as an integer epoch with an explicit epoch duration and UTC origin.
7. Freeze bounded array capacities for evidence leaves, required source families, approvals, Merkle depth, and payload fields.
8. Freeze public/private input ordering and flattening.
9. Freeze the exact fields included in claim IDs, nullifiers, report commitments, evidence commitments, and approval commitments.
10. Freeze whether each rule is enforced in-circuit, by verifier nodes, by the Celo contract, or by more than one layer.
11. Publish a predicate-to-enforcement matrix. No UI or API may say a property is “proven” if it is checked only by an off-chain verifier-service policy.

**Exit gate:** product, cryptography, and integration owners approve the predicate matrix and public-input inventory.

### Step 3 — Run the Noir/NoirJS/Barretenberg compatibility spike

1. Do not install unpinned `latest`, `main`, `next`, or floating nightly dependencies.
2. Enumerate candidate stable/beta version triplets for `nargo`, `@noir-lang/noir_js`, and `@aztec/bb.js` that are at least seven days old.
3. Prefer an officially documented compatible pair, then validate it independently.
4. Install `nargo` and `bb` through version managers with explicit versions inside a disposable development environment.
5. Build a minimal circuit containing private input, public input, bounded integer comparison, selected Poseidon/Poseidon2 hash, and a Merkle-path check.
6. Compile with Nargo and execute a witness with both Nargo and NoirJS.
7. Generate and verify an UltraHonk proof with the `bb` CLI.
8. Generate and verify the same semantic proof with NoirJS plus `UltraHonkBackend` in Node.
9. Compare proof/public-input serialization, field ordering, verification keys, and artifact digests.
10. Test Node worker-thread counts, peak memory, proof time, verifier time, and cleanup.
11. Verify the selected API supports explicit verifier targets and does not silently use deprecated proof options.
12. Record whether the selected proof flavor uses a trusted/universal setup and which SRS artifacts are downloaded or bundled.
13. Confirm whether verification can run with no outbound network after artifacts/SRS are pre-provisioned.
14. Reject any triplet that requires runtime downloads, produces unstable public-input encoding, cannot be reproduced in Linux, or lacks a usable verifier API.
15. Produce `toolchain.lock`/manifest fields for exact versions and SHA-256 digests.
16. Keep the Barretenberg Solidity-verifier path as a benchmark artifact only; do not connect it to the selected off-chain-quorum contract flow.

**Exit gate:** CLI and Node proof generation/verification pass the same vectors on macOS development and the target Linux container, with versions and digests pinned.

### Step 4 — Establish isolated build and package boundaries

1. Add the Noir workspace under `zk/`.
2. Add independent TypeScript packages for protocol logic and adapter contracts.
3. Add separate Node services for prover and verifier; do not run witness construction inside a browser or a public Next.js route.
4. Add a Foundry contract project under `contracts/`.
5. Keep `web/` on its current npm/Next.js conventions and consume protocol/adapters through a pinned local package artifact during development.
6. Avoid forcing unrelated repository code into a new monorepo package manager unless a compatibility test proves it is safe.
7. Add build output directories, proof artifacts, witness files, SRS caches, deployment keys, and local chain state to `.gitignore`.
8. Ensure no generated witness or `Prover.toml` containing private values can be committed.
9. Add license, SBOM, and source-attribution handling for Noir dependencies, Barretenberg, OpenZeppelin, and any hash/Merkle library.

**Exit gate:** each module builds independently and no private build/runtime artifact is tracked by Git.

### Step 5 — Define the plug-and-play adapter SDK

Create versioned interfaces and JSON Schemas for:

1. `FindingSourceAdapter`:
   - company ID, finding ID, `kvch.finding/v1` payload digest, observed/ingested times, source type, extension artifact digest, run ID, authenticity level, issuer key ID, and signature.
2. `RiskResultAdapter`:
   - company ID, result ID, reporting period, currency, exact private EAL/VaR/CVaR fields, evidence commitment reference, model/parameter bundle commitment, freshness/completeness masks, result nonce, issuer key ID, and signature.
3. `DlpDecisionAdapter`:
   - draft/claim ID, canonical projection digest, prohibited-data mask, scanner-policy digest, pass/fail, evaluated time, expiry, issuer key ID, and signature.
4. `ApprovalProviderAdapter`:
   - claim draft digest, council set/version, action type, signer identity, signer role, decision, nonce, issued/expiry time, and EIP-712 signature.
5. `IdentityRegistryAdapter`:
   - company identity, council member identity, role mask, signing addresses, verifier-node attestation address, key validity, revocation state, and registry version.
6. `PolicyProviderAdapter`:
   - immutable policy artifact, canonical digest/commitment, effective interval, circuit compatibility, thresholds, source requirements, TTL, and governance signature.
7. `PayloadProviderAdapter`:
   - minimized STIX object or report projection, classification/marking, recipient policy, plaintext commitment, ciphertext digest, access-manifest digest, and expiry.
8. `ArtifactStoreAdapter`:
   - content-addressed put/get/head, tenant namespace, digest verification, retention, and delete/crypto-erase status.
9. `SigningProviderAdapter`:
   - sign typed data by key purpose without exposing raw keys to application code.
10. `LedgerClientAdapter`:
    - chain identity, contract manifest, read, simulate, submit, receipt, finality, and event-cursor interfaces.

For every adapter:

- reject unknown fields;
- include schema and protocol versions;
- use canonical bytes rather than ordinary JSON serialization for signatures;
- include issuer, purpose, audience, environment, and expiry;
- include idempotency and replay domains;
- define maximum payload sizes;
- return typed error codes;
- provide conformance fixtures and a validator CLI;
- support remote HTTP/mTLS and in-process implementations without changing core proof logic.

**Exit gate:** another team can implement an adapter using only the package contract, fixtures, and conformance tests.

### Step 6 — Implement canonical encoding and domain separation

1. Select one language-independent canonical encoding profile.
2. Use fixed schema/version prefixes, fixed-width unsigned integers, declared endianness, normalized UTF-8, deterministic array ordering, explicit absent/null distinction, and maximum lengths.
3. Prohibit floats, NaN, locale formatting, implicit time zones, duplicate keys, and unordered maps.
4. Define domain tags for every object: evidence leaf, evidence snapshot, policy, risk result, report, payload, approval, claim, nullifier, endorsement, verifier attestation, revocation, supersession, and dispute.
5. Bind chain ID, contract address, environment, consortium/community, circuit ID, and protocol version where replay protection requires them.
6. Implement canonicalization first in `packages/zk-protocol`.
7. Implement matching field encoding in Noir.
8. Implement only the minimal Solidity encoding needed to recompute on-chain IDs and EIP-712 hashes.
9. Produce golden vectors containing canonical bytes, SHA-256 digest, circuit-field encoding, Poseidon/Poseidon2 commitment, and expected flattened public inputs.
10. Test malformed encodings, leading zeros, oversized integers, Unicode edge cases, duplicate keys, reordering, absent versus null, and cross-language equality.

**Exit gate:** TypeScript, Noir, and Solidity agree on every shared digest/ID vector.

### Step 7 — Select and freeze cryptographic primitives

1. Use SHA-256 for source trees, containers, standard artifacts, proof bundles, verification keys, contract bytecode, and ordinary audit tooling.
2. Select a circuit-friendly hash only after the compatibility spike; prefer the backend-supported audited Poseidon/Poseidon2 variant.
3. Pin the exact Noir hash library source commit/tag and parameters.
4. Document field modulus, input packing, byte-to-field rules, arity, sponge mode, and domain-tag encoding.
5. Define a fixed-depth Merkle construction: hash, arity, empty leaf, padding, leaf count commitment, path index order, and maximum depth.
6. Generate at least 128 bits of CSPRNG entropy for every hiding nonce/salt.
7. Never publish a plain hash of low-entropy IPs, hostnames, ports, CVEs, package names, people, or service names.
8. Separate standard artifact digests from circuit commitments with signed bridge records.
9. Add RNG failure tests and duplicate-salt detection for development/test environments.
10. Commission primitive/library review before pilot activation.

**Exit gate:** a cryptography manifest fully specifies every primitive and no digest is treated as interchangeable with another.

### Step 8 — Implement immutable evidence snapshots

1. Accept only validated signed source envelopes through `FindingSourceAdapter` or another approved source adapter.
2. Derive evidence leaves from canonical fields, not raw JSON stringification.
3. Bind each leaf to company, source type, approved artifact digest, record ID, observed/ingested time, payload digest, classification, authenticity level, and random salt.
4. Sort leaves by a declared stable key or assign stable indices.
5. Reject duplicate record IDs unless the snapshot policy defines explicit version semantics.
6. Build the fixed Merkle tree and commit leaf count to prevent padding ambiguity.
7. Store an ordered manifest SHA-256 digest, circuit root, archive digest, selection policy, normalization version, creator, retention class, and timestamps.
8. Make snapshots immutable; corrections create a new snapshot.
9. Store salts/openings encrypted and tenant-scoped only when audit reopening requires them.
10. Supply inclusion proofs only to the local witness builder or controlled audit flow.
11. Add a signature over the snapshot manifest.
12. Add tests for ordering, duplicates, padding, maximum leaves, path tampering, clock skew, and deletion tombstones.

**Exit gate:** the same accepted input set always produces the same ordered manifest and tree root, while hiding salts prevent dictionary opening.

### Step 9 — Define council identity, keys, and threshold governance

1. Model a versioned `CouncilSet` with set ID, active interval, members, company/stakeholder classification, role masks, approval signing address, verifier attestation address, governance address, and status.
2. Allow the same entity to occupy all three duties but require duty-specific keys where operationally possible.
3. Define separate EIP-712 types for:
   - `DisclosureApproval`;
   - `VerificationAttestation`;
   - `PolicyActivation`;
   - `CouncilSetChange`;
   - `ClaimRevocation`;
   - `ClaimSupersession`;
   - `DisputeDecision`.
4. Include chain ID, verifying contract, protocol version, action, subject digest, council set ID, nonce, issue time, and deadline in each typed message.
5. Define separate thresholds by action class rather than one global threshold.
6. Default development to 2-of-3.
7. Require delayed governance for changing members or lowering thresholds.
8. Record the council-set snapshot used by every approval and verification decision so later membership changes cannot rewrite historical meaning.
9. Use unique signer identities and sorted signer addresses; reject duplicates.
10. Support EOAs and ERC-1271 contract wallets through OpenZeppelin `SignatureChecker`.
11. Use a Safe on Celo Sepolia as the administrative owner/authority where supported, but do not collapse per-verifier votes into an opaque single signature unless the threshold semantics remain independently auditable.
12. Define emergency guardian scope: pause new claims, invalidate a verifier set, and revoke compromised keys without deleting history.
13. Document that council independence is organizational, not guaranteed by software when the same parties control multiple roles.

**Exit gate:** replay, duplicate signer, expired signature, inactive set, wrong action, wrong chain, and wrong contract tests all fail.

### Step 10 — Implement policy artifacts and public taxonomies

1. Define versioned integer codebooks for claim type, threat family, sector, severity band, confidence band, currency, reporting period, source family, approval role, authenticity level, state, dispute reason, and revocation reason.
2. For the synthetic demo, include `MALICIOUS_MODEL_DESERIALIZATION` but do not let an LLM invent codes.
3. Define immutable policy fields for each claim type.
4. Commit the complete policy witness in-circuit and expose its policy commitment publicly.
5. Register the standard artifact digest, circuit commitment, effective interval, circuit ID, and council approval on Celo.
6. Require verifier nodes to compare the public commitment with the active on-chain policy record.
7. Keep thresholds configurable by policy while keeping circuit data shape and maximum bounds fixed.
8. Reject policies whose threshold exceeds circuit capacity, whose range bands overlap, whose TTL is invalid, or whose source mask contains unknown bits.
9. Version migrations; never reinterpret an old integer code under a new taxonomy.

**Exit gate:** every accepted claim resolves to one immutable active policy and codebook version.

### Step 11 — Build shared Noir libraries

1. Implement checked integer range helpers that prevent field wraparound.
2. Implement fixed enum validation.
3. Implement half-open range checks.
4. Implement epoch/freshness arithmetic with explicit bounds.
5. Implement bit-mask checks for required sources and prohibited data.
6. Implement selected hash and domain-separation helpers.
7. Implement Merkle inclusion with boolean-constrained path bits.
8. Implement fixed-length padded-array logic with committed actual length.
9. Implement claim-ID and nullifier derivation.
10. Implement policy commitment and report/evidence/payload commitments.
11. Avoid unconstrained functions for security-critical results unless their results are fully constrained.
12. Add unit, negative, fuzz, boundary, and maximum-capacity tests for each helper.

**Exit gate:** shared libraries pass independent golden vectors before any claim circuit depends on them.

### Step 12 — Implement `ThreatEligibilityV1`

Public inputs must include:

- protocol version;
- community/consortium ID;
- Celo chain ID and claim-registry address;
- claim ID and claim-series ID/version;
- identified issuer/company code;
- claim family, sector, severity band, confidence band;
- observed, valid-from, and expiry epochs;
- policy commitment and circuit version;
- evidence commitment and payload commitment;
- source-artifact/normalization commitment where policy requires it;
- approval-manifest commitment;
- DLP-decision commitment;
- unique disclosure/nullifier value.

Private witness must include:

- exact confidence basis points and severity code;
- exact observation/source times;
- evidence snapshot opening/path data;
- required source mask and source timestamps;
- normalized family derivation inputs;
- DLP prohibited-data mask and signed-decision binding fields;
- policy fields/opening;
- approval manifest fields/opening;
- payload field vector and nonce;
- claim nonce.

Circuit constraints must:

1. constrain every enum/range/length;
2. recompute all public commitments;
3. enforce active policy interval relative to observation epoch;
4. enforce exact confidence and severity thresholds and disclosed bands;
5. enforce required source-mask coverage and freshness;
6. enforce prohibited-data mask equals zero;
7. enforce deterministic threat-family mapping;
8. enforce sector/community compatibility;
9. bind approval and DLP commitments to the same claim draft/public-input digest;
10. enforce expiry after observation and within policy maximum;
11. derive the disclosure nullifier/unique ID;
12. recompute the claim ID from all replay-relevant public inputs.

Do not parse raw logs, execute detector code, call an LLM, or infer legal reportability in-circuit.

**Exit gate:** minimum/maximum valid vectors pass and every individual predicate mutation fails.

### Step 13 — Implement `StakeholderRiskBandV1`

Public inputs must include:

- protocol/circuit domain;
- identified issuer;
- audience/purpose ID;
- reporting period and currency code;
- EAL lower/upper bounds and optional separately enabled VaR bounds/percentile;
- optional risk-appetite relation code;
- policy commitment;
- risk-result, evidence-snapshot, model-bundle, report, approval, and DLP commitments;
- issued and valid-until epochs;
- unique disclosure/nullifier ID.

Private witness must include:

- exact integer-minor-unit risk values;
- immutable signed risk-result adapter envelope;
- feature completeness/freshness masks;
- evidence and model lineage references;
- report projection fields and nonce;
- policy fields/opening;
- approval and DLP manifest openings;
- exact appetite threshold if only relation is disclosed.

Circuit constraints must:

1. enforce `[lower, upper)` range semantics;
2. prevent monetary overflow/wraparound;
3. recompute risk-result/report/policy commitments;
4. bind the evidence and model commitments used by the risk result;
5. bind reporting period/currency;
6. enforce required input-family completeness and freshness;
7. enforce report projection commitment;
8. bind approval/DLP commitments to the exact disclosure digest;
9. enforce issue/expiry and policy intervals;
10. derive a unique disclosure ID scoped by issuer, audience, purpose, metric, and period.

The adapter signature proves provenance only to the extent the issuer key is trusted. The circuit does not prove model correctness.

**Exit gate:** boundary, overlapping-range, stale-input, wrong-lineage, wrong-report, and repeated-disclosure tests pass.

### Step 14 — Implement `PeerEndorsementV1`

1. Keep company identity public in V1, consistent with the selected identified mode.
2. Bind the endorsement to target claim ID, target version, issuer company, endorsement policy, local evidence commitment, local match class, epoch, expiry, and endorsement nullifier.
3. Keep exact local match score, affected local assets, and local evidence private.
4. Prove the exact local match score crosses policy threshold and maps to the disclosed match class.
5. Prove local evidence freshness and commitment membership.
6. Derive one nullifier per identified company, target claim/version, and scope.
7. Have the contract reject duplicate nullifiers and origin self-endorsement when policy forbids it.
8. Keep local risk-delta calculation outside the circuit and outside the ZK subsystem adapter boundary.
9. Define a future `AnonymousEndorsementV2` extension point but do not include anonymous claims, relayers, or private membership roots in V1.

**Exit gate:** two unique companies can endorse; duplicate company/nullifier and ineligible self-endorsement fail.

### Step 15 — Implement `EvidenceInclusionV1`

1. Accept a public evidence-snapshot commitment and a public or selectively disclosed record commitment.
2. Keep the record body, salt, leaf index, and Merkle siblings private unless the controlled audit workflow explicitly releases them.
3. Recompute the leaf and Merkle path under the frozen tree construction.
4. Bind the proof to company, snapshot purpose, snapshot version, and audit-request ID.
5. Add expiry and one-purpose disclosure scoping to prevent reusing an audit proof in an unrelated context.
6. Do not publish this proof on the consortium feed by default; store only an optional report anchor/attestation reference.

**Exit gate:** valid inclusion passes; wrong leaf, salt, index, sibling, root, purpose, or snapshot version fails.

### Step 16 — Define approval handling honestly

1. Verify human/council EIP-712 approval signatures outside the circuit in the company-local orchestration and again on every verifier node.
2. Build an immutable canonical approval manifest containing distinct eligible signers, roles, decisions, claim digest, council set, nonces, deadlines, and signatures.
3. Commit the manifest in the claim circuit so the proof cannot be detached from the approved draft.
4. Do not claim that ECDSA approval signatures are verified in-circuit in V1.
5. State the exact composite assurance: the ZK proof establishes the deterministic private predicate and binding to an approval-manifest commitment; the governed verifier quorum separately establishes that the committed approval manifest contained valid M-of-N signatures.
6. Add an explicit later gate for `ApprovalQuorumV2` with in-circuit signature verification only if reviewer anonymity or trust reduction justifies its cost.

**Exit gate:** changing any claim/public field invalidates the approval binding and verifier nodes reject invalid, duplicate, expired, or wrong-role approvals.

### Step 17 — Build deterministic proof bundles

Define a content-addressed public bundle containing:

- protocol and claim schema versions;
- canonical public claim envelope;
- flattened public-input array plus named-field map;
- proof bytes and proof encoding;
- compiled circuit artifact digest/reference;
- verification-key digest/reference;
- policy artifact digest/reference;
- codebook/taxonomy digest/reference;
- evidence/report/payload commitments only, never openings;
- approval-manifest commitment plus audience-safe approval summary;
- DLP-decision commitment;
- local pre-verification result;
- prover image/toolchain/source/SBOM digests;
- issue/expiry information;
- SHA-256 bundle digest;
- human-readable predicate and non-claims.

1. Specify byte encoding and compression.
2. Keep proof bytes off-chain; store the bundle in content-addressed storage.
3. Anchor bundle digest and opaque reference digest on Celo.
4. Ensure an independent verifier can download artifacts without the KVCH private database.
5. Reject mutable URLs and bearer secrets as ledger references.

**Exit gate:** unpacking and re-hashing the bundle reproduces its digest and independent verification requires no private data.

### Step 18 — Implement the company-local prover service

1. Expose a private authenticated job interface accepting only opaque registered IDs and expected digests, never arbitrary uploaded witness JSON.
2. Re-authorize company and purpose at job execution time.
3. Reload signed adapter envelopes from tenant-scoped storage.
4. Re-run schema validation, issuer-key validation, canonicalization, policy checks, and expected public-input construction.
5. Verify approval and DLP signatures before witness construction.
6. Verify circuit, Noir, NoirJS, Barretenberg, verification-key, SRS, container, and policy digests against the release manifest.
7. Execute the circuit with NoirJS to produce the witness.
8. Generate an UltraHonk proof using the pinned Barretenberg backend.
9. Verify the proof locally using a separately loaded verification key/API path.
10. Compare generated public inputs to the approved expected digest byte-for-byte.
11. Create and sign the proof-job manifest and public bundle.
12. Store public artifacts only after local verification.
13. Destroy witness objects and ephemeral files in `finally` paths on success, failure, cancellation, and timeout.
14. Disable outbound network after all required artifacts are mounted.
15. Run non-root with read-only root filesystem, private temporary directory, no Docker socket, no core dumps, and strict CPU/memory/disk/process/wall-time limits.
16. Log only IDs, artifact digests, durations, sizes, and non-sensitive error codes.
17. Add per-company queue/concurrency quotas and deterministic backpressure.

**Exit gate:** raw witness material is absent from logs, proof bundles, crash artifacts, support output, and retained temporary storage.

### Step 19 — Implement independent verifier nodes

1. Deploy at least three independently configured verifier instances for pilot quorum testing.
2. Give each node its own attestation key and council membership record.
3. Accept only a proof-bundle digest/reference and expected claim ID.
4. Fetch from an allowlisted content-addressed artifact store with size limits and SSRF protection.
5. Verify every bundle/artifact digest before parsing.
6. Verify proof/public inputs using the pinned verification key and Barretenberg version.
7. Independently reconstruct claim ID and public-input digest.
8. Resolve Celo chain, contract, council set, policy, circuit, artifact, issuer, and status using independently configured RPC endpoints.
9. Re-check approval signatures, DLP signature, source/risk adapter signatures, time validity, policy compatibility, and issuer status.
10. Verify that no field claimed as in-circuit enforcement is merely trusted metadata.
11. Produce an EIP-712 `VerificationAttestation` over claim ID, bundle digest, public-input digest, circuit/key/policy digests, council set ID, verifier node ID, decision, reason code, nonce, issue time, and deadline.
12. Never sign an attestation for a locally unverifiable proof or unknown artifact.
13. Keep deterministic reason codes and omit private diagnostics.
14. Implement one CLI-based verification path and one NoirJS-based path where feasible to reduce wrapper-level correlated failure.
15. Add node health, key rotation, revocation, and equivocation detection.

**Exit gate:** M valid distinct nodes sign the same exact digest; any mismatch produces no quorum.

### Step 20 — Implement the quorum aggregator/publication gateway

1. Accept verifier attestations only for one exact claim/bundle/public-input digest tuple.
2. Validate EIP-712 domains, active council set, verifier role, signature, nonce, deadline, and decision.
3. Deduplicate by verifier identity; do not count multiple keys or retries from one council seat unless governance explicitly creates separate seats.
4. Sort signer/signature pairs deterministically.
5. Require the action-specific threshold active when the proof job was approved and again at submission time.
6. Re-check current circuit/policy/verifier-set pause/invalidation state immediately before submission.
7. Simulate the Celo transaction before signing/broadcasting.
8. Use an external signing provider for the publisher transaction key.
9. Persist idempotency by chain ID, contract, claim ID, bundle digest, and action.
10. Return existing transaction/status for repeated requests.
11. Reconcile uncertain nonce/receipt states before retrying.
12. Never downgrade to one verifier or a local server signature when quorum is unavailable.

**Exit gate:** quorum cannot be fabricated by duplicate signatures, stale sets, mixed bundle digests, or replayed attestations.

### Step 21 — Implement the Celo contract suite

Use Solidity and a pinned OpenZeppelin Contracts 5.x release at least seven days old.

1. `CouncilRegistry`:
   - immutable/versioned council sets;
   - duty-specific member keys and role masks;
   - active intervals and revocations;
   - approval, verifier, governance, dispute, and emergency thresholds;
   - delayed set/threshold changes;
   - historical set lookup.
2. `ArtifactPolicyRegistry`:
   - protocol, circuit, compiled artifact, verification key, proof flavor, policy, codebook, source, audit, and container digests;
   - effective intervals and compatibility;
   - pause, deprecate, and invalidate without deleting history.
3. `ClaimAttestationRegistry`:
   - minimized claim header;
   - proof-bundle digest/reference digest;
   - public-input digest;
   - policy/circuit/verifier-set IDs;
   - M-of-N verification-attestation validation;
   - used claim IDs and nullifiers;
   - expiry, revocation, supersession, and invalidation state;
   - O(1) mappings and events, with no unbounded loops over history.
4. `EndorsementRegistry`:
   - active target claim checks;
   - endorsement proof-bundle attestation;
   - unique company/nullifier checks;
   - endorsement count and corroboration threshold;
   - policy-controlled exclusion of origin.
5. `DisputeLifecycleRegistry`:
   - dispute reason code and restricted evidence digest;
   - opening, resolution, status transition, and appeal references;
   - no sensitive dispute narrative on-chain.
6. Use EIP-712 and `SignatureChecker` for EOA/ERC-1271 support.
7. Enforce sorted unique signers and bounded signature arrays.
8. Bind all signatures to Celo Sepolia chain ID and exact verifying contract.
9. Use `AccessManager`/`AccessManaged` or an equivalently auditable delayed authority model.
10. Put administrative authority behind a Celo Sepolia Safe/council process.
11. Keep new submissions pausable while preserving read and emergency revocation paths.
12. Prefer immutable versioned contracts plus a governed registry/router over unrestricted proxy upgrades.
13. Emit no raw proof, raw approval signature, private value, or sensitive payload field.

**Exit gate:** unauthorized actions, malformed signatures, duplicates, expired attestations, inactive artifacts/policies/sets, wrong-chain replay, and invalid transitions all revert.

### Step 22 — Test contracts locally before Celo deployment

1. Pin Foundry and Solidity compiler versions.
2. Run formatting and deterministic builds.
3. Unit-test every role, threshold, signature, state transition, and boundary timestamp.
4. Fuzz signer ordering, duplicate signers, thresholds, nonce reuse, deadlines, calldata sizes, and state transitions.
5. Add invariants:
   - used claim/nullifier cannot be accepted again;
   - no inactive policy/circuit/council set accepts a new claim;
   - terminal invalidated/revoked state is never active;
   - endorsement count never exceeds unique eligible endorsers;
   - historical registry mappings cannot be rewritten;
   - paused submission cannot block authorized revocation.
6. Test ERC-1271 signatures with a Safe-compatible mock.
7. Test wrong chain ID and wrong verifying contract.
8. Test malformed and oversized proof-bundle references/signature arrays.
9. Produce gas and bytecode-size snapshots.
10. Deploy to a local Anvil chain using deterministic scripts and create a deployment manifest.
11. Run a complete local off-chain quorum-to-contract integration test.

**Exit gate:** unit, fuzz, invariant, integration, gas, and bytecode digest checks pass.

### Step 23 — Deploy and verify on Celo Sepolia

1. Configure Celo Sepolia chain ID `11142220` and an environment-provided RPC endpoint; do not hard-code a sole production RPC dependency.
2. Use the official Forno endpoint only as a best-effort development RPC and configure a second provider for reconciliation testing.
3. Fund deployment and publisher accounts with test CELO through approved testnet processes.
4. Keep private keys out of shell history, repository files, logs, CI output, and browser code.
5. Deploy authority/council registry first, then artifact/policy registry, claim registry, endorsement registry, and dispute registry.
6. Configure council set, 2-of-3 development verifier threshold, approval threshold, governance delays, guardian, and Safe authority.
7. Register only toolchain/circuit/policy artifacts whose reproducible build checks pass.
8. Verify source on Celo Sepolia Blockscout using Foundry-compatible verification.
9. Record chain ID, genesis/network identity, addresses, constructor arguments, deployer, transaction hashes, block numbers/hashes, source/bytecode digests, compiler settings, and verification links in an immutable deployment manifest.
10. Pin the deployment manifest digest in web/prover/verifier configuration.
11. Test one valid and one invalid attestation submission, then revoke the test claim.

**Exit gate:** independently reading Celo Sepolia reproduces registered artifacts, quorum, claim state, and lifecycle events from the deployment manifest.

### Step 24 — Extend ZK persistence without coupling to upstream tables

Add Prisma models and migrations for ZK-owned state only:

- `ZkInputBundle`;
- `ZkEvidenceSnapshot`;
- `ZkCircuitVersion`;
- `ZkPolicyVersion`;
- `ZkCouncilSetMirror`;
- `ZkClaim`;
- `ZkProofJob`;
- `ZkProofArtifact`;
- `ZkVerificationVote`;
- `ZkVerificationQuorum`;
- `ZkLedgerSubmission`;
- `ZkClaimEventMirror`;
- `ZkEncryptedPayload`;
- `ZkPeerAssessmentReference`;
- `ZkAuditEvent`.

Requirements:

1. Require `companyId` on every private record.
2. Store immutable source envelope references/digests, not foreign keys into unfinished upstream schemas.
3. Store public inputs as both canonical bytes/digest and a validated named projection.
4. Store proof artifacts by digest/reference, not large mutable database blobs unless a measured reason requires it.
5. Store verification votes uniquely by claim, bundle digest, council set, and verifier identity.
6. Store chain state with transaction hash, nonce, block number/hash, finalized time, and reconciliation cursor.
7. Store append-only audit events for every consequential transition.
8. Use explicit enums and database uniqueness constraints for idempotency.
9. Create corrections through superseding records, not updates to immutable proof semantics.
10. Add migrations and repository-layer tenant filters; never rely on callers to remember company scoping.

**Exit gate:** database constraints reject cross-company references, duplicate semantic jobs/votes/submissions, and invalid immutable updates.

### Step 25 — Implement ZK API contracts

Provide authenticated internal APIs:

```text
POST /api/zk/input-bundles
POST /api/zk/snapshots
POST /api/zk/claims/compose
POST /api/zk/claims/:id/validate
POST /api/zk/claims/:id/prove
POST /api/zk/claims/:id/verify-local
POST /api/zk/claims/:id/request-quorum
POST /api/zk/claims/:id/publish
POST /api/zk/claims/:id/revoke
POST /api/zk/claims/:id/supersede
POST /api/zk/claims/:id/dispute
GET  /api/zk/claims/:id
GET  /api/zk/claims/:id/bundle
GET  /api/zk/claims/:id/status
```

Provide public/audience-authorized verifier APIs:

```text
GET  /api/verifier/claims/:claimId
GET  /api/verifier/claims/:claimId/status
GET  /api/verifier/artifacts/:artifactId
POST /api/verifier/verify
GET  /api/consortium/claims
GET  /api/consortium/claims/:claimId
POST /api/consortium/claims/:claimId/endorse
GET  /api/consortium/claims/:claimId/payload
```

For every route:

1. derive company/user identity from server-verified auth, never request fields;
2. enforce role/action authorization through an injectable authorization adapter;
3. validate strict request/response schemas;
4. require idempotency keys on mutating operations;
5. enforce CSRF/replay/step-up controls for approve, publish, revoke, dispute, and admin actions;
6. return stable ZK error codes without witness/private diagnostics;
7. never accept arbitrary raw witness material;
8. re-authorize inside background jobs;
9. redact proof-bundle references according to audience;
10. rate-limit verification and bundle retrieval.

**Exit gate:** API contract tests pass with both in-process synthetic adapters and remote adapter mocks.

### Step 26 — Add durable pg-boss workflows

Register versioned queues for:

- snapshot creation;
- input validation;
- claim composition;
- witness build/proof generation;
- local proof verification;
- verifier-node fan-out;
- quorum aggregation;
- Celo submission;
- receipt/finality confirmation;
- chain reconciliation;
- event indexing;
- expiry;
- revocation/supersession propagation;
- payload encryption/rewrap/deletion;
- artifact integrity checks.

1. Add job payload schemas and reject malformed jobs.
2. Include company, purpose, claim/version, expected public-input digest, artifact digest, and idempotency key.
3. Separate resource classes for each circuit.
4. Distinguish deterministic failures from transient RPC/storage/resource failures.
5. Retry transient work with bounded backoff and jitter.
6. Never retry an unsatisfied constraint as if it were infrastructure failure.
7. Reconcile uncertain Celo submissions before resubmitting.
8. Keep exactly-once semantic effects on top of at-least-once job delivery.
9. Extend `scripts/kvch-worker.ts` to register the ZK workers without coupling existing extension jobs to proof availability.
10. Ensure ZK queue failure never blocks existing finding generation or mandatory reporting.

**Exit gate:** process restarts, duplicate delivery, RPC timeout, and worker crash cannot create duplicate claims or mixed proof artifacts.

### Step 27 — Implement lifecycle state machines

Use explicit internal states:

```text
INPUT_PENDING → INPUT_VALIDATED → COMPOSED → APPROVAL_BOUND
→ SNAPSHOTTED → PROVING → LOCALLY_VERIFIED
→ QUORUM_PENDING → QUORUM_VERIFIED → SUBMITTING
→ SUBMITTED → FINALIZED
```

Support terminal/recovery states:

```text
VALIDATION_FAILED | PROOF_FAILED | QUORUM_FAILED | SUBMISSION_FAILED
EXPIRED | REVOKED | SUPERSEDED | DISPUTED | INVALIDATED
```

1. Define a transition table and permitted actor/job for every edge.
2. Make proof/public-input semantics immutable after approval binding.
3. Require a new claim version after any semantic edit.
4. Derive current ledger state from finalized Celo events.
5. Make expiry computable even if no expiry transaction is sent.
6. Propagate revocation, supersession, dispute, and invalidation to read APIs and downstream adapters.
7. Preserve history; never delete a false or revoked public attestation.
8. Display local, quorum, submitted, and finalized status distinctly.

**Exit gate:** property tests prove invalid transitions and stale statuses cannot be presented as active verification.

### Step 28 — Build the Celo indexer and reconciliation loop

1. Start from a configured deployment block and contract manifest.
2. Read logs in bounded ranges from multiple configured RPCs.
3. Persist block number/hash, transaction hash, log index, and decoded event.
4. Make event identity unique by chain, transaction hash, and log index.
5. Delay materialized final state until the configured Celo finality policy is met.
6. Detect block-hash disagreement/reorg and roll back only unfinalized mirrors.
7. Rebuild the current claim mirror deterministically from finalized events.
8. Reconcile local submissions against chain state after restart or timeout.
9. Alert on chain ID mismatch, contract bytecode mismatch, stalled cursor, divergent RPC heads, or unexpected admin events.
10. Expose indexer lag and last finalized block.

**Exit gate:** deleting and rebuilding the mirror yields the same active claim state.

### Step 29 — Integrate stakeholder verification without rebuilding the stakeholder product

1. Provide a reusable server component/API projection for a claim card.
2. Expose exact human-readable predicate, issuer, audience, reporting period, disclosed band, policy/circuit/version, issue/expiry, quorum, Celo transaction/finality, current lifecycle status, and bundle download.
3. Show “what was proven” separately from “what verifier nodes additionally checked.”
4. Show “not proven” with equal prominence.
5. Never expose exact EAL, raw evidence, model inputs, internal topology, salts, or approval signatures.
6. Supply deterministic text templates so the other team can integrate without an LLM.
7. Supply a verifier CLI that downloads a bundle, checks digests, verifies the proof, validates quorum/on-chain state, and emits a machine-readable result.
8. Refuse to show expired, revoked, superseded, disputed, or invalidated claims as current.
9. Provide integration examples for the other team’s stakeholder room rather than taking ownership of its full UX/authentication.

**Exit gate:** an independent user verifies a stakeholder claim without access to KVCH’s private database.

### Step 30 — Integrate consortium intake without rebuilding peer risk logic

1. Expose a paginated finalized claim feed filtered by family, status, policy, and time.
2. Verify ledger/current state before returning active claims.
3. Return only minimized approved public inputs and authorized encrypted-payload references.
4. Define an outbound `VerifiedConsortiumClaimV1` adapter envelope for the other team.
5. Require the receiving system to return a signed `LocalAssessmentV1` result before endorsement or any downstream risk action.
6. Preserve the semantic distinction between observed pattern, exploit attempt, compromise status, service impact, confidence, and corroboration.
7. Never set a receiving company’s compromise status.
8. Keep risk-delta computation outside the ZK subsystem; accept/store only a bounded assessment reference for audit.
9. Propagate revocation/expiry/dispute events through a webhook or polling contract with idempotency.

**Exit gate:** Company A’s claim reaches Company B as external context only; no local match creates no endorsement or ZK-driven risk change.

### Step 31 — Implement optional encrypted STIX payload handling

1. Validate minimized STIX 2.1 through an official-compatible validator before encryption.
2. Generate a random DEK per payload/version.
3. Encrypt with an approved AEAD mode and unique nonce.
4. Bind claim ID, policy, audience, schema, version, marking, and expiry as associated data.
5. Wrap the DEK separately for authorized recipient organizations through the key adapter.
6. Maintain separate plaintext circuit commitment, ciphertext SHA-256 digest, and access-manifest digest.
7. Never expose a plaintext standard hash for a guessable payload.
8. Store only an opaque reference digest and commitments on Celo.
9. Authenticate recipient, current claim status, marking, key version, and authorization before retrieval.
10. Use short-lived retrieval authorization and log access without logging decrypted content.
11. Revoke retrieval immediately on claim revocation; support key rewrap and crypto-erasure subject to retention policy.
12. Keep TAXII 2.1 transport behind an adapter; do not invent an incompatible TAXII-like protocol.

**Exit gate:** only an authorized recipient decrypts the payload and verifies it against the committed claim.

### Step 32 — Enforce privacy-budget and low-entropy protections

1. Maintain a disclosure ledger keyed by issuer, audience, purpose, metric, and period.
2. Before stakeholder publication, intersect the proposed band with prior active/historical disclosures available to the same audience.
3. Reject or escalate disclosures that narrow hidden values beyond policy.
4. Allow only fixed council-approved bands; do not permit stakeholder-selected arbitrary ranges.
5. Enforce one active disclosure per metric/purpose/period where policy requires it.
6. Inventory every public input for entropy, dictionary risk, timing correlation, frequency leakage, identity leakage, and cumulative disclosure.
7. Prohibit low-entropy raw hashes and sensitive URLs.
8. Coarsen public time and cap claim frequency where policy allows.
9. Add a CI public-input inventory diff requiring explicit privacy approval for new fields.

**Exit gate:** seeded dictionary and cumulative-range attacks are blocked or explicitly accepted by approved policy.

### Step 33 — Add security hardening

1. Threat-model malicious source, dishonest approver, compromised prover, compromised verifier, council collusion, registry attack, RPC censorship, dependency replacement, public-input leakage, replay, and stale proof presentation.
2. Sign release manifests and container images.
3. Generate SBOMs for TypeScript, Noir, Barretenberg, Solidity, and containers.
4. Scan dependencies and reject unexpected lockfile changes.
5. Pin container bases by digest.
6. Use no outbound prover network, allowlisted verifier/ledger egress, non-root containers, read-only filesystems, seccomp/AppArmor/SELinux where available, and strict resource limits.
7. Use mTLS/workload identity between web, prover, verifier, artifact store, and adapter services.
8. Use managed secret storage for transaction/verifier/signing keys.
9. Add key rotation/revocation playbooks for source, approval, verifier, publisher, Safe/governance, payload, and deployment keys.
10. Add pause/invalidation playbooks for unsafe circuits, compromised verifier sets, false claims, and chain incidents.
11. Ensure support bundles and traces exclude witnesses, salts, approval signatures, payload keys, and raw evidence.
12. Commission independent circuit and contract audits before pilot reliance.

**Exit gate:** no unresolved critical/high security finding remains before pilot activation.

### Step 34 — Add observability and operations

Instrument:

1. proof queue wait, witness duration, proof duration, verification duration, proof size, gate count, memory/CPU/disk, cleanup result, and failure code;
2. verifier-node availability, artifact mismatch, vote latency, conflicting votes, quorum latency, key expiry, and equivocation;
3. Celo RPC health, chain ID, block age, submission/mining/finality latency, revert reason, nonce reconciliation, indexer lag, and contract pause/admin changes;
4. claim composition, approval binding, DLP rejection, publication, expiry, revocation, supersession, dispute, and privacy-budget rejection;
5. payload encryption/retrieval/rewrap/revocation without sensitive content.

1. Use correlation IDs and tenant-scoped job IDs.
2. Never place private fields in metric labels.
3. Alert on locally generated proof failing verification, artifact digest mismatch, unexpected gate-count/public-input change, duplicate nullifier attempts, unsafe admin events, cleanup failure, and use of revoked claims.
4. Define RPO/RTO separately for proving, verification quorum, publication, indexer, and public read APIs.
5. Back up metadata, manifests, policies, keys according to class, and public bundles; never back up ephemeral witnesses.
6. Test verifier reconstruction from source and manifests.

**Exit gate:** operators can diagnose every state without seeing witness data.

### Step 35 — Build the full test matrix

#### Circuit tests

- valid minimum and maximum values;
- every lower/upper boundary convention;
- stale/future/overflowed epochs;
- missing source bits and stale source timestamps;
- nonzero prohibited-data mask;
- wrong family/sector/band;
- wrong evidence/payload/report/model/policy/approval/DLP commitment;
- malformed Merkle path/index/padding;
- insufficient, duplicate, expired, or wrong-role approval binding;
- wrong chain/contract/claim ID;
- integer overflow/wraparound;
- maximum fixed-array capacity and padded ambiguity;
- fuzz every integer/enum/length;
- mutate each public field and proof byte.

#### Protocol/package tests

- canonicalization vectors across TypeScript/Noir/Solidity;
- schema strictness and unknown fields;
- signature domain/nonces/deadlines;
- adapter conformance;
- content-addressed bundle reproducibility;
- deterministic claim/nullifier derivation;
- source/policy/key revocation.

#### Prover/verifier tests

- valid proof generation and two independent verification paths;
- artifact/SRS/key mismatch;
- no-network proving;
- timeout/cancellation/crash cleanup;
- resource exhaustion classification;
- witness/log/crash-dump leakage scans;
- conflicting verifier votes and no quorum;
- duplicate verifier identity;
- verifier key rotation and revoked node.

#### Contract tests

- role/threshold initialization;
- delayed governance and emergency pause;
- EOA and ERC-1271 signatures;
- wrong chain/contract/action replay;
- duplicate/mixed/stale quorum signatures;
- claim/nullifier uniqueness;
- lifecycle and endorsement invariants;
- malformed calldata and bounded loops;
- bytecode/deployment manifest match.

#### End-to-end tests

1. signed synthetic finding to evidence snapshot to threat proof to quorum to Celo finality to feed;
2. signed synthetic risk result to risk-band proof to quorum to stakeholder verification;
3. peer-local signed assessment to endorsement proof and unique corroboration count;
4. evidence inclusion proof in a controlled audit request;
5. DLP failure blocks proving;
6. post-approval edit invalidates approval binding;
7. one verifier rejects, threshold still behaves correctly;
8. quorum unavailable yields `QUORUM_PENDING`, never `VERIFIED`;
9. Celo outage queues publication without affecting upstream systems;
10. uncertain transaction reconciles without duplicate claim;
11. expiry/revocation/supersession/dispute propagates to all reads;
12. unauthorized payload recipient cannot decrypt;
13. Company B receives context only and cannot infer Company A’s private evidence.

**Exit gate:** all deterministic, fuzz, invariant, privacy, adversarial, and end-to-end suites pass in CI.

### Step 36 — Implement reproducible CI and release gates

Use this ordered pipeline:

```text
format/lint/typecheck
→ adapter/schema tests
→ canonicalization/hash golden vectors
→ Noir unit/negative/fuzz tests
→ compile circuits
→ compare public-input/gate/opcode diff
→ generate and verify synthetic proofs by CLI
→ generate and verify synthetic proofs by NoirJS
→ prover/verifier isolation and leakage tests
→ Foundry unit/fuzz/invariant tests
→ local Anvil quorum/contract integration
→ web API/repository/job tests
→ full end-to-end synthetic flow
→ SBOM/vulnerability/license checks
→ container build and image signing
→ reproducibility/artifact digest comparison
→ Celo Sepolia smoke tests for release candidates
```

1. Pin all actions, images, package dependencies, Noir libraries, tools, and compiler versions.
2. Record source commit/tree digest, lockfile digests, circuit artifact digest, verification-key digest, proof flavor, SRS digest, container digest, contract source/bytecode digest, audit digest, and test-vector digest.
3. Fail on unreviewed public-input order or gate-count changes.
4. Fail if a proof generated by one path cannot be verified by the other.
5. Never expose deployment/signing secrets to untrusted pull-request jobs.
6. Require two-person review for circuit, canonicalization, contract, and release-manifest changes.
7. Activate new circuit/policy/verifier sets only after delayed council approval.

**Exit gate:** rebuilding from the same source and pinned environment reproduces all accepted public artifact digests.

### Step 37 — Prepare deterministic pilot fixtures and demo flow

1. Create a synthetic malicious model-deserialization finding; the current extensions do not produce this exact scenario.
2. Include private host, model path, repository, exact detector rule, exact confidence, and exact financial exposure only in fixture-private inputs.
3. Disclose only approved family, high severity, `80–95` confidence band, sector, coarse epoch, policy/circuit IDs, commitments, and expiry.
4. Create a signed synthetic risk result with exact EAL privately inside the fixed ₹10–25 crore public band.
5. Create a three-member development council representing company and stakeholder members with 2-of-3 thresholds.
6. Create positive, boundary, stale, DLP-failed, approval-failed, tampered, duplicate, revoked, and expired cases.
7. Run the sequence:
   - register signed adapter input;
   - freeze evidence snapshot;
   - compose claim/public-input preview;
   - bind council approval manifest;
   - generate and locally verify proof;
   - collect verifier-node quorum;
   - anchor attestation on Celo Sepolia;
   - show independent verification;
   - create peer endorsement/local-context handoff;
   - revoke and show correction propagation.
8. Display the exact division between circuit proof, verifier-quorum checks, and Celo attestation.
9. Keep proof artifacts downloadable for judge verification.

**Exit gate:** the demonstration can be replayed from clean fixtures and manifests without private values appearing in Celo calldata/events or public bundles.

### Step 38 — Stage rollout and pilot acceptance

1. Run local-only development with synthetic adapters.
2. Run integration against other-team sandbox adapters.
3. Run a Celo Sepolia council with non-production keys.
4. Execute failure drills: prover outage, verifier loss, quorum loss, RPC outage, wrong artifact, key compromise, false claim, revocation, indexer rebuild, and payload key rotation.
5. Conduct public-input privacy review and cumulative disclosure exercise.
6. Conduct circuit and smart-contract external review.
7. Resolve or formally accept findings through authorized governance.
8. Freeze pilot council charter, thresholds, policies, key owners, incident contacts, dispute process, and reliance language.
9. Require explicit sign-off before replacing synthetic adapters with production inputs.
10. Keep Celo Sepolia labels visible; do not present testnet anchoring as production assurance.

**Pilot definition of done:**

- all four claim capabilities have frozen semantics and passing proofs;
- the other team can integrate through adapter contracts without changing circuit/prover internals;
- private witness data remains company-local;
- proof bundles verify independently;
- M-of-N votes are distinct, replay-safe, and bound to exact artifacts;
- Celo Sepolia records minimized claim/lifecycle attestations only;
- current status correctly handles expiry, revocation, supersession, dispute, and invalidation;
- all circuit, protocol, prover, verifier, contract, API, job, privacy, and end-to-end tests pass;
- reproducible release and deployment manifests exist;
- UI/API language distinguishes mathematical proof, verifier-quorum checks, ledger attestation, and trusted input assumptions.

## Files to Modify or Create During Implementation

- `web/prisma/schema.prisma` — add ZK-owned orchestration, proof, quorum, ledger, payload, and audit models.
- `web/prisma/migrations/<timestamp>_zk_subsystem/migration.sql` — create constrained tenant-scoped ZK tables/enums/indexes.
- `web/lib/config.ts` and `web/.env.example` — add validated ZK service, artifact store, Celo, contract, finality, and resource-limit configuration without secrets.
- `web/lib/queue/boss.ts` — register ZK queues.
- `web/scripts/kvch-worker.ts` — register ZK job handlers.
- `web/lib/zk/**` — orchestration, repositories, state machine, adapter clients, public-input composition, privacy budget, and artifact handling.
- `web/lib/ledger/**` — Celo client, transaction manager, indexer, finality, event decoding, and reconciliation.
- `web/app/api/zk/**` — internal orchestration APIs.
- `web/app/api/verifier/**` — audience-safe verification APIs.
- `web/app/api/consortium/**` — finalized consortium feed, endorsement, and payload APIs.
- `web/app/zk/**` — minimal integration/reference claim and verification screens, not the other team’s complete product UI.
- `web/test/**` — ZK API, database, queue, tenant-isolation, lifecycle, and integration tests.
- `zk/**` — Noir workspace, shared libraries, four circuits, fixtures, test vectors, and manifests.
- `packages/zk-protocol/**` — canonical schemas, encoding, commitments, IDs, EIP-712 types, and bundle format.
- `packages/zk-adapters/**` — plug-and-play adapter interfaces, validators, clients, and conformance tests.
- `services/zk-prover/**` — isolated witness/proof service and container.
- `services/zk-verifier/**` — independent verification node and container.
- `contracts/**` — Foundry project, Celo registries, claim/endorsement/lifecycle contracts, tests, deployment scripts, and manifests.
- `.gitignore` — exclude private/generated proof workflow artifacts, local chain state, SRS caches, and secret files.
- Existing Next.js agent rules and current extension functionality must remain intact.

## Verification Commands to Establish During Implementation

Exact commands depend on the pinned toolchain, but the implementation must provide deterministic equivalents for:

```text
web: npm run lint
web: npm run build
web: npm run test:foundation
web: npm run test:judge
web: npm run test:zk
packages: npm test / npm run typecheck
Noir: nargo fmt --check
Noir: nargo check
Noir: nargo test
Noir: nargo fuzz
Noir: nargo compile
Barretenberg CLI: prove and verify each circuit fixture
NoirJS: execute, generateProof, verifyProof for each fixture
Foundry: forge fmt --check
Foundry: forge build
Foundry: forge test
Foundry: forge test with fuzz/invariant profiles
Integration: local Anvil quorum-to-claim lifecycle suite
Integration: Celo Sepolia smoke and source-verification checks
Security: SBOM, dependency, image, secret, and witness-leak scans
Reproducibility: rebuild and compare circuit/key/container/bytecode digests
```

## Risks and Required Controls

- **Fast-moving Noir/Barretenberg compatibility:** block implementation on the pinned compatibility spike; archive working docs and artifacts.
- **Same council performs multiple duties:** use duty-specific signatures, keys, typed actions, thresholds, nonces, delays, and explicit independence limitations.
- **Off-chain verification adds trust:** require multiple independently operated verifier nodes, reproducible bundles, public votes, and downloadable local verification.
- **Celo attestation may be mistaken for proof verification:** contract/UI language must say the chain validated quorum signatures, not the Barretenberg proof.
- **Upstream false input:** require signed provenance and state clearly that ZK proves consistency, not real-world truth.
- **Missing upstream systems:** use strict adapters and conformance fixtures; never silently substitute demo stubs in pilot mode.
- **Public-input leakage:** enforce inventory review, fixed bands, coarse epochs, privacy budget, and no low-entropy hashes.
- **Witness leakage:** isolate prover, disable egress/core dumps, bound logs, clean all exit paths, and scan crash/support artifacts.
- **Quorum collusion or duplicate seats:** count governed council identities, not transactions or raw keys; expose council set and threshold.
- **Celo/RPC outage:** queue and reconcile publication; never block private risk computation or required external reporting.
- **Immutable misinformation:** preserve revocation, supersession, dispute, expiry, and invalidation as first-class state.
- **Testnet confusion:** label Celo Sepolia everywhere and require a separate audited mainnet decision.
- **Regulatory overclaim:** treat proof as optional assurance and never as a replacement for CERT-In, SEBI, RBI, contractual, or legal reporting.
