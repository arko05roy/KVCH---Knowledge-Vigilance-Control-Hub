use endorsement_lib::{EndorsementPrivate, EndorsementPublic, run};

// PeerEndorsementV1 — public inputs in frozen manifest order.
fn main(public: pub EndorsementPublic, private: EndorsementPrivate) {
    run(public, private);
}

#[test]
fn valid_fixture_passes() {
    let (public, private) = kvch_fixtures::endorsement();
    run(public, private);
}

#[test(should_fail)]
fn self_endorsement_fails() {
    let (mut public, private) = kvch_fixtures::endorsement();
    public.target_issuer_company_code = public.endorser_company_code;
    run(public, private);
}

#[test(should_fail)]
fn score_below_threshold_fails() {
    let (public, mut private) = kvch_fixtures::endorsement();
    private.match_score_bps_exact = 4000; // below 5000 minimum
    run(public, private);
}

#[test(should_fail)]
fn wrong_match_class_fails() {
    let (mut public, private) = kvch_fixtures::endorsement();
    public.match_class_code = 4; // 7200 bps is class 3
    run(public, private);
}

#[test(should_fail)]
fn stale_assessment_fails() {
    let (public, mut private) = kvch_fixtures::endorsement();
    private.assessed_epoch = 400000; // older than max age
    run(public, private);
}

#[test(should_fail)]
fn wrong_nullifier_fails() {
    let (mut public, private) = kvch_fixtures::endorsement();
    public.endorsement_nullifier += 1;
    run(public, private);
}
