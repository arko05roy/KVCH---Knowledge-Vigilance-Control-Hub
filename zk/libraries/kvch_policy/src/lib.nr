// kvch_policy: policy-witness helpers shared by claim circuits.
// threshold_vector slots are fixed per claim type:
//   threat      [0]=min_severity_code [1]=min_confidence_bps
//               [2]=max_source_age_epochs [3]=min_approval_count
//   risk        [0]=required_completeness_mask [1]=required_freshness_mask
//               [2]=max_result_age_epochs    [3]=min_approval_count
//   endorsement [0]=min_match_score_bps [1]=max_assessment_age_epochs
//               [2]=scope_code              [3]=unused
use kvch_commitments::PolicyWitness;
use kvch_encoding::assert_enum;

pub fn assert_active(policy: PolicyWitness, at_epoch: u32) {
    assert(policy.effective_from_epoch <= at_epoch, "policy not yet effective");
    assert(at_epoch < policy.effective_until_epoch, "policy expired");
    assert(
        policy.effective_from_epoch < policy.effective_until_epoch,
        "policy interval is empty",
    );
}

pub fn assert_claim_type(policy: PolicyWitness, claim_type_code: u16) {
    assert(policy.claim_type_code == claim_type_code, "policy is for a different claim type");
}

// Deterministic threat-family mapping (codebook v1). Private detector class
// codes map onto public family codes; unknown classes are rejected.
//   1 PHISHING            -> 1 CREDENTIAL_ATTACK
//   2 RANSOMWARE          -> 2 MALWARE
//   3 TROJAN              -> 2 MALWARE
//   4 SUPPLY_CHAIN_PKG    -> 3 SUPPLY_CHAIN
//   5 INSIDER             -> 4 INSIDER_MISUSE
//   6 DDOS                -> 5 AVAILABILITY_ATTACK
//   7 MALICIOUS_MODEL_DESERIALIZATION -> 3 SUPPLY_CHAIN
//   8 DATA_EXFIL          -> 6 DATA_THEFT
pub fn derive_threat_family_code(detector_class_code: u16, _kill_chain_phase_code: u16) -> u16 {
    assert_enum(detector_class_code, 8);
    let family = if detector_class_code == 1 {
        1
    } else if (detector_class_code == 2) | (detector_class_code == 3) {
        2
    } else if (detector_class_code == 4) | (detector_class_code == 7) {
        3
    } else if detector_class_code == 5 {
        4
    } else if detector_class_code == 6 {
        5
    } else {
        6
    };
    family
}

// Peer-endorsement match class from exact score (bps): thresholds fixed by
// codebook v1: <2500 WEAK=1, <5000 MODERATE=2, <7500 STRONG=3, >=7500 CRITICAL=4.
pub fn match_class_of(score_bps: u16) -> u16 {
    assert(score_bps <= 10000, "match score exceeds 10000 bps");
    if score_bps < 2500 {
        1
    } else if score_bps < 5000 {
        2
    } else if score_bps < 7500 {
        3
    } else {
        4
    }
}

mod tests {
    use super::{derive_threat_family_code, match_class_of};

    #[test]
    fn family_mapping() {
        assert(derive_threat_family_code(7, 1) == 3); // MALICIOUS_MODEL_DESERIALIZATION
        assert(derive_threat_family_code(1, 1) == 1);
        assert(derive_threat_family_code(8, 9) == 6);
    }

    #[test(should_fail)]
    fn unknown_class_rejected() {
        let _ = derive_threat_family_code(9, 1);
    }

    #[test]
    fn match_classes() {
        assert(match_class_of(0) == 1);
        assert(match_class_of(2500) == 2);
        assert(match_class_of(5000) == 3);
        assert(match_class_of(7500) == 4);
        assert(match_class_of(10000) == 4);
    }
}
