// kvch_encoding: frozen scalar capacities, enum codebooks, range/mask/epoch helpers.
// Semantics per zk/manifests/predicate-semantics.v1.json (v1.0.0, frozen).

pub global MERKLE_DEPTH: u32 = 10;
pub global MAX_EVIDENCE_LEAVES: u32 = 1024;
pub global MAX_SOURCE_FAMILIES: u32 = 64;
pub global MAX_PROHIBITED_FLAGS: u32 = 64;
pub global MAX_APPROVALS: u32 = 16;
pub global MAX_COUNCIL_MEMBERS: u32 = 16;
pub global MAX_PAYLOAD_FIELDS: u32 = 64;
pub global MAX_PAYLOAD_FIELD_BYTES: u32 = 256;
pub global MAX_REPORT_FIELDS: u32 = 32;
pub global MAX_RISK_METRICS: u32 = 4;
pub global NONCE_BYTES: u32 = 16;

pub global EPOCH_DURATION_SECONDS: u64 = 3600;

// Confidence (basis points 0..=10000) band edges, half-open [lo, hi).
// Band 5 closes the scale at 10001 so 10000 is representable.
pub global CONFIDENCE_BAND_LO: [u16; 5] = [0, 2500, 5000, 8000, 9500];
pub global CONFIDENCE_BAND_HI: [u16; 5] = [2500, 5000, 8000, 9500, 10001];

// Severity exact codes (codebook_v1): 0 RESERVED, 1 LOW, 2 MEDIUM, 3 HIGH, 4 CRITICAL.
pub global SEVERITY_MAX_CODE: u16 = 4;
// Severity bands are coarser than exact codes: 1=MINOR(LOW),
// 2=MODERATE(MEDIUM), 3=SEVERE(HIGH or CRITICAL). Exact code stays private.
pub global SEVERITY_BAND_MAX_CODE: u16 = 3;

// Stakeholder risk bands must align to a fixed grid of council-approved widths.
// GRID = 5_000_000_000 minor units (paise) = Rs.5 crore. Band 10-25cr is
// [10_000_000_000, 25_000_000_000).
pub global RISK_BAND_GRID_MINOR: u64 = 5_000_000_000;

// Claim type codes bound into policy commitments (policy.claim_type_code).
pub global CLAIM_TYPE_THREAT_ELIGIBILITY: u16 = 1;
pub global CLAIM_TYPE_STAKEHOLDER_RISK: u16 = 2;
pub global CLAIM_TYPE_PEER_ENDORSEMENT: u16 = 3;

// Circuit artifact IDs bound into public inputs (matches ArtifactPolicyRegistry).
pub global CIRCUIT_THREAT_ELIGIBILITY_V1: u16 = 1;
pub global CIRCUIT_STAKEHOLDER_RISK_BAND_V1: u16 = 2;
pub global CIRCUIT_PEER_ENDORSEMENT_V1: u16 = 3;
pub global CIRCUIT_EVIDENCE_INCLUSION_V1: u16 = 4;

pub global PROTOCOL_VERSION_V1: u16 = 1;

// DLP decision codes.
pub global DLP_DECISION_PASS: u16 = 1;

// Approval action/decision codes.
pub global APPROVAL_ACTION_DISCLOSURE: u16 = 1;
pub global APPROVAL_DECISION_APPROVE: u16 = 1;

// Risk appetite relation codes: 0 = not disclosed,
// 1 = EAL strictly below appetite threshold, 2 = EAL at or above threshold.
pub global APPETITE_NONE: u16 = 0;
pub global APPETITE_BELOW: u16 = 1;
pub global APPETITE_ABOVE_OR_EQUAL: u16 = 2;

pub fn assert_enum(code: u16, max_code: u16) {
    assert(code >= 1, "enum code must be non-zero (0 is reserved)");
    assert(code <= max_code, "enum code exceeds codebook");
}

// Half-open [lo, hi); asserts lo < hi so empty/overflowing bands are rejected.
pub fn assert_in_band_u64(v: u64, lo: u64, hi: u64) {
    assert(lo < hi, "empty or inverted band");
    assert(v >= lo, "value below band lower bound");
    assert(v < hi, "value at or above band upper bound");
}

pub fn assert_in_band_u16(v: u16, lo: u16, hi: u16) {
    assert(lo < hi, "empty or inverted band");
    assert(v >= lo, "value below band lower bound");
    assert(v < hi, "value at or above band upper bound");
}

// epoch arithmetic: u32 epochs, all comparisons checked before subtraction.
pub fn assert_fresh_epoch(now_epoch: u32, event_epoch: u32, max_age_epochs: u32) {
    assert(event_epoch <= now_epoch, "event epoch is in the future");
    assert(now_epoch - event_epoch <= max_age_epochs, "event epoch is stale");
}

pub fn assert_epoch_order(earlier: u32, later: u32) {
    assert(earlier <= later, "epoch order violated");
}

// observed must cover every bit in required.
pub fn assert_mask_covers(observed: u64, required: u64) {
    assert(observed & required == required, "required mask bits not covered");
}

pub fn assert_zero_mask(mask: u64) {
    assert(mask == 0, "mask must be zero");
}

pub fn assert_grid_aligned(v: u64) {
    assert(v % RISK_BAND_GRID_MINOR == 0, "band bound not on approved grid");
}

pub fn assert_epoch_of_seconds(seconds: u64, epoch: u32) {
    assert(seconds / EPOCH_DURATION_SECONDS == epoch as u64, "seconds do not map to declared epoch");
}

// Deterministic confidence banding, half-open [lo, hi).
pub fn confidence_band_of(bps: u16) -> u16 {
    assert(bps <= 10000, "confidence exceeds 10000 bps");
    let mut band: u16 = 0;
    for i in 0..5 {
        if (bps >= CONFIDENCE_BAND_LO[i]) & (bps < CONFIDENCE_BAND_HI[i]) {
            band = (i as u16) + 1;
        }
    }
    assert(band != 0, "no confidence band matched");
    band
}

pub fn severity_band_of(exact_code: u16) -> u16 {
    assert_enum(exact_code, SEVERITY_MAX_CODE);
    if exact_code <= 2 {
        exact_code
    } else {
        3
    }
}

mod tests {
    use super::{
        assert_enum, assert_fresh_epoch, assert_grid_aligned, assert_in_band_u64,
        assert_mask_covers, confidence_band_of, severity_band_of,
    };

    #[test]
    fn bands() {
        assert(confidence_band_of(0) == 1);
        assert(confidence_band_of(2499) == 1);
        assert(confidence_band_of(2500) == 2);
        assert(confidence_band_of(8000) == 4);
        assert(confidence_band_of(9499) == 4);
        assert(confidence_band_of(9500) == 5);
        assert(confidence_band_of(10000) == 5);
        assert(severity_band_of(1) == 1);
        assert(severity_band_of(2) == 2);
        assert(severity_band_of(3) == 3);
        assert(severity_band_of(4) == 3);
    }

    #[test(should_fail)]
    fn band_upper_inclusive_rejected() {
        assert_in_band_u64(25_000_000_000, 10_000_000_000, 25_000_000_000);
    }

    #[test(should_fail)]
    fn inverted_band_rejected() {
        assert_in_band_u64(5, 10, 5);
    }

    #[test(should_fail)]
    fn stale_epoch_rejected() {
        assert_fresh_epoch(1000, 900, 50);
    }

    #[test(should_fail)]
    fn future_epoch_rejected() {
        assert_fresh_epoch(100, 101, 50);
    }

    #[test]
    fn mask_covers() {
        assert_mask_covers(11, 3);
    }

    #[test(should_fail)]
    fn mask_gap_rejected() {
        assert_mask_covers(9, 3);
    }

    #[test(should_fail)]
    fn enum_zero_rejected() {
        assert_enum(0, 4);
    }

    #[test(should_fail)]
    fn confidence_over_range_rejected() {
        let _ = confidence_band_of(10001);
    }

    #[test]
    fn grid_alignment() {
        assert_grid_aligned(10_000_000_000);
    }

    #[test(should_fail)]
    fn grid_misaligned_rejected() {
        assert_grid_aligned(10_000_000_001);
    }
}
