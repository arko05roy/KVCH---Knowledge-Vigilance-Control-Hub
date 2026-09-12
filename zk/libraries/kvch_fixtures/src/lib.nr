// kvch_fixtures: deterministic synthetic witnesses for tests, Prover.toml
// generation and demo replay. Values are synthetic only; never real data.
use endorsement_lib::{EndorsementPrivate, EndorsementPublic, compute_publics as endorse_publics};
use inclusion_lib::{InclusionPrivate, InclusionPublic, compute_publics as incl_publics};
use kvch_commitments::{
    ApprovalManifestWitness, DlpDecisionWitness, PolicyWitness, RiskResultWitness, SignerTuple,
};
use kvch_encoding::{
    APPROVAL_ACTION_DISCLOSURE, APPROVAL_DECISION_APPROVE, CLAIM_TYPE_PEER_ENDORSEMENT,
    CLAIM_TYPE_STAKEHOLDER_RISK, CLAIM_TYPE_THREAT_ELIGIBILITY, DLP_DECISION_PASS, MAX_APPROVALS,
    MAX_PAYLOAD_FIELDS, MAX_REPORT_FIELDS, MAX_SOURCE_FAMILIES, MERKLE_DEPTH,
};
use kvch_merkle::EvidenceOpening;
use risk_lib::{RiskPrivate, RiskPublic, compute_publics as risk_publics};
use threat_lib::{ThreatPrivate, ThreatPublic, compute_publics as threat_publics};

pub global CHAIN_ID_CELO_SEPOLIA: u64 = 11142220;
pub global COMMUNITY_ID: u32 = 7;
pub global CLAIM_REGISTRY: Field = 0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72;
pub global CLAIM_SERIES: Field = 424242;
pub global ISSUER: u32 = 11;
pub global PEER_COMPANY: u32 = 22;
pub global AUDIENCE_STAKEHOLDER: u32 = 9001;
pub global OBSERVED_SECONDS: u64 = 493000 * 3600 + 1234; // inside epoch 493000
pub global OBSERVED_EPOCH: u32 = 493000;
pub global VALID_FROM: u32 = 493000;
pub global EXPIRY: u32 = 493720; // +720 epochs (~30 days)
pub global ISSUED: u32 = 493010;
pub global VALID_UNTIL: u32 = 493730;

fn policy(claim_type: u16) -> PolicyWitness {
    PolicyWitness {
        claim_type_code: claim_type,
        policy_version: 1,
        effective_from_epoch: 490000,
        effective_until_epoch: 499000,
        threshold_vector: [0; 4],
        required_source_mask: 0,
        max_ttl_epochs: 2000,
        codebook_version: 1,
    }
}

pub fn threat_policy() -> PolicyWitness {
    let mut p = policy(CLAIM_TYPE_THREAT_ELIGIBILITY);
    p.threshold_vector = [
        2,   // min severity exact code (MEDIUM+)
        5000, // min confidence bps
        168,  // max source age epochs (~1 week)
        2,   // min approvals
    ];
    p.required_source_mask = 5; // source families 1 and 3 required
    p
}

pub fn risk_policy() -> PolicyWitness {
    let mut p = policy(CLAIM_TYPE_STAKEHOLDER_RISK);
    p.threshold_vector = [
        3, // required completeness bits
        3, // required freshness bits
        72,    // max result age epochs
        2,     // min approvals
    ];
    p
}

pub fn endorsement_policy() -> PolicyWitness {
    let mut p = policy(CLAIM_TYPE_PEER_ENDORSEMENT);
    p.threshold_vector = [
        5000, // min match score bps
        336,  // max assessment age epochs (~2 weeks)
        7,    // endorsement scope code
        0,
    ];
    p
}

// Evidence opening: leaf at index 5 of a depth-10 tree with synthetic siblings.
pub fn evidence_opening(company: u32, payload_commitment: Field, record_id: Field) -> EvidenceOpening {
    let leaf = kvch_commitments::EvidenceLeaf {
        company_code: company,
        source_family_code: 1,
        artifact_commitment: 0xaaa01,
        record_id_commitment: record_id,
        observed_epoch: 492990,
        ingested_epoch: 492995,
        payload_commitment,
        classification_code: 2,
        authenticity_code: 2,
        leaf_salt: 0x5a17,
    };
    let mut bits: [bool; MERKLE_DEPTH] = [false; MERKLE_DEPTH];
    bits[0] = true;
    bits[2] = true; // index 5
    let mut siblings: [Field; MERKLE_DEPTH] = [0; MERKLE_DEPTH];
    for i in 0..MERKLE_DEPTH {
        siblings[i] = (i as Field) * 0x1f3 + 0x77;
    }
    EvidenceOpening {
        leaf,
        index_bits: bits,
        siblings,
        selection_policy_code: 1,
        normalization_version_code: 1,
    }
}

fn approval() -> ApprovalManifestWitness {
    // Draft commitment is patched by each circuit fixture before use.
    let mut tuples: [SignerTuple; MAX_APPROVALS] = [SignerTuple {
        signer_id_commitment: 0,
        role_code: 0,
        decision_code: 0,
        signer_nonce: 0,
        deadline_epoch: 0,
    }; MAX_APPROVALS];
    for i in 0..3 {
        tuples[i] = SignerTuple {
            signer_id_commitment: 0x515e + (i as Field) * 0x9e3,
            role_code: 1,
            decision_code: APPROVAL_DECISION_APPROVE,
            signer_nonce: 0xdead + i as Field,
            deadline_epoch: 494000,
        };
    }
    ApprovalManifestWitness {
        council_set_id: 0xbeef01,
        council_set_version: 1,
        action_code: APPROVAL_ACTION_DISCLOSURE,
        claim_draft_commitment: 0,
        signer_count: 3,
        tuples,
    }
}

fn dlp() -> DlpDecisionWitness {
    DlpDecisionWitness {
        claim_draft_commitment: 0,
        projection_commitment: 0x0d1e,
        prohibited_data_mask: 0,
        scanner_policy_commitment: 0x5ca1,
        decision_code: DLP_DECISION_PASS,
        evaluated_epoch: 493000,
        expiry_epoch: 494000,
    }
}

fn source_timestamps() -> [u32; MAX_SOURCE_FAMILIES] {
    let mut v: [u32; MAX_SOURCE_FAMILIES] = [0; MAX_SOURCE_FAMILIES];
    v[0] = 492990; // family bit0 (family code 1)
    v[2] = 492950; // family bit2 (family code 3)
    v
}

fn payload_vector() -> ([Field; MAX_PAYLOAD_FIELDS], u32) {
    let mut v: [Field; MAX_PAYLOAD_FIELDS] = [0; MAX_PAYLOAD_FIELDS];
    v[0] = 0x111;
    v[1] = 0x222;
    (v, 2)
}

// Assemble a complete valid ThreatEligibilityV1 witness + expected publics.
// Two passes: draft depends on publics, manifests depend on draft.
pub fn threat() -> (ThreatPublic, ThreatPrivate) {
    let (pv, pc) = payload_vector();
    let mut w = ThreatPrivate {
        exact_confidence_bps: 8750, // band 4 = [8000,9500): "80-95"
        exact_severity_code: 3,     // HIGH -> band 3 SEVERE
        exact_observed_seconds: OBSERVED_SECONDS,
        required_source_mask: 5,
        source_timestamp_vector: source_timestamps(),
        leaf_count: 3,
        evidence_opening: evidence_opening(ISSUER, 0x777, 0xbeef55),
        family_derivation_vector: [7, 3, 0, 0], // MALICIOUS_MODEL_DESERIALIZATION -> family 3
        prohibited_data_mask: 0,
        policy: threat_policy(),
        approval: approval(),
        dlp: dlp(),
        payload_schema_code: 1,
        payload_field_count: pc,
        payload_field_vector: pv,
        payload_nonce: 0xfeed1,
        claim_nonce: 0xc1a1a,
    };
    let scalars = ThreatPublic {
        protocol_version: 1,
        circuit_id: 1,
        community_id: COMMUNITY_ID,
        chain_id: CHAIN_ID_CELO_SEPOLIA,
        claim_registry_address: CLAIM_REGISTRY,
        claim_series_id: CLAIM_SERIES,
        claim_version: 1,
        issuer_company_code: ISSUER,
        claim_family_code: 0,
        sector_code: 4,
        severity_band_code: 0,
        confidence_band_code: 0,
        observed_epoch: 0,
        valid_from_epoch: VALID_FROM,
        expiry_epoch: EXPIRY,
        policy_commitment: 0,
        evidence_commitment: 0,
        payload_commitment: 0,
        source_artifact_commitment: 0xac17,
        approval_manifest_commitment: 0,
        dlp_decision_commitment: 0,
        disclosure_nullifier: 0,
        claim_id: 0,
        public_input_digest: 0,
    };
    // Pass 1: derive publics to learn the draft; patch manifests; pass 2.
    let p1 = threat_publics(scalars, w);
    let draft = threat_draft(p1);
    w.approval.claim_draft_commitment = draft;
    w.dlp.claim_draft_commitment = draft;
    let publics = threat_publics(scalars, w);
    (publics, w)
}

fn threat_draft(p: ThreatPublic) -> Field {
    let v = threat_lib::publics_vector(p);
    let mut d: [Field; 19] = [0; 19];
    for i in 0..19 {
        d[i] = v[i];
    }
    kvch_commitments::claim_draft_commitment(d)
}

fn risk_draft(p: RiskPublic) -> Field {
    let v = risk_lib::publics_vector(p);
    let mut d: [Field; 21] = [0; 21];
    for i in 0..21 {
        d[i] = v[i];
    }
    kvch_commitments::claim_draft_commitment(d)
}

pub fn risk() -> (RiskPublic, RiskPrivate) {
    let mut rv: [Field; MAX_REPORT_FIELDS] = [0; MAX_REPORT_FIELDS];
    rv[0] = 0x31;
    rv[1] = 0x32;
    let mut w = RiskPrivate {
        eal_minor_exact: 15_000_000_000, // Rs.15cr inside [10,25)cr band
        var_minor_exact: 20_000_000_000, // Rs.20cr inside [10,30)cr band
        cvar_minor_exact: 28_000_000_000,
        var_percentile_exact_bps: 9500,
        appetite_threshold_minor_exact: 20_000_000_000,
        risk_result: RiskResultWitness {
            company_code: ISSUER,
            result_id_commitment: 0x0b1e,
            period_code: 202608,
            currency_code: 1,
            metric_count: 3,
            eal_minor: 15_000_000_000,
            var_minor: 20_000_000_000,
            cvar_minor: 28_000_000_000,
            var_percentile_bps: 9500,
            completeness_mask: 7,
            freshness_mask: 7,
            evidence_commitment: 0xec0,
            model_bundle_commitment: 0x0de1,
            result_nonce: 0x909,
        },
        report_schema_code: 1,
        report_field_count: 2,
        report_field_vector: rv,
        report_nonce: 0xed1,
        policy: risk_policy(),
        approval: approval(),
        dlp: dlp(),
        claim_nonce: 0x515c0,
    };
    let scalars = RiskPublic {
        protocol_version: 1,
        circuit_id: 2,
        chain_id: CHAIN_ID_CELO_SEPOLIA,
        claim_registry_address: CLAIM_REGISTRY,
        claim_series_id: 5150,
        claim_version: 1,
        issuer_company_code: ISSUER,
        audience_id: AUDIENCE_STAKEHOLDER,
        purpose_code: 2,
        period_code: 202608,
        currency_code: 1,
        metric_flags: 3,
        eal_band_lower: 10_000_000_000,
        eal_band_upper: 25_000_000_000,
        var_band_lower: 10_000_000_000,
        var_band_upper: 30_000_000_000,
        var_percentile_bps: 9500,
        appetite_relation_code: 1, // EAL below appetite threshold (15 < 20)
        issued_epoch: ISSUED,
        valid_until_epoch: VALID_UNTIL,
        policy_commitment: 0,
        lineage_commitment: 0,
        disclosure_scope_id: 0,
        disclosure_nullifier: 0,
        claim_id: 0,
        public_input_digest: 0,
    };
    let p1 = risk_publics(scalars, w);
    let draft = risk_draft(p1);
    w.approval.claim_draft_commitment = draft;
    w.dlp.claim_draft_commitment = draft;
    let publics = risk_publics(scalars, w);
    (publics, w)
}

pub fn endorsement() -> (EndorsementPublic, EndorsementPrivate) {
    // The local assessment is committed as the evidence leaf payload
    // (snapshot-scoped variant: local_evidence_commitment slot is zero).
    let assess_payload = kvch_commitments::local_assessment_commitment(
        PEER_COMPANY,
        0xc1a1d,
        7200,
        3,
        0,
        492950,
        0xace55,
    );
    let w = EndorsementPrivate {
        match_score_bps_exact: 7200, // >= 5000 threshold, class 3 STRONG
        assessed_epoch: 492950,
        assessment_nonce: 0xace55,
        leaf_count: 4,
        local_evidence_opening: evidence_opening(PEER_COMPANY, assess_payload, 0xe11),
        policy: endorsement_policy(),
    };
    let scalars = EndorsementPublic {
        protocol_version: 1,
        circuit_id: 3,
        chain_id: CHAIN_ID_CELO_SEPOLIA,
        endorsement_registry_address: CLAIM_REGISTRY,
        endorser_company_code: PEER_COMPANY,
        target_claim_id: 0xc1a1d,
        target_claim_version: 1,
        target_issuer_company_code: ISSUER,
        endorsement_policy_commitment: 0,
        local_evidence_commitment: 0,
        match_class_code: 0,
        endorsed_epoch: OBSERVED_EPOCH,
        expiry_epoch: EXPIRY,
        endorsement_nullifier: 0,
    };
    let publics = endorse_publics(scalars, w);
    (publics, w)
}

pub fn inclusion() -> (InclusionPublic, InclusionPrivate) {
    let w = InclusionPrivate {
        leaf_count: 3,
        opening: evidence_opening(ISSUER, 0x777, 0xbeef55),
    };
    let scalars = InclusionPublic {
        protocol_version: 1,
        circuit_id: 4,
        company_code: ISSUER,
        evidence_commitment: 0,
        record_commitment: 0,
        purpose_code: 2,
        snapshot_version: 3,
        audit_request_id: 0xad17,
        audit_nullifier: 0,
    };
    let publics = incl_publics(scalars, w);
    (publics, w)
}
