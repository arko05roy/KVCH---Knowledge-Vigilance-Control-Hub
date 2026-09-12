// fixture_gen: emits fully-consistent circuit inputs for Prover.toml/input.json
// generation. Private witnesses are supplied via Prover.toml (plain scalars;
// claim_draft_commitment slots may be 0 — they are patched in-circuit by the
// two-pass draft computation). Returns the final public structs.
use endorsement_lib::{EndorsementPrivate, EndorsementPublic, compute_publics as endorse_publics};
use inclusion_lib::{InclusionPrivate, InclusionPublic, compute_publics as incl_publics};
use risk_lib::{RiskPrivate, RiskPublic, compute_publics as risk_publics, publics_vector as risk_vec};
use threat_lib::{ThreatPrivate, ThreatPublic, compute_publics as threat_publics, publics_vector as threat_vec};

fn threat_draft(p: ThreatPublic) -> Field {
    let v = threat_vec(p);
    let mut d: [Field; 19] = [0; 19];
    for i in 0..19 {
        d[i] = v[i];
    }
    kvch_commitments::claim_draft_commitment(d)
}

fn risk_draft(p: RiskPublic) -> Field {
    let v = risk_vec(p);
    let mut d: [Field; 21] = [0; 21];
    for i in 0..21 {
        d[i] = v[i];
    }
    kvch_commitments::claim_draft_commitment(d)
}

struct FixturePublics {
    threat: ThreatPublic,
    risk: RiskPublic,
    endorsement: EndorsementPublic,
    inclusion: InclusionPublic,
    threat_draft: Field,
    risk_draft: Field,
    endorsement_assess_payload: Field,
}

fn main(
    threat_public: ThreatPublic,
    mut threat_private: ThreatPrivate,
    risk_public: RiskPublic,
    mut risk_private: RiskPrivate,
    endorsement_public: EndorsementPublic,
    mut endorsement_private: EndorsementPrivate,
    inclusion_public: InclusionPublic,
    inclusion_private: InclusionPrivate,
) -> pub FixturePublics {
    // Two-pass draft binding, performed in-circuit: pass 1 derives the draft
    // commitment from publics+witness, pass 2 patches the manifests and emits
    // the final public structs.
    let td = threat_draft(threat_publics(threat_public, threat_private));
    threat_private.approval.claim_draft_commitment = td;
    threat_private.dlp.claim_draft_commitment = td;

    let rd = risk_draft(risk_publics(risk_public, risk_private));
    risk_private.approval.claim_draft_commitment = rd;
    risk_private.dlp.claim_draft_commitment = rd;

    // The endorsement evidence leaf carries the local assessment commitment
    // as its payload (snapshot-scoped variant, ev_c slot = 0).
    let ep = endorsement_private;
    let assess_payload = kvch_commitments::local_assessment_commitment(
        endorsement_public.endorser_company_code,
        endorsement_public.target_claim_id,
        ep.match_score_bps_exact,
        kvch_policy::match_class_of(ep.match_score_bps_exact),
        0,
        ep.assessed_epoch,
        ep.assessment_nonce,
    );
    endorsement_private.local_evidence_opening.leaf.payload_commitment = assess_payload;

    FixturePublics {
        threat: threat_publics(threat_public, threat_private),
        risk: risk_publics(risk_public, risk_private),
        endorsement: endorse_publics(endorsement_public, endorsement_private),
        inclusion: incl_publics(inclusion_public, inclusion_private),
        threat_draft: td,
        risk_draft: rd,
        endorsement_assess_payload: assess_payload,
    }
}
