use threat_lib::{ThreatPrivate, ThreatPublic, run};

// ThreatEligibilityV1 — public inputs in frozen manifest order (see
// zk/manifests/predicate-semantics.v1.json, circuits.ThreatEligibilityV1).
fn main(public: pub ThreatPublic, private: ThreatPrivate) {
    run(public, private);
}

#[test]
fn valid_fixture_passes() {
    let (public, private) = kvch_fixtures::threat();
    run(public, private);
}

#[test(should_fail)]
fn wrong_claim_id_fails() {
    let (mut public, private) = kvch_fixtures::threat();
    public.claim_id += 1;
    run(public, private);
}

#[test(should_fail)]
fn prohibited_data_flag_fails() {
    let (public, mut private) = kvch_fixtures::threat();
    private.prohibited_data_mask = 1;
    run(public, private);
}

#[test(should_fail)]
fn missing_required_source_fails() {
    let (public, mut private) = kvch_fixtures::threat();
    private.source_timestamp_vector[2] = 0;
    run(public, private);
}

#[test(should_fail)]
fn low_confidence_fails() {
    let (public, mut private) = kvch_fixtures::threat();
    private.exact_confidence_bps = 1000; // below policy minimum
    run(public, private);
}

#[test(should_fail)]
fn expired_policy_fails() {
    let (public, mut private) = kvch_fixtures::threat();
    private.policy.effective_until_epoch = 493000; // ends at observation
    run(public, private);
}
