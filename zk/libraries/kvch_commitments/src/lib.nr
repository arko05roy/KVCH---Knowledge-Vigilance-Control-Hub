// kvch_commitments: pinned Poseidon2 sponge over the backend-native
// poseidon2_permutation blackbox (Barretenberg BN254, state size 4), plus every
// commitment preimage declared in zk/manifests/predicate-semantics.v1.json.
//
// Sponge: rate 3 / capacity 1, absorb-add-permute, squeeze state[0].
// Domain separation: first absorbed element is always a domain tag and every
// preimage type has a fixed arity, so cross-type collisions are impossible.
use kvch_encoding::{MAX_APPROVALS, MAX_PAYLOAD_FIELDS, MAX_REPORT_FIELDS};

pub global TAG_LEAF: Field = 1; // KVCH_LEAF_V1
pub global TAG_SNAPSHOT: Field = 2; // KVCH_SNAPSHOT_V1
pub global TAG_REPORT: Field = 3; // KVCH_REPORT_V1
pub global TAG_PAYLOAD: Field = 4; // KVCH_PAYLOAD_V1
pub global TAG_RISK: Field = 5; // KVCH_RISK_V1
pub global TAG_APPROVAL: Field = 6; // KVCH_APPROVAL_V1
pub global TAG_DLP: Field = 7; // KVCH_DLP_V1
pub global TAG_POLICY: Field = 8; // KVCH_POLICY_V1
pub global TAG_CLAIM_ID: Field = 9; // KVCH_CLAIM_ID_V1
pub global TAG_DISC_NULL: Field = 10; // KVCH_DISC_NULL_V1
pub global TAG_SCOPE: Field = 11; // KVCH_SCOPE_V1
pub global TAG_ENDORSE_NULL: Field = 12; // KVCH_ENDORSE_NULL_V1
pub global TAG_AUDIT_NULL: Field = 13; // KVCH_AUDIT_NULL_V1
pub global TAG_RECORD: Field = 14; // KVCH_RECORD_V1
pub global TAG_ASSESS: Field = 15; // KVCH_ASSESS_V1
pub global TAG_LINEAGE: Field = 16; // KVCH_LINEAGE_V1
pub global TAG_PI: Field = 17; // KVCH_PI_V1
pub global TAG_CLAIM_DRAFT: Field = 18; // draft binding for approval/DLP manifests
pub global TAG_MERKLE_NODE: Field = 19; // internal tree node hash

pub fn poseidon2<let N: u32>(inputs: [Field; N]) -> Field {
    let mut state: [Field; 4] = [0; 4];
    for block in 0..((N + 2) / 3) {
        for j in 0..3 {
            let i = block * 3 + j;
            if i < N {
                state[j] += inputs[i];
            }
        }
        state = std::hash::poseidon2_permutation(state);
    }
    state[0]
}

fn tagged<let N: u32>(tag: Field, fields: [Field; N]) -> Field {
    let mut v: [Field; N + 1] = [0; N + 1];
    v[0] = tag;
    for i in 0..N {
        v[i + 1] = fields[i];
    }
    poseidon2(v)
}

// A single evidence leaf (hiding: leaf_salt is a >=128-bit nonce).
pub struct EvidenceLeaf {
    pub company_code: u32,
    pub source_family_code: u16,
    pub artifact_commitment: Field,
    pub record_id_commitment: Field,
    pub observed_epoch: u32,
    pub ingested_epoch: u32,
    pub payload_commitment: Field,
    pub classification_code: u16,
    pub authenticity_code: u16,
    pub leaf_salt: Field,
}

pub fn evidence_leaf_hash(leaf: EvidenceLeaf) -> Field {
    tagged(
        TAG_LEAF,
        [
            leaf.company_code as Field, leaf.source_family_code as Field, leaf.artifact_commitment,
            leaf.record_id_commitment, leaf.observed_epoch as Field, leaf.ingested_epoch as Field,
            leaf.payload_commitment, leaf.classification_code as Field, leaf.authenticity_code as Field,
            leaf.leaf_salt,
        ],
    )
}

// Snapshot commitment = H(TAG_SNAPSHOT, merkle_root, leaf_count,
// selection_policy_code, normalization_version_code).
pub fn evidence_commitment(
    merkle_root: Field,
    leaf_count: u32,
    selection_policy_code: u16,
    normalization_version_code: u16,
) -> Field {
    tagged(
        TAG_SNAPSHOT,
        [
            merkle_root, leaf_count as Field, selection_policy_code as Field,
            normalization_version_code as Field,
        ],
    )
}

pub fn record_commitment(record_id_commitment: Field, payload_commitment: Field) -> Field {
    tagged(TAG_RECORD, [record_id_commitment, payload_commitment])
}

pub fn payload_commitment(
    payload_schema_code: u16,
    field_count: u32,
    field_vector: [Field; MAX_PAYLOAD_FIELDS],
    payload_nonce: Field,
) -> Field {
    let mut pre: [Field; 3 + MAX_PAYLOAD_FIELDS] = [0; 3 + MAX_PAYLOAD_FIELDS];
    pre[0] = payload_schema_code as Field;
    pre[1] = field_count as Field;
    pre[2] = payload_nonce;
    for i in 0..MAX_PAYLOAD_FIELDS {
        pre[3 + i] = field_vector[i];
    }
    tagged(TAG_PAYLOAD, pre)
}

// Manifest order: schema, period, currency, field_count, vector, nonce.
pub fn report_commitment(
    report_schema_code: u16,
    period_code: u32,
    currency_code: u16,
    field_count: u32,
    field_vector: [Field; MAX_REPORT_FIELDS],
    report_nonce: Field,
) -> Field {
    let mut pre: [Field; 5 + MAX_REPORT_FIELDS] = [0; 5 + MAX_REPORT_FIELDS];
    pre[0] = report_schema_code as Field;
    pre[1] = period_code as Field;
    pre[2] = currency_code as Field;
    pre[3] = field_count as Field;
    for i in 0..MAX_REPORT_FIELDS {
        pre[4 + i] = field_vector[i];
    }
    pre[4 + MAX_REPORT_FIELDS] = report_nonce;
    tagged(TAG_REPORT, pre)
}

// Risk-result commitment (RiskResultAdapter digest equivalent).
pub struct RiskResultWitness {
    pub company_code: u32,
    pub result_id_commitment: Field,
    pub period_code: u32,
    pub currency_code: u16,
    pub metric_count: u32,
    pub eal_minor: u64,
    pub var_minor: u64,
    pub cvar_minor: u64,
    pub var_percentile_bps: u16,
    pub completeness_mask: u64,
    pub freshness_mask: u64,
    pub evidence_commitment: Field,
    pub model_bundle_commitment: Field,
    pub result_nonce: Field,
}

pub fn risk_result_commitment(w: RiskResultWitness) -> Field {
    tagged(
        TAG_RISK,
        [
            w.company_code as Field, w.result_id_commitment, w.period_code as Field,
            w.currency_code as Field, w.metric_count as Field, w.eal_minor as Field,
            w.var_minor as Field, w.cvar_minor as Field, w.var_percentile_bps as Field,
            w.completeness_mask as Field, w.freshness_mask as Field, w.evidence_commitment,
            w.model_bundle_commitment, w.result_nonce,
        ],
    )
}

// Approval manifest: signer tuples are individually committed then vector-committed.
pub struct SignerTuple {
    pub signer_id_commitment: Field,
    pub role_code: u16,
    pub decision_code: u16,
    pub signer_nonce: Field,
    pub deadline_epoch: u32,
}

pub fn approval_signer_tuple(t: SignerTuple) -> Field {
    tagged(
        TAG_APPROVAL,
        [
            t.signer_id_commitment, t.role_code as Field, t.decision_code as Field, t.signer_nonce,
            t.deadline_epoch as Field,
        ],
    )
}

pub struct ApprovalManifestWitness {
    pub council_set_id: Field,
    pub council_set_version: u32,
    pub action_code: u16,
    pub claim_draft_commitment: Field,
    pub signer_count: u32,
    pub tuples: [SignerTuple; MAX_APPROVALS],
}

pub fn approval_manifest_commitment(w: ApprovalManifestWitness) -> Field {
    let mut tuple_hashes: [Field; MAX_APPROVALS] = [0; MAX_APPROVALS];
    for i in 0..MAX_APPROVALS {
        tuple_hashes[i] = approval_signer_tuple(w.tuples[i]);
    }
    let mut pre: [Field; 5 + MAX_APPROVALS] = [0; 5 + MAX_APPROVALS];
    pre[0] = w.council_set_id;
    pre[1] = w.council_set_version as Field;
    pre[2] = w.action_code as Field;
    pre[3] = w.claim_draft_commitment;
    pre[4] = w.signer_count as Field;
    for i in 0..MAX_APPROVALS {
        pre[5 + i] = tuple_hashes[i];
    }
    tagged(TAG_APPROVAL, pre)
}

// DLP decision commitment.
pub struct DlpDecisionWitness {
    pub claim_draft_commitment: Field,
    pub projection_commitment: Field,
    pub prohibited_data_mask: u64,
    pub scanner_policy_commitment: Field,
    pub decision_code: u16,
    pub evaluated_epoch: u32,
    pub expiry_epoch: u32,
}

pub fn dlp_decision_commitment(w: DlpDecisionWitness) -> Field {
    tagged(
        TAG_DLP,
        [
            w.claim_draft_commitment, w.projection_commitment, w.prohibited_data_mask as Field,
            w.scanner_policy_commitment, w.decision_code as Field, w.evaluated_epoch as Field,
            w.expiry_epoch as Field,
        ],
    )
}

// Policy commitment. threshold_vector semantics are circuit-scoped and fixed
// per claim type (documented in each circuit's constraints).
pub struct PolicyWitness {
    pub claim_type_code: u16,
    pub policy_version: u32,
    pub effective_from_epoch: u32,
    pub effective_until_epoch: u32,
    pub threshold_vector: [Field; 4],
    pub required_source_mask: u64,
    pub max_ttl_epochs: u32,
    pub codebook_version: u16,
}

pub fn policy_commitment(w: PolicyWitness) -> Field {
    tagged(
        TAG_POLICY,
        [
            w.claim_type_code as Field, w.policy_version as Field, w.effective_from_epoch as Field,
            w.effective_until_epoch as Field, w.threshold_vector[0], w.threshold_vector[1],
            w.threshold_vector[2], w.threshold_vector[3], w.required_source_mask as Field,
            w.max_ttl_epochs as Field, w.codebook_version as Field,
        ],
    )
}

pub fn disclosure_nullifier(claim_nonce: Field, claim_id: Field) -> Field {
    tagged(TAG_DISC_NULL, [claim_nonce, claim_id])
}

pub fn disclosure_scope_id(
    issuer_company_code: u32,
    audience_id: u32,
    purpose_code: u16,
    metric_code: u16,
    period_code: u32,
) -> Field {
    tagged(
        TAG_SCOPE,
        [
            issuer_company_code as Field, audience_id as Field, purpose_code as Field,
            metric_code as Field, period_code as Field,
        ],
    )
}

pub fn endorsement_nullifier(
    endorser_company_code: u32,
    target_claim_id: Field,
    target_claim_version: u32,
    scope_code: Field,
) -> Field {
    tagged(
        TAG_ENDORSE_NULL,
        [endorser_company_code as Field, target_claim_id, target_claim_version as Field, scope_code],
    )
}

pub fn audit_nullifier(
    company_code: u32,
    evidence_commitment: Field,
    purpose_code: u16,
    audit_request_id: Field,
    snapshot_version: u32,
) -> Field {
    tagged(
        TAG_AUDIT_NULL,
        [
            company_code as Field, evidence_commitment, purpose_code as Field, audit_request_id,
            snapshot_version as Field,
        ],
    )
}

pub fn local_assessment_commitment(
    endorser_company_code: u32,
    target_claim_id: Field,
    match_score_bps: u16,
    match_class_code: u16,
    local_evidence_commitment: Field,
    assessed_epoch: u32,
    assessment_nonce: Field,
) -> Field {
    tagged(
        TAG_ASSESS,
        [
            endorser_company_code as Field, target_claim_id, match_score_bps as Field,
            match_class_code as Field, local_evidence_commitment, assessed_epoch as Field,
            assessment_nonce,
        ],
    )
}

pub fn lineage_commitment(
    risk_result_commitment: Field,
    evidence_commitment: Field,
    model_bundle_commitment: Field,
    report_commitment: Field,
    approval_manifest_commitment: Field,
    dlp_decision_commitment: Field,
) -> Field {
    tagged(
        TAG_LINEAGE,
        [
            risk_result_commitment, evidence_commitment, model_bundle_commitment, report_commitment,
            approval_manifest_commitment, dlp_decision_commitment,
        ],
    )
}

// claim_id = H(TAG_CLAIM_ID, all public inputs in declared order excluding
// claim_id, derived nullifier/scope fields and public_input_digest).
pub fn claim_id<let N: u32>(publics: [Field; N]) -> Field {
    tagged(TAG_CLAIM_ID, publics)
}

// public_input_digest = H(TAG_PI, all public inputs in declared order
// excluding public_input_digest itself).
pub fn public_input_digest<let N: u32>(publics: [Field; N]) -> Field {
    tagged(TAG_PI, publics)
}

// claim_draft_commitment binds approval and DLP manifests to the exact claim
// content (semantic public inputs excluding approval/dlp/nullifier/claim_id/
// public_input_digest).
pub fn claim_draft_commitment<let N: u32>(fields: [Field; N]) -> Field {
    tagged(TAG_CLAIM_DRAFT, fields)
}

mod tests {
    use super::{TAG_LEAF, TAG_RECORD, poseidon2, tagged};

    #[test]
    fn sponge_deterministic() {
        assert(poseidon2([1, 2, 3]) == poseidon2([1, 2, 3]));
        assert(poseidon2([1, 2, 3]) != poseidon2([1, 2, 4]));
    }

    #[test]
    fn domain_tags_separate() {
        // Same body under two tags must differ.
        let a = tagged(TAG_LEAF, [1, 2]);
        let b = tagged(TAG_RECORD, [1, 2]);
        assert(a != b);
    }

    #[test]
    fn length_separation() {
        // [t,1,2] vs [t,1,2,0] must not collide under our tagging discipline.
        assert(tagged(9, [1, 2]) != tagged(9, [1, 2, 0]));
    }
}
