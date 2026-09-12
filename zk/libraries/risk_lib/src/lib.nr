// StakeholderRiskBandV1 — see zk/manifests/predicate-semantics.v1.json.
// Proves: signed risk result places exact minor-unit metrics inside the
// disclosed half-open grid-aligned bands for the stated period/currency/
// audience/purpose under the active policy. Exact EAL/VaR/CVaR stay private.
use kvch_approval::assert_manifest_valid;
use kvch_commitments::{
    ApprovalManifestWitness, DlpDecisionWitness, PolicyWitness, RiskResultWitness,
    approval_manifest_commitment, claim_draft_commitment, claim_id as compute_claim_id,
    disclosure_nullifier, disclosure_scope_id as compute_scope_id, dlp_decision_commitment,
    lineage_commitment as compute_lineage, public_input_digest as compute_pi_digest,
    policy_commitment, report_commitment as compute_report_commitment, risk_result_commitment,
};
use kvch_encoding::{
    APPETITE_ABOVE_OR_EQUAL, APPETITE_BELOW, APPETITE_NONE, APPROVAL_ACTION_DISCLOSURE,
    CIRCUIT_STAKEHOLDER_RISK_BAND_V1, CLAIM_TYPE_STAKEHOLDER_RISK, DLP_DECISION_PASS,
    MAX_REPORT_FIELDS, MAX_RISK_METRICS, PROTOCOL_VERSION_V1, assert_enum, assert_grid_aligned,
    assert_in_band_u64, assert_mask_covers, assert_zero_mask,
};
use kvch_policy::{assert_active, assert_claim_type};

pub struct RiskPublic {
    pub protocol_version: u16,
    pub circuit_id: u16,
    pub chain_id: u64,
    pub claim_registry_address: Field,
    pub claim_series_id: Field,
    pub claim_version: u32,
    pub issuer_company_code: u32,
    pub audience_id: u32,
    pub purpose_code: u16,
    pub period_code: u32,
    pub currency_code: u16,
    pub metric_flags: u16,
    pub eal_band_lower: u64,
    pub eal_band_upper: u64,
    pub var_band_lower: u64,
    pub var_band_upper: u64,
    pub var_percentile_bps: u16,
    pub appetite_relation_code: u16,
    pub issued_epoch: u32,
    pub valid_until_epoch: u32,
    pub policy_commitment: Field,
    pub lineage_commitment: Field,
    pub disclosure_scope_id: Field,
    pub disclosure_nullifier: Field,
    pub claim_id: Field,
    pub public_input_digest: Field,
}

pub struct RiskPrivate {
    pub eal_minor_exact: u64,
    pub var_minor_exact: u64,
    pub cvar_minor_exact: u64,
    pub var_percentile_exact_bps: u16,
    pub appetite_threshold_minor_exact: u64,
    pub risk_result: RiskResultWitness,
    pub report_schema_code: u16,
    pub report_field_count: u32,
    pub report_field_vector: [Field; MAX_REPORT_FIELDS],
    pub report_nonce: Field,
    pub policy: PolicyWitness,
    pub approval: ApprovalManifestWitness,
    pub dlp: DlpDecisionWitness,
    pub claim_nonce: Field,
}

pub fn publics_vector(p: RiskPublic) -> [Field; 26] {
    [
        p.protocol_version as Field, p.circuit_id as Field, p.chain_id as Field,
        p.claim_registry_address, p.claim_series_id, p.claim_version as Field,
        p.issuer_company_code as Field, p.audience_id as Field, p.purpose_code as Field,
        p.period_code as Field, p.currency_code as Field, p.metric_flags as Field,
        p.eal_band_lower as Field, p.eal_band_upper as Field, p.var_band_lower as Field,
        p.var_band_upper as Field, p.var_percentile_bps as Field, p.appetite_relation_code as Field,
        p.issued_epoch as Field, p.valid_until_epoch as Field, p.policy_commitment,
        p.lineage_commitment, p.disclosure_scope_id, p.disclosure_nullifier, p.claim_id,
        p.public_input_digest,
    ]
}

// Draft = publics[0..21): scalars through policy_commitment, excluding lineage.
fn draft_of(v: [Field; 26]) -> Field {
    let mut d: [Field; 21] = [0; 21];
    for i in 0..21 {
        d[i] = v[i];
    }
    claim_draft_commitment(d)
}

// claim_id preimage excludes claim_id(24), scope(22), nullifier(23), digest(25)
// -> contiguous prefix of 22 fields through lineage_commitment.
fn claim_id_preimage(v: [Field; 26]) -> Field {
    let mut d: [Field; 22] = [0; 22];
    for i in 0..22 {
        d[i] = v[i];
    }
    compute_claim_id(d)
}

fn pi_digest_preimage(v: [Field; 26]) -> Field {
    let mut d: [Field; 25] = [0; 25];
    for i in 0..25 {
        d[i] = v[i];
    }
    compute_pi_digest(d)
}

pub fn compute_publics(p: RiskPublic, w: RiskPrivate) -> RiskPublic {
    let rrc = risk_result_commitment(w.risk_result);
    let report_c = compute_report_commitment(
        w.report_schema_code,
        w.risk_result.period_code,
        w.risk_result.currency_code,
        w.report_field_count,
        w.report_field_vector,
        w.report_nonce,
    );
    let approval_c = approval_manifest_commitment(w.approval);
    let dlp_c = dlp_decision_commitment(w.dlp);
    let mut out = p;
    out.policy_commitment = policy_commitment(w.policy);
    out.lineage_commitment = compute_lineage(
        rrc,
        w.risk_result.evidence_commitment,
        w.risk_result.model_bundle_commitment,
        report_c,
        approval_c,
        dlp_c,
    );
    out.disclosure_scope_id = compute_scope_id(
        p.issuer_company_code,
        p.audience_id,
        p.purpose_code,
        p.metric_flags,
        p.period_code,
    );
    let v = publics_vector(out);
    out.claim_id = claim_id_preimage(v);
    out.disclosure_nullifier = disclosure_nullifier(w.claim_nonce, out.claim_id);
    let v2 = publics_vector(out);
    out.public_input_digest = pi_digest_preimage(v2);
    out
}

pub fn run(public: RiskPublic, w: RiskPrivate) {
    assert(public.protocol_version == PROTOCOL_VERSION_V1, "bad protocol version");
    assert(public.circuit_id == CIRCUIT_STAKEHOLDER_RISK_BAND_V1, "bad circuit id");
    assert(public.issuer_company_code != 0, "issuer required");
    assert(public.audience_id != 0, "audience required");
    assert_enum(public.purpose_code, 16);
    assert_enum(public.currency_code, 32);
    assert(public.appetite_relation_code <= APPETITE_ABOVE_OR_EQUAL, "bad appetite code");

    // Metric flags: bit0 = EAL disclosed (required), bit1 = VaR disclosed.
    let var_disclosed = (public.metric_flags & 2) != 0;
    assert((public.metric_flags & 1) != 0, "EAL must always be disclosed");
    assert(public.metric_flags <= 3, "unknown metric flag bits");

    // Bands: fixed-grid, half-open [lo, hi).
    assert_grid_aligned(public.eal_band_lower);
    assert_grid_aligned(public.eal_band_upper);
    assert_in_band_u64(w.eal_minor_exact, public.eal_band_lower, public.eal_band_upper);
    if var_disclosed {
        assert_grid_aligned(public.var_band_lower);
        assert_grid_aligned(public.var_band_upper);
        assert_in_band_u64(w.var_minor_exact, public.var_band_lower, public.var_band_upper);
        assert(public.var_percentile_bps <= 10000, "percentile out of range");
        assert(
            public.var_percentile_bps == w.var_percentile_exact_bps,
            "var percentile mismatch",
        );
    } else {
        assert(public.var_band_lower == 0, "var band must use zero sentinel");
        assert(public.var_band_upper == 0, "var band must use zero sentinel");
        assert(public.var_percentile_bps == 0, "var percentile must use zero sentinel");
    }

    // Appetite relation disclosure.
    if public.appetite_relation_code == APPETITE_BELOW {
        assert(w.eal_minor_exact < w.appetite_threshold_minor_exact, "eal not below appetite");
    } else if public.appetite_relation_code == APPETITE_ABOVE_OR_EQUAL {
        assert(w.eal_minor_exact >= w.appetite_threshold_minor_exact, "eal below appetite");
    } else {
        assert(public.appetite_relation_code == APPETITE_NONE, "bad appetite code");
    }

    // Policy commitment/type/active at issuance; TTL bound.
    assert_claim_type(w.policy, CLAIM_TYPE_STAKEHOLDER_RISK);
    assert_active(w.policy, public.issued_epoch);
    assert(public.valid_until_epoch > public.issued_epoch, "valid_until not after issue");
    assert(
        public.valid_until_epoch - public.issued_epoch <= w.policy.max_ttl_epochs,
        "validity exceeds policy TTL",
    );

    // Risk-result witness consistency with exacts and publics.
    let rr = w.risk_result;
    assert(rr.company_code == public.issuer_company_code, "risk result issuer mismatch");
    assert(rr.period_code == public.period_code, "period mismatch");
    assert(rr.currency_code == public.currency_code, "currency mismatch");
    assert(rr.eal_minor == w.eal_minor_exact, "eal mismatch");
    assert(rr.var_minor == w.var_minor_exact, "var mismatch");
    assert(rr.cvar_minor == w.cvar_minor_exact, "cvar mismatch");
    assert(rr.var_percentile_bps == w.var_percentile_exact_bps, "var pct mismatch");
    assert(rr.metric_count >= 1, "no metrics in result");
    assert(rr.metric_count <= MAX_RISK_METRICS, "metric count over capacity");

    // Completeness/freshness masks cover policy-required bits.
    assert_mask_covers(rr.completeness_mask, w.policy.threshold_vector[0] as u64);
    assert_mask_covers(rr.freshness_mask, w.policy.threshold_vector[1] as u64);
    let _max_result_age = w.policy.threshold_vector[2] as u32;
    let min_approvals = w.policy.threshold_vector[3] as u32;

    // Report vector capacity + zero padding.
    assert(w.report_field_count <= MAX_REPORT_FIELDS, "report over capacity");
    for i in 0..MAX_REPORT_FIELDS {
        if i >= w.report_field_count {
            assert(w.report_field_vector[i] == 0, "non-zero report padding");
        }
    }

    // DLP pass + mask zero (witness mask must match bound decision).
    assert(w.dlp.decision_code == DLP_DECISION_PASS, "dlp decision is not PASS");
    assert_zero_mask(w.dlp.prohibited_data_mask);
    assert(w.dlp.expiry_epoch >= public.valid_until_epoch, "dlp expires before claim");

    // Draft binding for approval and DLP manifests.
    let v = publics_vector(public);
    let draft = draft_of(v);
    assert(w.approval.claim_draft_commitment == draft, "approval bound to different draft");
    assert(w.dlp.claim_draft_commitment == draft, "dlp bound to different draft");
    assert_manifest_valid(
        w.approval,
        draft,
        APPROVAL_ACTION_DISCLOSURE,
        min_approvals,
        public.valid_until_epoch,
    );

    // Recompute all commitment/derived public fields.
    let expected = compute_publics(public, w);
    assert(expected.policy_commitment == public.policy_commitment, "policy commitment mismatch");
    assert(expected.lineage_commitment == public.lineage_commitment, "lineage commitment mismatch");
    assert(expected.disclosure_scope_id == public.disclosure_scope_id, "scope id mismatch");
    assert(expected.disclosure_nullifier == public.disclosure_nullifier, "nullifier mismatch");
    assert(expected.claim_id == public.claim_id, "claim id mismatch");
    assert(
        expected.public_input_digest == public.public_input_digest,
        "public input digest mismatch",
    );
}
