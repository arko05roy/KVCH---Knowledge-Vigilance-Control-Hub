// EvidenceInclusionV1 — see zk/manifests/predicate-semantics.v1.json.
// Proves: a privately held record commitment is a leaf of the publicly
// committed evidence snapshot for the stated company, purpose, snapshot
// version and audit request — without revealing record body, salt, leaf index
// or sibling path. Single-purpose audit scope prevents proof reuse.
use kvch_commitments::{
    audit_nullifier as compute_audit_nullifier,
    evidence_commitment as compute_evidence_commitment, evidence_leaf_hash, record_commitment,
};
use kvch_encoding::{
    CIRCUIT_EVIDENCE_INCLUSION_V1, MAX_EVIDENCE_LEAVES, PROTOCOL_VERSION_V1, assert_enum,
};
use kvch_merkle::{EvidenceOpening, compute_root};

pub struct InclusionPublic {
    pub protocol_version: u16,
    pub circuit_id: u16,
    pub company_code: u32,
    pub evidence_commitment: Field,
    pub record_commitment: Field,
    pub purpose_code: u16,
    pub snapshot_version: u32,
    pub audit_request_id: Field,
    pub audit_nullifier: Field,
}

pub struct InclusionPrivate {
    pub leaf_count: u32,
    pub opening: EvidenceOpening,
}

pub fn compute_publics(p: InclusionPublic, w: InclusionPrivate) -> InclusionPublic {
    let leaf_hash = evidence_leaf_hash(w.opening.leaf);
    let root = compute_root(leaf_hash, w.opening.index_bits, w.opening.siblings);
    let mut out = p;
    out.evidence_commitment = compute_evidence_commitment(
        root,
        w.leaf_count,
        w.opening.selection_policy_code,
        w.opening.normalization_version_code,
    );
    out.record_commitment = record_commitment(
        w.opening.leaf.record_id_commitment,
        w.opening.leaf.payload_commitment,
    );
    out.audit_nullifier = compute_audit_nullifier(
        p.company_code,
        out.evidence_commitment,
        p.purpose_code,
        p.audit_request_id,
        p.snapshot_version,
    );
    out
}

pub fn run(public: InclusionPublic, w: InclusionPrivate) {
    assert(public.protocol_version == PROTOCOL_VERSION_V1, "bad protocol version");
    assert(public.circuit_id == CIRCUIT_EVIDENCE_INCLUSION_V1, "bad circuit id");
    assert(public.company_code != 0, "company required");
    assert_enum(public.purpose_code, 16);
    assert(public.snapshot_version != 0, "snapshot version required");
    assert(public.audit_request_id != 0, "audit request required");

    assert(w.leaf_count >= 1, "empty evidence snapshot");
    assert(w.leaf_count <= MAX_EVIDENCE_LEAVES, "leaf count over capacity");
    assert(
        w.opening.leaf.company_code == public.company_code,
        "leaf does not belong to company",
    );

    let expected = compute_publics(public, w);
    assert(
        expected.evidence_commitment == public.evidence_commitment,
        "evidence commitment mismatch",
    );
    assert(expected.record_commitment == public.record_commitment, "record commitment mismatch");
    assert(expected.audit_nullifier == public.audit_nullifier, "audit nullifier mismatch");
}
