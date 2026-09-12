// kvch_approval: in-circuit approval-manifest binding.
// Honest scope (spec step 16): EIP-712 signatures are verified OFF-circuit by
// the prover and again by verifier nodes. The circuit only proves that the
// committed manifest contains min_approvals distinct tuples, all with
// decision = APPROVE, unexpired deadlines, bound to the claim draft.
use kvch_commitments::{ApprovalManifestWitness, SignerTuple, approval_manifest_commitment, approval_signer_tuple};
use kvch_encoding::{APPROVAL_DECISION_APPROVE, MAX_APPROVALS};

pub fn assert_manifest_valid(
    w: ApprovalManifestWitness,
    claim_draft_commitment: Field,
    action_code: u16,
    min_approvals: u32,
    not_after_epoch: u32,
) {
    assert(w.claim_draft_commitment == claim_draft_commitment, "manifest bound to different draft");
    assert(w.action_code == action_code, "wrong approval action");
    assert(w.signer_count >= min_approvals, "insufficient approvals");
    assert(w.signer_count <= MAX_APPROVALS, "signer vector over capacity");

    // Tuples beyond signer_count must be the all-zero sentinel so a manifest
    // cannot smuggle alternate approvals in padding slots.
    let mut seen: [Field; MAX_APPROVALS] = [0; MAX_APPROVALS];
    for i in 0..MAX_APPROVALS {
        let t = w.tuples[i];
        if i < w.signer_count {
            assert(t.decision_code == APPROVAL_DECISION_APPROVE, "non-approve decision in manifest");
            assert(t.deadline_epoch >= not_after_epoch, "approval deadline before claim expiry");
            assert(t.signer_id_commitment != 0, "empty signer id");
            // Distinct signers: no duplicates inside the prefix.
            for j in 0..MAX_APPROVALS {
                if (j < i) & (j < w.signer_count) {
                    assert(
                        t.signer_id_commitment != seen[j],
                        "duplicate signer in approval manifest",
                    );
                }
            }
            seen[i] = t.signer_id_commitment;
        } else {
            assert(
                approval_signer_tuple(t) == approval_signer_tuple(zero_tuple()),
                "non-empty approval tuple beyond signer_count",
            );
        }
    }
}

pub fn zero_tuple() -> SignerTuple {
    SignerTuple {
        signer_id_commitment: 0,
        role_code: 0,
        decision_code: 0,
        signer_nonce: 0,
        deadline_epoch: 0,
    }
}

pub fn manifest_commitment(w: ApprovalManifestWitness) -> Field {
    approval_manifest_commitment(w)
}
