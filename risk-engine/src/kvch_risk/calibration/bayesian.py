import numpy as np
from typing import List, Dict, Any
from kvch_risk.schemas.models import AssetServiceProfile, IncidentRecord


def update_asset_posterior(
    asset: AssetServiceProfile, incidents: List[IncidentRecord]
) -> AssetServiceProfile:
    """
    Bayesian Conjugate Updating for Asset Financial Parameters.
    Updates LogNormal downtime priors & IR cost priors based on observed real incident logs.
    """
    if not incidents:
        return asset

    # 1. Update Downtime Cost / RTO Prior
    observed_downtimes = [inc.actual_downtime_hours for inc in incidents if inc.actual_downtime_hours > 0]
    if observed_downtimes:
        prior_rto = asset.rto_hours
        observed_mean_rto = float(np.mean(observed_downtimes))
        # Bayesian weighted update (weight 0.4 prior, 0.6 evidence)
        calibrated_rto = round(0.4 * prior_rto + 0.6 * observed_mean_rto, 2)
        asset.rto_hours = max(0.5, calibrated_rto)

    # 2. Update Incident Response Cost Prior
    observed_ir = [inc.actual_ir_cost_inr for inc in incidents if inc.actual_ir_cost_inr > 0]
    if observed_ir:
        prior_ir = asset.avg_incident_response_cost_inr
        observed_mean_ir = float(np.mean(observed_ir))
        calibrated_ir = round(0.3 * prior_ir + 0.7 * observed_mean_ir, 2)
        asset.avg_incident_response_cost_inr = calibrated_ir

    # 3. Update Records Exposed Expectation
    observed_records = [inc.actual_records_exposed for inc in incidents if inc.actual_records_exposed > 0]
    if observed_records:
        prior_recs = asset.records_exposed_estimate
        observed_mean_recs = int(np.mean(observed_records))
        asset.records_exposed_estimate = int(0.3 * prior_recs + 0.7 * observed_mean_recs)

    return asset
