import math
from typing import List
from kvch_risk.schemas.models import FindingIntake, LikelihoodResult


def calculate_likelihood(finding: FindingIntake) -> LikelihoodResult:
    """
    Calibrated exploitation likelihood estimation combining EPSS, CISA KEV,
    exposure, and compensating controls.
    """
    drivers: List[str] = []

    # Base prior from FIRST EPSS or CVSS fallback
    epss = finding.epss_score if finding.epss_score > 0 else (finding.cvss_score / 10.0) * 0.1
    base_freq = 1.0 + (epss * 5.0)  # Estimated annual threat attempts (1 to 6 per year)
    drivers.append(f"EPSS score prior: {finding.epss_score:.2f}")

    # CISA KEV boost
    kev_multiplier = 2.5 if finding.cisa_kev else 1.0
    if finding.cisa_kev:
        drivers.append("CISA KEV listed active exploitation (+150% frequency)")

    # Susceptibility modifiers
    exposure_mult = 1.0 if finding.internet_reachable else 0.25
    if not finding.internet_reachable:
        drivers.append("Internal/restricted reachability (-75% exposure)")

    auth_mult = 0.5 if finding.authentication_required else 1.0
    if finding.authentication_required:
        drivers.append("Authentication barrier required (-50% exposure)")

    # Compensating controls reduction
    control_discount = max(0.2, 1.0 - (0.25 * len(finding.compensating_controls)))
    if finding.compensating_controls:
        drivers.append(f"Compensating controls active: {', '.join(finding.compensating_controls)}")

    susceptibility = math.pow(finding.cvss_score / 10.0, 1.5) * exposure_mult * auth_mult * control_discount
    susceptibility = max(0.01, min(0.99, susceptibility))

    threat_freq = base_freq * kev_multiplier
    exploitation_prob = 1.0 - math.exp(-threat_freq * susceptibility)
    calibrated_confidence = 0.90 if finding.cisa_kev else (0.80 if finding.epss_score > 0.1 else 0.65)

    return LikelihoodResult(
        annual_threat_frequency=round(threat_freq, 3),
        vulnerability_susceptibility=round(susceptibility, 3),
        exploitation_probability=round(exploitation_prob, 4),
        calibrated_confidence=calibrated_confidence,
        primary_drivers=drivers,
    )
