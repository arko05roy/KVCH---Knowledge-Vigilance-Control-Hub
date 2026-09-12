# Step 1 — Subsystem Boundaries and Ownership

Status: **FROZEN v1** · 2026-09-12 · Document: `kvch.zk.boundaries/v1`

Change control: this document is a frozen contract. Any semantic edit requires a new
version identifier, a changelog entry, and re-execution of every downstream test that
depends on the changed boundary (adapter conformance, schema validation, claim
composition, prover, verifier, contracts, indexer).

---

## 1. Purpose

Define who owns what before any code is written, so that:

- every required input and output has exactly **one owning subsystem** and **one named
  trust assumption** (the Step-1 exit gate);
- upstream KVCH teams integrate only through signed, versioned adapter envelopes;
- the ZK subsystem never reinterprets upstream business calculations;
- every failure mode fails closed — no proof, no publication.

## 2. Responsibility matrix

| # | Capability / artifact | Owner | Produced / consumed via | Named trust assumption |
|---|---|---|---|---|
| 1 | Adapter envelope schemas + JSON Schemas (`kvch.*` versioned envelopes) | **ZK subsystem** (`packages/zk-adapters`) | Published package contract + fixtures | Schemas correctly encode the fields upstream signs; schema bugs are caught by conformance tests |
| 2 | Canonical encoding profile (deterministic bytes for signing/hashing) | **ZK subsystem** (`packages/zk-protocol`) | Versioned spec + golden vectors | Encoding is injective and stable across TS/Noir/Solidity |
| 3 | Commitment construction (evidence, snapshot, report, payload, approval-manifest, DLP, policy, risk-result) | **ZK subsystem** | `packages/zk-protocol`, mirrored in `zk/libraries/` | Commitment scheme is binding; hash parameterization frozen in Step 7 |
| 4 | Noir circuits (`ThreatEligibilityV1`, `StakeholderRiskBandV1`, `PeerEndorsementV1`, `EvidenceInclusionV1`) + shared libraries | **ZK subsystem** (`zk/`) | Nargo workspace | Circuit constraints match the frozen predicate matrix (Step 2) |
| 5 | Witness generation + proof generation | **ZK subsystem** (`services/zk-prover`, company-local) | Opaque registered IDs only | Prover host runs inside the proving company's trust boundary; witness never leaves it |
| 6 | Local proof verification (pre-publication) | **ZK subsystem** (prover service, separate VK path) | Pinned Barretenberg | Local verify uses independently loaded verification key |
| 7 | Independent verifier council nodes + `VerificationAttestation` signing | **ZK subsystem** (`services/zk-verifier`, council-operated) | Proof-bundle digest fetch | Each of N nodes is independently configured; council independence is **organizational**, not software-guaranteed |
| 8 | Quorum aggregation + ledger submission | **ZK subsystem** (publication gateway in `web/`) | M-of-N EIP-712 attestations | Threshold counted over governed council identities, never raw keys |
| 9 | Celo Sepolia contracts (`CouncilRegistry`, `ArtifactPolicyRegistry`, `ClaimAttestationRegistry`, `EndorsementRegistry`, `DisputeLifecycleRegistry`) | **ZK subsystem** (`contracts/`) | Foundry deployment manifests | Chain validates quorum signatures + lifecycle, **not** the Barretenberg proof |
| 10 | Celo indexer + reconciliation + read APIs | **ZK subsystem** (`web/lib/ledger`) | Finalized event replay | Finality policy holds; reorgs roll back only unfinalized mirrors |
| 11 | Independent verification bundles + verifier CLI | **ZK subsystem** | Content-addressed artifact store | Bundles are reproducible and need no private KVCH data |
| 12 | ZK-owned persistence (`ZkClaim`, `ZkProofJob`, `ZkVerificationVote`, …) | **ZK subsystem** (`web/prisma`) | Tenant-scoped repositories | Records are append/immutable-versioned; no FK into upstream tables |
| 13 | Risk calculations (EAL/VaR/CVaR, ROSI, scenario math) | **Upstream KVCH** (`risk-engine/`) | `RiskResultAdapter` signed envelope | Risk-engine math is trusted at the boundary; ZK proves band membership, never model correctness |
| 14 | Finding production (`kvch.finding/v1`) | **Upstream KVCH** (`kvch-extension`, scheduler) | `FindingSourceAdapter` signed envelope | Extension detections are signed facts of record; detection accuracy is not proven |
| 15 | Production identity, company/user auth, roles | **Upstream KVCH** | `IdentityRegistryAdapter` + server-verified auth | Identity registry issuer is authoritative for membership/keys |
| 16 | DLP scanning + prohibited-data mask | **Upstream KVCH** | `DlpDecisionAdapter` signed decision | DLP policy/scanner correctness is upstream; ZK consumes only the signed pass/fail + mask |
| 17 | Disclosure drafting (incl. AI-assisted text) | **Upstream KVCH** | `PayloadProviderAdapter` projection | AI/drafted content is advisory input only; only the deterministic DLP result gates proving |
| 18 | Approval UX + signing ceremonies | **Upstream KVCH** | `ApprovalProviderAdapter` EIP-712 manifests | Human/council signers acted under upstream process; signatures are verified off-chain |
| 19 | Stakeholder entitlement / room UX | **Upstream KVCH** | consumes ZK read APIs + claim-card projection | Upstream decides who may see an audience-scoped claim |
| 20 | Peer-local matching + `LocalAssessmentV1` + risk delta | **Upstream KVCH** | signed assessment envelope in, endorsement out | Local match logic is trusted at the boundary; ZK proves only threshold-crossing of the signed score |
| 21 | STIX 2.1 payload content production + TAXII transport | **Upstream KVCH** | `PayloadProviderAdapter`; TAXII behind adapter | Payload semantics/markings are upstream; ZK owns only encryption/commitment handling |
| 22 | Content-addressed artifact storage | **ZK subsystem interface**, upstream/cloud implementation | `ArtifactStoreAdapter` | Store returns bytes whose digest matches the requested content address |
| 23 | Key custody / signing | **ZK subsystem interface**, HSM/KMS implementation | `SigningProviderAdapter` | Keys sign only their designated purpose/domain; raw keys never enter application code |
| 24 | Council governance (membership, thresholds, charter) | **Joint**: upstream governance decides; ZK subsystem records/enforces | `CouncilRegistry` + `PolicyProviderAdapter` | Governance acts through delayed, on-chain-auditable set changes |

## 3. Integration rules

1. **Envelopes only.** Upstream systems integrate exclusively through signed, versioned
   adapter envelopes (`kvch.<name>/vN`). Direct reads from upstream private tables —
   Prisma models for findings, evaluations, runs, deployments, or any future upstream
   schema — are forbidden inside the ZK subsystem.
2. **Immutable intake.** The ZK subsystem may persist immutable copies and digests of
   accepted input envelopes (`ZkInputBundle`, `ZkEvidenceSnapshot`). It may validate,
   hash, commit, and prove over them. It may **not** recompute, re-derive, re-round, or
   otherwise reinterpret upstream business calculations (risk values, detection
   verdicts, DLP verdicts, match scores).
3. **Fail closed.** Any required input that is absent or invalid produces a terminal
   validation error. There is no path from an invalid input to a proof job, a quorum
   request, or a ledger submission.
4. **Versioned everything.** Every envelope carries `schema`, `schema_version`,
   `protocol_version`, `issuer`, `purpose`, `audience`, `environment`, `issued_at`,
   `expires_at`, nonce, and signature. Unknown fields are rejected, not ignored.
5. **One direction.** The ZK subsystem emits context (`VerifiedConsortiumClaimV1`,
   claim cards, status APIs). It never writes into upstream state; upstream reacts to
   ZK outputs through its own signed `LocalAssessmentV1` flow.

## 4. Input inventory — owner + trust assumption

| Input envelope | Adapter | Owning subsystem | Named trust assumption |
|---|---|---|---|
| Signed finding set (`kvch.finding/v1` + metadata) | `FindingSourceAdapter` | Upstream (finding production) | Issuer key authenticates origin; content describes what the extension reported — truth of detection is trusted, not proven |
| Signed risk result (exact EAL/VaR/CVaR, masks, lineage) | `RiskResultAdapter` | Upstream (risk engine) | Risk engine arithmetic is trusted at the boundary; circuit proves band membership of the signed values only |
| Signed DLP decision (pass/fail, prohibited mask, scanner-policy digest) | `DlpDecisionAdapter` | Upstream (DLP) | DLP scanner policy is correct and authorized; ZK enforces `mask == 0` and `decision == pass` in-circuit but does not rescan |
| Signed approval manifest (EIP-712 per-signer decisions) | `ApprovalProviderAdapter` | Upstream (approval UX) | Signers are who the identity registry says; signature validity is verified off-chain by orchestrator + every verifier node |
| Identity/council registry snapshot (roles, keys, validity, revocation) | `IdentityRegistryAdapter` | Upstream (identity) mirrored by `CouncilRegistry` | Registry issuer is authoritative; on-chain council set is the enforcement copy |
| Immutable policy artifact (thresholds, masks, intervals) | `PolicyProviderAdapter` | Joint governance; ZK-owned commitment | Policy was council-approved and registered on-chain before use |
| Minimized payload projection (STIX/report fields + markings) | `PayloadProviderAdapter` | Upstream (disclosure drafting) | Projection is the DLP-approved public surface; classification/marking semantics are upstream |
| Artifact bytes (circuit, VK, bundles, SRS refs) | `ArtifactStoreAdapter` | ZK subsystem | Content addressing makes tampering detectable; availability is operational, not trusted for integrity |
| Signatures by purpose-scoped keys | `SigningProviderAdapter` | ZK subsystem | Provider enforces key purpose/domain separation; custody is its problem |
| Chain reads/submits/finality | `LedgerClientAdapter` | ZK subsystem | Celo Sepolia `11142220` finality + honest RPC quorum; adapters never override contract-side checks |

Every input above has exactly one owning subsystem and one trust assumption. Inputs not
listed are not accepted.

## 5. Output inventory — owner + trust assumption

| Output | Owning subsystem | Consumers | Named trust assumption |
|---|---|---|---|
| Proof bundle (public inputs, proof, artifact/policy/VK digests) | ZK subsystem (prover) | Verifier council, judges, auditors | Bundle is content-addressed and reproducible |
| `VerificationAttestation` (EIP-712, per verifier node) | ZK subsystem (council nodes) | Quorum aggregator, contract | Node attestation key signs only `VerificationAttestation` for its council seat |
| Claim attestation header on Celo Sepolia | ZK subsystem (contracts via gateway) | Anyone reading chain | Chain state proves a quorum of the active council signed an exact bundle/public-input digest — nothing more |
| Endorsement records + corroboration counts | ZK subsystem (contract) | Consortium feed | One endorsement per (company, target claim version, scope); self-endorsement excluded by policy |
| Lifecycle events (revoke/supersede/dispute/invalidate/expire) | ZK subsystem (contracts + indexer) | All read APIs | Finalized events are the only source of current on-chain status |
| Independent verification bundle + CLI result | ZK subsystem | External verifiers | Verification needs zero private KVCH data |
| `VerifiedConsortiumClaimV1` outbound envelope | ZK subsystem | Upstream peer-risk flow | Signed context only; never sets receiver compromise status |
| Claim-card server projection + verifier APIs | ZK subsystem | Upstream stakeholder room | Renders only minimized public inputs; proven vs. checked vs. attested wording per enforcement matrix |

Every output above has exactly one owning subsystem and one trust assumption.

## 6. Failure behavior — always terminal, always closed

| Failure condition | Error class | Result |
|---|---|---|
| Missing/unknown `schema` or `schema_version` | `ZK_INPUT_SCHEMA_UNKNOWN` | Reject intake; no bundle registered |
| Signature invalid, wrong domain, wrong purpose, wrong audience | `ZK_SIGNATURE_INVALID` | Reject intake; audit event |
| Issuer not in identity registry / key revoked or expired | `ZK_ISSUER_UNKNOWN` | Reject intake |
| Envelope expired, not-yet-valid, or stale vs. policy TTL | `ZK_INPUT_STALE` | Reject intake |
| Content digest mismatch vs. signed digest or content address | `ZK_DIGEST_MISMATCH` | Reject intake/fetch; no parse |
| Referenced policy/circuit/council set inactive, paused, or unknown | `ZK_POLICY_INACTIVE` | Terminal; no proof job |
| Required adapter unavailable or non-conformant | `ZK_ADAPTER_UNAVAILABLE` | Terminal for that claim; upstream systems unaffected |
| Duplicate record IDs in a snapshot set | `ZK_SNAPSHOT_DUPLICATE` | Snapshot rejected |
| Any circuit predicate unsatisfied | `ZK_CONSTRAINT_UNSATISFIED` | `PROOF_FAILED`; never retried as transient |
| Quorum unavailable | `ZK_QUORUM_PENDING` | Claim stays `QUORUM_PENDING`; never degraded to single-sig |
| Ledger RPC/submission failure | `ZK_SUBMISSION_FAILED` | Queued + reconciled; upstream unaffected |

Common rule: terminal validation errors produce **no** proof job, **no** quorum request,
and **no** ledger write. Transient infrastructure failures retry with bounded backoff;
deterministic predicate failures never retry.

## 7. Non-claims — exact user-facing wording

The following text (or a verbatim translation) must appear wherever a claim is
displayed, at equal prominence to the proven claims:

> **What this proof does not show.** This attestation verifies that signed inputs
> satisfied a deterministic policy predicate when the proof was made, and that a
> council quorum verified that proof. It does **not** prove that the underlying event
> occurred, that the risk model or detection was accurate, that the company is secure,
> that legal or regulatory obligations (CERT-In, SEBI, RBI, contractual) were met, or
> that no undisclosed incidents exist. The chain record proves a council quorum signed
> an exact artifact digest — it did not execute the zero-knowledge proof.

Additional fixed non-claims:

- V1 proving company and council members are **identified** — no anonymous origin, no
  anonymous endorsement is claimed.
- Celo Sepolia is a **testnet attestation ledger**; anchoring is not production
  assurance.
- Adapter signatures prove **provenance** only to the extent issuer keys are trusted.
- The proof is **optional assurance**, never a substitute for mandatory reporting.

## 8. Exit-gate self-check

- [x] Every required input has one owning subsystem + one named trust assumption (§4).
- [x] Every output has one owning subsystem + one named trust assumption (§5).
- [x] Responsibility matrix assigns all ZK-owned and upstream-owned capabilities (§2).
- [x] Envelope-only integration, immutable intake, fail-closed behavior defined (§3, §6).
- [x] Non-claims recorded verbatim (§7).
