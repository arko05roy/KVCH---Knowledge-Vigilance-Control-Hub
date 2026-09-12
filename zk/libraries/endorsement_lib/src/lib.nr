// PeerEndorsementV1 — see zk/manifests/predicate-semantics.v1.json.
// Proves: an identified non-origin company holds a signed local assessment
// whose exact private match score crosses the endorsement policy threshold and
// maps to the disclosed match class, producing one unique endorsement
// nullifier. Exact score and local evidence stay private.
use kvch_commitments::{
    PolicyWitness, endorsement_nullifier as compute_endorsement_nullifier,
    evidence_commitment as compute_evidence_commitment, evidence_leaf_hash,
    local_assessment_commitment, policy_commitment,
};
use kvch_encoding::{
    CIRCUIT_PEER_ENDORSEMENT_V1, CLAIM_TYPE_PEER_ENDORSEMENT, MAX_EVIDENCE_LEAVES,
    PROTOCOL_VERSION_V1, assert_enum, assert_fresh_epoch,
};
use kvch_merkle::{EvidenceOpening, compute_root};
use kvch_policy::{assert_active, assert_claim_type, match_class_of};

pub struct EndorsementPublic {
    pub protocol_version: u16,
    pub circuit_id: u16,
    pub chain_id: u64,
    pub endorsement_registry_address: Field,
    pub endorser_company_code: u32,
    pub target_claim_id: Field,
    pub target_claim_version: u32,
    pub target_issuer_company_code: u32,
    pub endorsement_policy_commitment: Field,
    pub local_evidence_commitment: Field,
    pub match_class_code: u16,
    pub endorsed_epoch: u32,
    pub expiry_epoch: u32,
    pub endorsement_nullifier: Field,
}

pub struct EndorsementPrivate {
    pub match_score_bps_exact: u16,
    pub assessed_epoch: u32,
    pub assessment_nonce: Field,
    pub leaf_count: u32,
    pub local_evidence_opening: EvidenceOpening,
    pub policy: PolicyWitness,
}

pub fn compute_publics(p: EndorsementPublic, w: EndorsementPrivate) -> EndorsementPublic {
    let leaf_hash = evidence_leaf_hash(w.local_evidence_opening.leaf);
    let root = compute_root(
        leaf_hash,
        w.local_evidence_opening.index_bits,
        w.local_evidence_opening.siblings,
    );
    let mut out = p;
    out.endorsement_policy_commitment = policy_commitment(w.policy);
    out.local_evidence_commitment = compute_evidence_commitment(
        root,
        w.leaf_count,
        w.local_evidence_opening.selection_policy_code,
        w.local_evidence_opening.normalization_version_code,
    );
    out.match_class_code = match_class_of(w.match_score_bps_exact);
    out.endorsement_nullifier = compute_endorsement_nullifier(
        p.endorser_company_code,
        p.target_claim_id,
        p.target_claim_version,
        w.policy.threshold_vector[2],
    );
    out
}

pub fn run(public: EndorsementPublic, w: EndorsementPrivate) {
    assert(public.protocol_version == PROTOCOL_VERSION_V1, "bad protocol version");
    assert(public.circuit_id == CIRCUIT_PEER_ENDORSEMENT_V1, "bad circuit id");
    assert(public.endorser_company_code != 0, "endorser required");
    assert(public.target_claim_id != 0, "target claim required");

    // Origin self-endorsement is forbidden in-circuit in V1.
    assert(
        public.endorser_company_code != public.target_issuer_company_code,
        "self-endorsement forbidden",
    );

    // Exact score: crosses policy threshold and maps to disclosed class.
    assert(w.match_score_bps_exact <= 10000, "score out of range");
    let min_score = w.policy.threshold_vector[0] as u16;
    let max_assessment_age = w.policy.threshold_vector[1] as u32;
    assert(w.match_score_bps_exact >= min_score, "match score below threshold");
    assert(public.match_class_code == match_class_of(w.match_score_bps_exact), "class mismatch");
    assert_enum(public.match_class_code, 4);

    // Policy commitment/type/active at endorsement; TTL bound.
    assert_claim_type(w.policy, CLAIM_TYPE_PEER_ENDORSEMENT);
    assert_active(w.policy, public.endorsed_epoch);
    assert(public.expiry_epoch > public.endorsed_epoch, "expiry not after endorsement");
    assert(
        public.expiry_epoch - public.endorsed_epoch <= w.policy.max_ttl_epochs,
        "expiry exceeds policy TTL",
    );

    // Assessment freshness: assessed before endorsement, within max age.
    assert(w.assessed_epoch <= public.endorsed_epoch, "assessment in the future");
    assert_fresh_epoch(public.endorsed_epoch, w.assessed_epoch, max_assessment_age);

    // Evidence snapshot capacity; leaf must belong to the endorser and carry
    // the local assessment as its payload. Snapshot-scoped variant of the
    // assessment preimage: local_evidence_commitment is omitted because a leaf
    // cannot commit to the commitment of the tree it belongs to. The full
    // preimage (with local_evidence_commitment) is the adapter/verifier-layer
    // envelope digest.
    assert(w.leaf_count >= 1, "empty evidence snapshot");
    assert(w.leaf_count <= MAX_EVIDENCE_LEAVES, "leaf count over capacity");
    let leaf = w.local_evidence_opening.leaf;
    assert(leaf.company_code == public.endorser_company_code, "evidence leaf not endorser's");
    let assess_payload = local_assessment_commitment(
        public.endorser_company_code,
        public.target_claim_id,
        w.match_score_bps_exact,
        public.match_class_code,
        0,
        w.assessed_epoch,
        w.assessment_nonce,
    );
    assert(
        leaf.payload_commitment == assess_payload,
        "leaf does not commit the local assessment",
    );

    let expected = compute_publics(public, w);
    assert(
        expected.endorsement_policy_commitment == public.endorsement_policy_commitment,
        "policy commitment mismatch",
    );
    assert(
        expected.local_evidence_commitment == public.local_evidence_commitment,
        "evidence commitment mismatch",
    );
    assert(expected.match_class_code == public.match_class_code, "match class mismatch");
    assert(
        expected.endorsement_nullifier == public.endorsement_nullifier,
        "endorsement nullifier mismatch",
    );
}
