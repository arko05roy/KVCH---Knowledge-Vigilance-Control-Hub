# Step 2 — Frozen Predicate Semantics

Status: **FROZEN v1** · 2026-09-12 · Document: `kvch.zk.predicate-semantics/v1`
Machine-readable copy: `zk/manifests/predicate-semantics.v1.json`

Change control: every constant, ordering, preimage, and matrix row in this document is
frozen. Changes require a new document version and re-execution of all dependent
golden-vector, circuit, contract, and end-to-end tests. Items explicitly marked
**DEFERRED** are owned by a later step and are not frozen here.

---

## 1. Circuit statements (one sentence each)

- **`ThreatEligibilityV1`** — "The identified issuer's signed evidence snapshot
  satisfies the active consortium disclosure policy — required source-family coverage
  and freshness, severity and confidence thresholds, deterministic threat-family and
  sector mapping, zero prohibited DLP flags, bound approval and DLP manifests —
  entitling one unique disclosure of the stated bands and epochs, without revealing
  the evidence contents, exact confidence, exact severity, or exact times."
- **`StakeholderRiskBandV1`** — "The identified issuer's signed risk result places
  exact integer-minor-unit risk metrics inside the disclosed half-open bands for the
  stated reporting period, currency, audience, and purpose under the active policy,
  without revealing the exact EAL/VaR/CVaR values or underlying evidence."
- **`PeerEndorsementV1`** — "An identified non-origin company holds a signed local
  assessment whose exact private match score crosses the endorsement policy threshold
  and maps to the disclosed match class against the stated target claim version,
  producing one unique endorsement nullifier, without revealing the exact score or
  local evidence."
- **`EvidenceInclusionV1`** — "A privately held record commitment is a leaf of the
  publicly committed evidence snapshot for the stated company, purpose, snapshot
  version, and audit request, without revealing the record body, salt, leaf index, or
  sibling path."

## 2. Frozen scalar semantics

| Semantic | Frozen rule |
|---|---|
| Monetary ranges | **Half-open `[lower, upper)`**, always. A disclosed band `[L, U)` is satisfied iff `lower ≤ exact < upper`. `upper` itself belongs to the next band. |
| Monetary values | **Integer minor currency units only** (e.g. paise for INR). In-circuit type `u64`. Floats, decimal strings, and major-unit values are forbidden everywhere. Canonical wire width: unsigned 64-bit big-endian. |
| Confidence | **Unsigned basis points `0..=10000`**, in-circuit `u16`. Confidence bands are `[lower_bps, upper_bps)` over the same scale; demo band 80–95% = `[8000, 9500)`. |
| Severity | **Versioned integer enum**, code `u16`, defined only by the codebook version in force. Codebook v1: `0=RESERVED/invalid, 1=LOW, 2=MEDIUM, 3=HIGH, 4=CRITICAL`. A code under codebook vN is never reinterpreted under vM. |
| Time | **Integer epoch**: `epoch = floor(unix_seconds / EPOCH_DURATION_SECONDS)` with `EPOCH_DURATION_SECONDS = 3600` (1-hour quantum) and origin `1970-01-01T00:00:00Z` (UTC, Unix epoch). In-circuit `u32`; canonical wire width u64. All epochs everywhere use this quantum — private exact times also carry an epoch projection for constraint checks. |
| Enums / codebooks | All categorical fields (claim type, threat family, sector, severity band, confidence band, currency, reporting period, source family, approval role, authenticity level, state, dispute reason, revocation reason, match class, relation code) are `u16` codes resolved against the active **codebook version**; `0` is always reserved/invalid. |
| Masks | Required-source mask, prohibited-data mask, completeness/freshness masks: `u64` bitmasks, bit `i` = codebook entry `i+1`. |
| Optionality | **Explicit zero sentinel**: an optional public input is always present and constrained to `0` (or the all-zero commitment) when disabled by policy. No variable-length public input vectors. |
| Hash | **DEFERRED to Step 7**: Poseidon/Poseidon2 variant, arity, and parameterization are selected by the compatibility spike and pinned. This document uses `H(tag, …)` for "the pinned circuit hash over the domain tag + ordered fields". SHA-256 is the standard-artifact digest and never enters a circuit; signed bridge records bind `sha256_digest ↔ H`-commitment at the adapter layer. |
| Strings | Public inputs never contain strings. Identities/IDs appear as `u16`/`u64` codes or commitments. String→field mapping is **DEFERRED to Step 6** (canonical encoding). |

## 3. Frozen bounded capacities

| Constant | Value | Notes |
|---|---|---|
| `MERKLE_DEPTH` | `10` | Fixed-depth binary tree over `H` |
| `MAX_EVIDENCE_LEAVES` | `1024` | `= 2^MERKLE_DEPTH`; leaf count is committed to prevent padding ambiguity |
| `MAX_SOURCE_FAMILIES` | `64` | u64 `required_source_mask` |
| `MAX_PROHIBITED_FLAGS` | `64` | u64 `prohibited_data_mask`; circuit enforces `== 0` |
| `MAX_APPROVALS` | `16` | Approval-manifest signer tuples per claim |
| `MAX_COUNCIL_MEMBERS` | `16` | Council set `N`; thresholds `M ≤ N ≤ 16` |
| `MAX_PAYLOAD_FIELDS` | `64` | Padded fixed vector; actual count committed |
| `MAX_PAYLOAD_FIELD_BYTES` | `256` | Per canonical payload field |
| `MAX_REPORT_FIELDS` | `32` | Report projection vector; actual count committed |
| `MAX_RISK_METRICS` | `4` | EAL always; VaR/CVaR/appetite flags |
| `NONCE_BYTES` | `16` | ≥128-bit CSPRNG for every hiding nonce/salt |
| `CLAIM_VERSION_MAX` | `u32` | Claim-series version counter |

## 4. Flattening and ordering rules

1. **Order is the spec.** Public inputs are a fixed, declared sequence per circuit
   (§7). Flattening emits them in exactly that order. Reordering = different claim.
2. **One logical item → fixed field count.** `u16`/`u32`/`u64`/masks/epochs/codes →
   1 Field each. Every `H` commitment, `claim_id`, `nullifier`, address-derived field
   → 1 Field. Padded arrays → fixed `MAX_*` field slots. No item is variable-width.
3. **Derived identifiers last.** Each circuit's public sequence ends with its derived
   values (`*_nullifier`, then `claim_id`/`endorsement key`), so the "input" prefix is
   a stable prefix.
4. **Private inputs** flatten in their declared per-circuit order (§8) and never
   appear in public-input vectors, digests, logs, or bundles.
5. Byte-level integer endianness, UTF-8 normalization, and absent-vs-null encoding:
   **DEFERRED to Step 6**; this step fixes only logical order, types, and ranges.

## 5. Frozen commitment / ID preimages

All preimages are `H(domain_tag, f1, f2, …)` over the listed fields **in order**.
Domain tags are fixed ASCII constants (listed in the manifest JSON); every distinct
object type has a distinct tag.

| Object | Domain tag | Ordered preimage fields |
|---|---|---|
| `evidence_leaf` | `KVCH_LEAF_V1` | `company_code, source_family_code, artifact_commitment, record_id_commitment, observed_epoch, ingested_epoch, payload_commitment, classification_code, authenticity_code, leaf_salt` |
| `evidence_commitment` (snapshot) | `KVCH_SNAPSHOT_V1` | `merkle_root, leaf_count, selection_policy_code, normalization_version_code` |
| `report_commitment` | `KVCH_REPORT_V1` | `report_schema_code, period_code, currency_code, field_count, field_vector[MAX_REPORT_FIELDS], report_nonce` |
| `payload_commitment` | `KVCH_PAYLOAD_V1` | `payload_schema_code, field_count, field_vector[MAX_PAYLOAD_FIELDS], payload_nonce` |
| `risk_result_commitment` | `KVCH_RISK_V1` | `company_code, result_id_commitment, period_code, currency_code, metric_count, eal_minor, var_minor, cvar_minor, var_percentile_bps, completeness_mask, freshness_mask, evidence_commitment, model_bundle_commitment, result_nonce` |
| `approval_manifest_commitment` | `KVCH_APPROVAL_V1` | `council_set_id, council_set_version, action_code, claim_draft_commitment, signer_count, signer_tuple_vector[MAX_APPROVALS]` — each tuple = `signer_id_commitment, role_code, decision_code, signer_nonce, deadline_epoch` |
| `dlp_decision_commitment` | `KVCH_DLP_V1` | `claim_draft_commitment, projection_commitment, prohibited_data_mask, scanner_policy_commitment, decision_code, evaluated_epoch, expiry_epoch` |
| `policy_commitment` | `KVCH_POLICY_V1` | `claim_type_code, policy_version, effective_from_epoch, effective_until_epoch, threshold_vector, required_source_mask, max_ttl_epochs, codebook_version` |
| `claim_id` (threat + risk claims) | `KVCH_CLAIM_ID_V1` | All public inputs of that circuit **in declared order**, excluding `claim_id` itself and the circuit's `*_nullifier`/`disclosure_scope_id` derived values |
| `disclosure_nullifier` | `KVCH_DISC_NULL_V1` | `claim_nonce, claim_id` |
| `disclosure_scope_id` | `KVCH_SCOPE_V1` | `issuer_company_code, audience_id, purpose_code, metric_code, period_code` — deterministic, dedupes "one active disclosure per scope" |
| `endorsement_nullifier` | `KVCH_ENDORSE_NULL_V1` | `endorser_company_code, target_claim_id, target_claim_version, scope_code` — deterministic (no nonce): duplicates collide by construction |
| `audit_nullifier` | `KVCH_AUDIT_NULL_V1` | `company_code, evidence_commitment, purpose_code, audit_request_id` — deterministic: one proof per (snapshot, purpose, audit request) |
| `record_commitment` | `KVCH_RECORD_V1` | `record_id_commitment, payload_commitment` — the selectively disclosable linkage without leaf internals |
| `local_assessment_commitment` | `KVCH_ASSESS_V1` | `endorser_company_code, target_claim_id, match_score_bps, match_class_code, local_evidence_commitment, assessed_epoch, assessment_nonce` |

## 6. Enforcement-layer vocabulary

| Layer key | Meaning | May be called "proven"? |
|---|---|---|
| `CIRCUIT` | Constrained inside the Noir circuit; guaranteed by proof validity | Yes — "proven in circuit" |
| `VERIFIER` | Checked off-chain by every verifier council node before signing | No — "verified by council nodes" |
| `CONTRACT` | Enforced by the Celo Sepolia contract at submission | No — "enforced on-chain at attestation" |
| `ADAPTER` | Guaranteed only by a signed upstream envelope / governance | No — "trusted signed input" |
| `ORCH` | Checked by the company-local orchestrator/prover before proving | No — "checked before proving" |

No UI or API may describe a property as "proven" unless its only layer is `CIRCUIT`
(or `CIRCUIT` plus others). Wording for composite assurance (verbatim):

> "The zero-knowledge proof establishes that the private predicate held and binds to
> the approval-manifest commitment. The verifier council separately verified that the
> committed manifest contained valid M-of-N signatures, and Celo Sepolia recorded that
> quorum attestation."

## 7. Public input ordering (flattening order)

### `ThreatEligibilityV1` — 24 fields

| # | Field | Type |
|---|---|---|
| 1 | `protocol_version` | u16 |
| 2 | `circuit_id` | u16 |
| 3 | `community_id` | u64 |
| 4 | `chain_id` | u64 |
| 5 | `claim_registry_address` | Field |
| 6 | `claim_series_id` | Field |
| 7 | `claim_version` | u32 |
| 8 | `issuer_company_code` | u64 |
| 9 | `claim_family_code` | u16 |
| 10 | `sector_code` | u16 |
| 11 | `severity_band_code` | u16 |
| 12 | `confidence_band_code` | u16 |
| 13 | `observed_epoch` | u32 |
| 14 | `valid_from_epoch` | u32 |
| 15 | `expiry_epoch` | u32 |
| 16 | `policy_commitment` | Field |
| 17 | `evidence_commitment` | Field |
| 18 | `payload_commitment` | Field |
| 19 | `source_artifact_commitment` | Field (zero sentinel if policy waives) |
| 20 | `approval_manifest_commitment` | Field |
| 21 | `dlp_decision_commitment` | Field |
| 22 | `disclosure_nullifier` | Field (derived) |
| 23 | `claim_id` | Field (derived) |
| 24 | `public_input_digest` | Field (derived: `H(KVCH_PI_V1, fields 1–23)`) |

### `StakeholderRiskBandV1` — 26 fields

| # | Field | Type |
|---|---|---|
| 1 | `protocol_version` | u16 |
| 2 | `circuit_id` | u16 |
| 3 | `chain_id` | u64 |
| 4 | `claim_registry_address` | Field |
| 5 | `claim_series_id` | Field |
| 6 | `claim_version` | u32 |
| 7 | `issuer_company_code` | u64 |
| 8 | `audience_id` | u64 |
| 9 | `purpose_code` | u16 |
| 10 | `period_code` | u32 |
| 11 | `currency_code` | u16 |
| 12 | `metric_flags` | u64 (bit0=EAL [always], bit1=VaR, bit2=CVaR, bit3=appetite relation) |
| 13 | `eal_band_lower` | u64 minor units |
| 14 | `eal_band_upper` | u64 minor units |
| 15 | `var_band_lower` | u64 minor units (0 if disabled) |
| 16 | `var_band_upper` | u64 minor units (0 if disabled) |
| 17 | `var_percentile_bps` | u16 (0 if disabled) |
| 18 | `appetite_relation_code` | u16 (0 = not disclosed) |
| 19 | `issued_epoch` | u32 |
| 20 | `valid_until_epoch` | u32 |
| 21 | `policy_commitment` | Field |
| 22 | `lineage_commitment` | Field = `H(KVCH_LINEAGE_V1, risk_result_commitment, evidence_commitment, model_bundle_commitment, report_commitment, approval_manifest_commitment, dlp_decision_commitment)` |
| 23 | `disclosure_scope_id` | Field (derived) |
| 24 | `disclosure_nullifier` | Field (derived) |
| 25 | `claim_id` | Field (derived) |
| 26 | `public_input_digest` | Field (derived: `H(KVCH_PI_V1, fields 1–25)`) |

> Ordering rule §4.3 keeps all derived values terminal. The manifest JSON carries the
> authoritative flat list.

### `PeerEndorsementV1` — 14 fields

| # | Field | Type |
|---|---|---|
| 1 | `protocol_version` | u16 |
| 2 | `circuit_id` | u16 |
| 3 | `chain_id` | u64 |
| 4 | `endorsement_registry_address` | Field |
| 5 | `endorser_company_code` | u64 (identified in V1) |
| 6 | `target_claim_id` | Field |
| 7 | `target_claim_version` | u32 |
| 8 | `target_issuer_company_code` | u64 |
| 9 | `endorsement_policy_commitment` | Field |
| 10 | `local_evidence_commitment` | Field |
| 11 | `match_class_code` | u16 |
| 12 | `endorsed_epoch` | u32 |
| 13 | `expiry_epoch` | u32 |
| 14 | `endorsement_nullifier` | Field (derived, deterministic) |

### `EvidenceInclusionV1` — 9 fields

| # | Field | Type |
|---|---|---|
| 1 | `protocol_version` | u16 |
| 2 | `circuit_id` | u16 |
| 3 | `company_code` | u64 |
| 4 | `evidence_commitment` | Field (snapshot) |
| 5 | `record_commitment` | Field (selectively disclosed) |
| 6 | `purpose_code` | u16 |
| 7 | `snapshot_version` | u32 |
| 8 | `audit_request_id` | Field |
| 9 | `audit_nullifier` | Field (derived, deterministic) |

## 8. Private input ordering (witness order)

### `ThreatEligibilityV1`

`exact_confidence_bps, exact_severity_code, exact_observed_seconds, exact_source_seconds[MAX_SOURCE_FAMILIES… bounded to used bits → fixed 64-slot padded vector], leaf_count, evidence_leaf_vector…` — concretely:

| # | Field | Type |
|---|---|---|
| 1 | `exact_confidence_bps` | u16 |
| 2 | `exact_severity_code` | u16 |
| 3 | `exact_observed_seconds` | u64 |
| 4 | `required_source_mask` | u64 |
| 5 | `source_timestamp_vector` | u32[64] padded; slot used iff mask bit set |
| 6 | `leaf_count` | u32 |
| 7 | `evidence_leaf_preimage_vector` | leaf field-tuples, padded to capacity referenced by snapshot policy |
| 8 | `family_derivation_vector` | u16[8] normalized mapping inputs |
| 9 | `prohibited_data_mask` | u64 (constrained `== 0`) |
| 10 | `policy_witness` | policy preimage fields (§5 row) |
| 11 | `approval_manifest_witness` | manifest preimage fields |
| 12 | `dlp_decision_witness` | DLP preimage fields |
| 13 | `payload_field_vector` | `u8`…→Field packed, `MAX_PAYLOAD_FIELDS`, + `payload_nonce` |
| 14 | `claim_nonce` | Field (128-bit entropy) |

### `StakeholderRiskBandV1`

`eal_minor_exact, var_minor_exact, cvar_minor_exact, var_percentile_exact_bps, appetite_threshold_minor_exact, risk_result_witness (full preimage incl. masks + result_nonce), evidence_opening_refs, model_bundle_witness, report_field_vector + report_nonce, policy_witness, approval_manifest_witness, dlp_decision_witness, claim_nonce`

### `PeerEndorsementV1`

`match_score_bps_exact, local_assessment_witness (preimage incl. assessment_nonce), local_evidence_leaf + merkle_path[MERKLE_DEPTH] + path_index_bits, policy_witness`

### `EvidenceInclusionV1`

`leaf_preimage (all evidence_leaf fields incl. leaf_salt), leaf_index_bits[MERKLE_DEPTH], merkle_siblings[MERKLE_DEPTH], leaf_count`

## 9. Predicate-to-enforcement matrix

Legend: **●** enforcing layer · **○** re-checked/observed · **—** not involved.
A predicate may be enforced by more than one layer; the leftmost ● is primary.

### Cross-cutting (all circuits)

| Predicate | CIRCUIT | VERIFIER | CONTRACT | ADAPTER/ORCH |
|---|---|---|---|---|
| Enum codes ∈ active codebook | ● | ○ | — | ○ |
| Range/length bounds, no field wraparound | ● | — | — | ○ |
| Recompute all public commitments from witness | ● | ○ | — | — |
| Policy effective interval vs. observation/issue epoch | ● | ○ | ○ (policy active on-chain) | ○ |
| `claim_id`/IDs recomputed from public inputs | ● | ○ | — | — |
| `claim_id`, nullifier uniqueness | — | ○ | ● | ○ |
| Approval-manifest commitment bound to claim draft digest | ● (binding) | ○ | — | ○ |
| Human approval EIP-712 signatures valid, M-of-N, right roles | — | ● | — | ● (pre-proof) |
| DLP signature valid; `decision == pass`; `prohibited_mask == 0` | ● (mask/decision commitment) | ● (signature) | — | ● |
| Source/risk adapter signatures valid | — | ● | — | ● |
| Verifier attestation EIP-712, M-of-N, active council set, deadlines, sorted-unique signers | — | — | ● | ● (aggregator) |
| **Barretenberg proof validity** | — | **●** | **— (never on-chain in V1)** | ● (local pre-verify) |
| Chain ID / contract address bound | ● (public input) | ○ | ● (EIP-712 domain) | ○ |
| Issuer identity real / registered | — | ○ | ○ (issuer code known) | ● (identity adapter) |
| Upstream business truth (detection correct, model accurate) | — | — | — | trusted input, **never claimed** |
| Freshness/TTL of adapter envelopes | ○ (epochs) | ● | — | ● |
| Council set/version snapshot bound to decision | ○ (set ID in manifest) | ● | ● | ○ |
| Payload/recipient authorization for encrypted STIX | — | — | — | ● (access manifest + key adapter) |
| Privacy budget / cumulative-disclosure limit | — | ○ (policy flag) | — | ● (pre-compose check) |
| Revocation/supersession/dispute/expiry status | — | ○ | ● | ○ (indexer mirrors) |

### `ThreatEligibilityV1`

| Predicate | CIRCUIT | VERIFIER | CONTRACT | ADAPTER/ORCH |
|---|---|---|---|---|
| `exact_confidence_bps ∈ confidence_band [lower,upper)` and ≥ policy threshold | ● | ○ (band vs. policy) | — | — |
| `exact_severity_code ∈ severity_band`, ≥ policy threshold | ● | ○ | — | — |
| Required source-mask coverage of `required_source_mask` | ● | ○ | — | — |
| Each used source timestamp fresh vs. `observed_epoch` | ● | — | — | — |
| `prohibited_data_mask == 0` | ● | ○ | — | — |
| Deterministic family mapping → `claim_family_code` | ● | ○ | — | — |
| Sector/community compatibility | ● | ○ | — | — |
| `valid_from ≥ observed`; `expiry − observed ≤ policy max_ttl` | ● | ○ | — | — |
| Evidence snapshot membership (root = `evidence_commitment`) | ● | ○ | — | — |
| No raw-log parsing, detector execution, LLM calls, or legal-reportability inference | n/a — never in-circuit by construction | — | — | — |

### `StakeholderRiskBandV1`

| Predicate | CIRCUIT | VERIFIER | CONTRACT | ADAPTER/ORCH |
|---|---|---|---|---|
| `eal_exact ∈ [eal_band_lower, eal_band_upper)`, u64 no-overflow | ● | ○ | — | — |
| Optional VaR/CVaR band + percentile per `metric_flags` | ● | ○ | — | — |
| Risk-result/report/policy/lineage commitments recomputed | ● | ○ | — | — |
| Evidence + model commitments match signed risk result lineage | ● | ○ | — | — |
| Period/currency bound to disclosure | ● | ○ | — | — |
| Completeness/freshness masks satisfy policy | ● | ○ | — | — |
| Issue/expiry within policy interval | ● | ○ | — | — |
| One active disclosure per `disclosure_scope_id` | — | ○ | ● (state check) | ● (budget check) |
| Exact appetite threshold hidden when only relation disclosed | ● (relation code only public) | — | — | — |

### `PeerEndorsementV1`

| Predicate | CIRCUIT | VERIFIER | CONTRACT | ADAPTER/ORCH |
|---|---|---|---|---|
| `match_score_bps ≥ policy threshold`, maps to `match_class_code` | ● | ○ | — | — |
| Local evidence fresh + member of `local_evidence_commitment` | ● | ○ | — | — |
| Nullifier = deterministic (endorser, target claim+version, scope) | ● | ○ | ● (uniqueness) | — |
| Self-endorsement excluded when policy forbids | ● (`endorser ≠ target_issuer` flag) | ○ | ● (reject) | — |
| Endorser identified | public input | ○ | ○ | — |
| Local risk-delta / match computation | **never** — upstream signed `LocalAssessmentV1` | ○ (envelope sig) | — | ● |
| Anonymous endorsement / private membership | **not in V1** — V2 extension point only | — | — | — |

### `EvidenceInclusionV1`

| Predicate | CIRCUIT | VERIFIER | CONTRACT | ADAPTER/ORCH |
|---|---|---|---|---|
| `leaf = H(KVCH_LEAF_V1, witness)` recomputed | ● | — | — | — |
| Merkle path (index bits + siblings) reaches `evidence_commitment` root | ● | ○ | — | — |
| `record_commitment` recomputed from leaf fields | ● | ○ | — | — |
| Bound to company, purpose, snapshot version, audit request | ● | ○ | — | ● (audit flow) |
| Expiry + one-purpose scoping | ● | ○ | — | ● |
| Not published to consortium feed by default | — | — | — | ● (API policy) |

## 10. Public-input inventory + leakage review (initial)

| Public input | Entropy / leakage class | Control |
|---|---|---|
| `issuer_company_code`, `endorser_company_code`, `company_code` | Identity — disclosed by design (V1 identified mode) | Non-claim text; V2 anonymity only via new circuit |
| `claim_family_code`, `sector_code`, `severity_band_code`, `confidence_band_code`, `match_class_code` | Low-entropy codebook values — dictionary-trivial | Bands only; exact values never public |
| Epochs (`observed`, `valid_from`, `expiry`, `issued`, `endorsed`) | Timing correlation | 3600s quantum coarsens; cap claim frequency per policy |
| `eal/var_band_*` bounds | Cumulative narrowing across disclosures | Privacy-budget ledger (Step 32); council-approved fixed bands only |
| All `*_commitment` values | Hiding commitments — safe iff ≥128-bit nonces | `NONCE_BYTES=16`; no raw SHA-256 of guessable data |
| `claim_id`, `*_nullifier`, `*_scope_id` | Deterministic/derived IDs — linkable by design where deterministic | Documented as linkable; uniqueness is the feature |
| `claim_registry_address`, `endorsement_registry_address`, `chain_id` | Constants — no leakage | — |
| `payload_commitment` | Commits to possibly-guessable payload | Never expose plain hash; commitment includes nonce |

CI check (Step 32.9): any new public input requires an appended row here + explicit
privacy approval.

## 11. Deferred (explicitly NOT frozen here)

- Hash primitive choice, arity, parameters → Step 3 spike + Step 7 freeze.
- Byte-level canonical encoding (endianness already fixed big-endian; UTF-8 rules,
  absent-vs-null, duplicate-key handling) → Step 6.
- Full codebook contents (threat families, sectors, currencies…) → Step 10.
- Exact EIP-712 type strings → Step 9.
- On-chain calldata layouts and gas bounds → Step 21.

## 12. Exit-gate self-check

- [x] One-sentence statement per circuit (§1).
- [x] `[lower, upper)` monetary ranges; integer minor units; bps confidence; versioned
  severity enum; 3600s UTC epochs (§2).
- [x] Bounded capacities for leaves, source families, approvals, Merkle depth,
  payload fields (§3).
- [x] Public/private ordering + flattening rules (§4, §7, §8).
- [x] Exact preimage fields for claim IDs, nullifiers, report/evidence/approval
  commitments (§5).
- [x] Every predicate assigned to enforcing layer(s); nothing off-chain-only may be
  called "proven" (§6, §9).
- [x] Public-input inventory published with leakage classes (§10).
- Sign-off placeholders: **product owner ☐ · cryptography owner ☐ · integration
  owner ☐** — recorded via acceptance of this document version.
