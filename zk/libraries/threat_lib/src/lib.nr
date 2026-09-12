// ThreatEligibilityV1 — see zk/manifests/predicate-semantics.v1.json.
// Proves: signed evidence snapshot satisfies the active consortium disclosure
// policy (source coverage+freshness, severity/confidence thresholds, family
// mapping, zero DLP flags, bound approval+DLP manifests) for one unique
// disclosure, without revealing evidence contents or exact values.
use kvch_approval::assert_manifest_valid;
use kvch_commitments::{
    ApprovalManifestWitness, DlpDecisionWitness, PolicyWitness, approval_manifest_commitment,
    claim_draft_commitment, claim_id as compute_claim_id, disclosure_nullifier,
    dlp_decision_commitment, evidence_commitment as compute_evidence_commitment,
    evidence_leaf_hash, payload_commitment as compute_payload_commitment, policy_commitment,
    public_input_digest as compute_pi_digest,
};
use kvch_encoding::{
    APPROVAL_ACTION_DISCLOSURE, CIRCUIT_THREAT_ELIGIBILITY_V1, CLAIM_TYPE_THREAT_ELIGIBILITY,
    DLP_DECISION_PASS, MAX_EVIDENCE_LEAVES, MAX_PAYLOAD_FIELDS, MAX_SOURCE_FAMILIES,
    PROTOCOL_VERSION_V1, assert_enum, assert_epoch_of_seconds, assert_fresh_epoch,
    assert_mask_covers, assert_zero_mask, confidence_band_of, severity_band_of,
};
use kvch_merkle::{EvidenceOpening, compute_root};
use kvch_policy::{assert_active, assert_claim_type, derive_threat_family_code};

// Public inputs in declared manifest order; derived identifiers are terminal.
pub struct ThreatPublic {
    pub protocol_version: u16,
    pub circuit_id: u16,
    pub community_id: u32,
    pub chain_id: u64,
    pub claim_registry_address: Field,
    pub claim_series_id: Field,
    pub claim_version: u32,
    pub issuer_company_code: u32,
    pub claim_family_code: u16,
    pub sector_code: u16,
    pub severity_band_code: u16,
    pub confidence_band_code: u16,
    pub observed_epoch: u32,
    pub valid_from_epoch: u32,
    pub expiry_epoch: u32,
    pub policy_commitment: Field,
    pub evidence_commitment: Field,
    pub payload_commitment: Field,
    pub source_artifact_commitment: Field,
    pub approval_manifest_commitment: Field,
    pub dlp_decision_commitment: Field,
    pub disclosure_nullifier: Field,
    pub claim_id: Field,
    pub public_input_digest: Field,
}

pub struct ThreatPrivate {
    pub exact_confidence_bps: u16,
    pub exact_severity_code: u16,
    pub exact_observed_seconds: u64,
    pub required_source_mask: u64,
    pub source_timestamp_vector: [u32; MAX_SOURCE_FAMILIES],
    pub leaf_count: u32,
    pub evidence_opening: EvidenceOpening,
    pub family_derivation_vector: [u16; 4],
    pub prohibited_data_mask: u64,
    pub policy: PolicyWitness,
    pub approval: ApprovalManifestWitness,
    pub dlp: DlpDecisionWitness,
    pub payload_schema_code: u16,
    pub payload_field_count: u32,
    pub payload_field_vector: [Field; MAX_PAYLOAD_FIELDS],
    pub payload_nonce: Field,
    pub claim_nonce: Field,
}

// All public inputs flattened in declared order.
pub fn publics_vector(p: ThreatPublic) -> [Field; 24] {
    [
        p.protocol_version as Field, p.circuit_id as Field, p.community_id as Field,
        p.chain_id as Field, p.claim_registry_address, p.claim_series_id,
        p.claim_version as Field, p.issuer_company_code as Field, p.claim_family_code as Field,
        p.sector_code as Field, p.severity_band_code as Field, p.confidence_band_code as Field,
        p.observed_epoch as Field, p.valid_from_epoch as Field, p.expiry_epoch as Field,
        p.policy_commitment, p.evidence_commitment, p.payload_commitment,
        p.source_artifact_commitment, p.approval_manifest_commitment, p.dlp_decision_commitment,
        p.disclosure_nullifier, p.claim_id, p.public_input_digest,
    ]
}

// Draft = semantic publics through source_artifact_commitment (indices 0..19).
fn draft_of(v: [Field; 24]) -> Field {
    let mut d: [Field; 19] = [0; 19];
    for i in 0..19 {
        d[i] = v[i];
    }
    claim_draft_commitment(d)
}

fn claim_id_preimage(v: [Field; 24]) -> Field {
    let mut d: [Field; 21] = [0; 21];
    for i in 0..21 {
        d[i] = v[i];
    }
    compute_claim_id(d)
}

fn pi_digest_preimage(v: [Field; 24]) -> Field {
    let mut d: [Field; 23] = [0; 23];
    for i in 0..23 {
        d[i] = v[i];
    }
    compute_pi_digest(d)
}

// Recompute every derived/commitment field of the public input. Scalar fields
// are copied through; used by fixtures to build expected publics and by run()
// to assert consistency.
pub fn compute_publics(p: ThreatPublic, w: ThreatPrivate) -> ThreatPublic {
    let leaf_hash = evidence_leaf_hash(w.evidence_opening.leaf);
    let root = compute_root(
        leaf_hash,
        w.evidence_opening.index_bits,
        w.evidence_opening.siblings,
    );
    let mut out = p;
    out.claim_family_code =
        derive_threat_family_code(w.family_derivation_vector[0], w.family_derivation_vector[1]);
    out.severity_band_code = severity_band_of(w.exact_severity_code);
    out.confidence_band_code = confidence_band_of(w.exact_confidence_bps);
    out.observed_epoch = (w.exact_observed_seconds / 3600) as u32;
    out.policy_commitment = policy_commitment(w.policy);
    out.evidence_commitment = compute_evidence_commitment(
        root,
        w.leaf_count,
        w.evidence_opening.selection_policy_code,
        w.evidence_opening.normalization_version_code,
    );
    out.payload_commitment = compute_payload_commitment(
        w.payload_schema_code,
        w.payload_field_count,
        w.payload_field_vector,
        w.payload_nonce,
    );
    out.approval_manifest_commitment = approval_manifest_commitment(w.approval);
    out.dlp_decision_commitment = dlp_decision_commitment(w.dlp);

    let v = publics_vector(out);
    out.claim_id = claim_id_preimage(v);
    out.disclosure_nullifier = disclosure_nullifier(w.claim_nonce, out.claim_id);
    let v2 = publics_vector(out);
    out.public_input_digest = pi_digest_preimage(v2);
    out
}

pub fn run(public: ThreatPublic, w: ThreatPrivate) {
    // Scalar/domain checks.
    assert(public.protocol_version == PROTOCOL_VERSION_V1, "bad protocol version");
    assert(public.circuit_id == CIRCUIT_THREAT_ELIGIBILITY_V1, "bad circuit id");
    assert_enum(public.claim_family_code, 6);
    assert_enum(public.sector_code, 16);
    assert(public.issuer_company_code != 0, "issuer required");

    // Exact-value checks. Band/family/epoch derivations are enforced by the
    // compute_publics comparison below; these constrain the raw private values.
    assert(w.exact_confidence_bps <= 10000, "confidence out of range");
    assert_enum(w.exact_severity_code, 4);
    assert_epoch_of_seconds(w.exact_observed_seconds, public.observed_epoch);

    // Policy: commitment, type, active interval at observation.
    assert(policy_commitment(w.policy) == public.policy_commitment, "policy commitment mismatch");
    assert_claim_type(w.policy, CLAIM_TYPE_THREAT_ELIGIBILITY);
    assert_active(w.policy, public.observed_epoch);
    let min_severity = w.policy.threshold_vector[0] as u16;
    let min_confidence = w.policy.threshold_vector[1] as u16;
    let max_source_age = w.policy.threshold_vector[2] as u32;
    let min_approvals = w.policy.threshold_vector[3] as u32;
    assert(w.exact_severity_code >= min_severity, "severity below policy threshold");
    assert(w.exact_confidence_bps >= min_confidence, "confidence below policy threshold");

    // Epoch rules: expiry after observation, within policy max TTL.
    assert(public.expiry_epoch > public.observed_epoch, "expiry not after observation");
    assert(
        public.expiry_epoch - public.observed_epoch <= w.policy.max_ttl_epochs,
        "expiry exceeds policy TTL",
    );
    assert(public.valid_from_epoch >= public.observed_epoch, "valid_from before observation");
    assert(public.valid_from_epoch <= public.expiry_epoch, "valid_from after expiry");

    // Required-source coverage + freshness. required_source_mask must equal
    // the committed policy mask; source timestamps must exist, be <= observed,
    // and be within max_source_age for every required bit.
    assert(w.required_source_mask == w.policy.required_source_mask, "source mask != policy mask");
    let mut coverage: u64 = 0;
    for i in 0..MAX_SOURCE_FAMILIES {
        let bit: u64 = (1 as u64) << (i as u64);
        if w.source_timestamp_vector[i] != 0 {
            coverage |= bit;
        }
        if (w.required_source_mask & bit) != 0 {
            let ts = w.source_timestamp_vector[i];
            assert(ts != 0, "required source family missing");
            assert_fresh_epoch(public.observed_epoch, ts, max_source_age);
        }
    }
    assert_mask_covers(coverage, w.required_source_mask);

    // DLP: zero prohibited flags in-circuit AND in the bound decision.
    assert_zero_mask(w.prohibited_data_mask);
    assert(w.dlp.prohibited_data_mask == w.prohibited_data_mask, "dlp mask mismatch");
    assert(w.dlp.decision_code == DLP_DECISION_PASS, "dlp decision is not PASS");
    assert(w.dlp.expiry_epoch >= public.expiry_epoch, "dlp decision expires before claim");

    // Evidence snapshot capacity + leaf-issuer binding.
    assert(w.leaf_count >= 1, "empty evidence snapshot");
    assert(w.leaf_count <= MAX_EVIDENCE_LEAVES, "leaf count over capacity");
    assert(
        w.evidence_opening.leaf.company_code == public.issuer_company_code,
        "evidence leaf not issued by claim issuer",
    );

    // Payload vector capacity + zero padding.
    assert(w.payload_field_count <= MAX_PAYLOAD_FIELDS, "payload over capacity");
    for i in 0..MAX_PAYLOAD_FIELDS {
        if i >= w.payload_field_count {
            assert(w.payload_field_vector[i] == 0, "non-zero payload padding");
        }
    }

    // Draft binding: approval and DLP manifests commit to the same draft.
    let v = publics_vector(public);
    let draft = draft_of(v);
    assert(w.approval.claim_draft_commitment == draft, "approval bound to different draft");
    assert(w.dlp.claim_draft_commitment == draft, "dlp bound to different draft");
    assert_manifest_valid(
        w.approval,
        draft,
        APPROVAL_ACTION_DISCLOSURE,
        min_approvals,
        public.expiry_epoch,
    );

    // All commitment/derived public fields must equal the recomputed values.
    let expected = compute_publics(public, w);
    assert(expected.claim_family_code == public.claim_family_code, "family mismatch");
    assert(expected.severity_band_code == public.severity_band_code, "severity band mismatch");
    assert(expected.confidence_band_code == public.confidence_band_code, "confidence band mismatch");
    assert(expected.observed_epoch == public.observed_epoch, "observed epoch mismatch");
    assert(expected.policy_commitment == public.policy_commitment, "policy commitment mismatch");
    assert(expected.evidence_commitment == public.evidence_commitment, "evidence commitment mismatch");
    assert(expected.payload_commitment == public.payload_commitment, "payload commitment mismatch");
    assert(
        expected.approval_manifest_commitment == public.approval_manifest_commitment,
        "approval commitment mismatch",
    );
    assert(expected.dlp_decision_commitment == public.dlp_decision_commitment, "dlp commitment mismatch");
    assert(expected.disclosure_nullifier == public.disclosure_nullifier, "nullifier mismatch");
    assert(expected.claim_id == public.claim_id, "claim id mismatch");
    assert(
        expected.public_input_digest == public.public_input_digest,
        "public input digest mismatch",
    );
}
