use inclusion_lib::{InclusionPrivate, InclusionPublic, run};

// EvidenceInclusionV1 — public inputs in frozen manifest order.
fn main(public: pub InclusionPublic, private: InclusionPrivate) {
    run(public, private);
}

#[test]
fn valid_fixture_passes() {
    let (public, private) = kvch_fixtures::inclusion();
    run(public, private);
}

#[test(should_fail)]
fn wrong_leaf_fails() {
    let (public, mut private) = kvch_fixtures::inclusion();
    private.opening.leaf.leaf_salt += 1;
    run(public, private);
}

#[test(should_fail)]
fn wrong_sibling_fails() {
    let (public, mut private) = kvch_fixtures::inclusion();
    private.opening.siblings[0] += 1;
    run(public, private);
}

#[test(should_fail)]
fn wrong_company_fails() {
    let (mut public, private) = kvch_fixtures::inclusion();
    public.company_code = 99;
    run(public, private);
}

#[test(should_fail)]
fn wrong_nullifier_fails() {
    let (mut public, private) = kvch_fixtures::inclusion();
    public.audit_nullifier += 1;
    run(public, private);
}

#[test(should_fail)]
fn wrong_snapshot_commitment_fails() {
    let (mut public, private) = kvch_fixtures::inclusion();
    public.evidence_commitment += 1;
    run(public, private);
}
