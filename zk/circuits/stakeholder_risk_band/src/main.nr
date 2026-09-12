use risk_lib::{RiskPrivate, RiskPublic, run};

// StakeholderRiskBandV1 — public inputs in frozen manifest order.
fn main(public: pub RiskPublic, private: RiskPrivate) {
    run(public, private);
}

#[test]
fn valid_fixture_passes() {
    let (public, private) = kvch_fixtures::risk();
    run(public, private);
}

#[test(should_fail)]
fn eal_above_band_fails() {
    let (public, mut private) = kvch_fixtures::risk();
    private.eal_minor_exact = 25_000_000_000; // == upper bound, half-open fails
    run(public, private);
}

#[test(should_fail)]
fn wrong_report_commitment_fails() {
    let (public, mut private) = kvch_fixtures::risk();
    private.report_field_vector[0] += 1;
    run(public, private);
}

#[test(should_fail)]
fn inconsistent_risk_result_fails() {
    let (public, mut private) = kvch_fixtures::risk();
    private.risk_result.eal_minor += 1;
    run(public, private);
}

#[test(should_fail)]
fn misaligned_band_fails() {
    let (mut public, private) = kvch_fixtures::risk();
    public.eal_band_lower += 1; // off the approved grid
    run(public, private);
}

#[test(should_fail)]
fn wrong_lineage_fails() {
    let (mut public, private) = kvch_fixtures::risk();
    public.lineage_commitment += 1;
    run(public, private);
}
