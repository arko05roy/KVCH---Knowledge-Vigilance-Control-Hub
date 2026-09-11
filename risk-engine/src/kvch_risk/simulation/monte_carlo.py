import numpy as np
from typing import Optional
from kvch_risk.schemas.models import (
    AssetServiceProfile,
    LikelihoodResult,
    LossDistributionResult,
)


def run_fair_monte_carlo(
    likelihood: LikelihoodResult,
    asset: AssetServiceProfile,
    draws: int = 10000,
    seed: Optional[int] = 42,
) -> LossDistributionResult:
    """
    FAIR-aligned Monte Carlo Loss Engine with granular component breakdown and SLA penalty modeling.
    Simulates annual frequency & severity distributions over `draws` iterations.
    """
    if seed is not None:
        np.random.seed(seed)

    # 1. Event Frequency Draws (Bernoulli draw parameterized by annual exploitation probability)
    prob_event = likelihood.exploitation_probability
    event_occurred = np.random.binomial(n=1, p=prob_event, size=draws)

    # 2. Downtime Duration (Lognormal centered around RTO hours, std 0.4)
    rto_mean = max(0.5, asset.rto_hours)
    downtime_hours_draws = np.random.lognormal(
        mean=np.log(rto_mean), sigma=0.4, size=draws
    )
    downtime_losses = downtime_hours_draws * asset.downtime_cost_per_hour_inr

    # 3. Incident Response & Forensics (Triangular: min 50%, mode 100%, max 250% of profile avg)
    base_ir = asset.avg_incident_response_cost_inr
    ir_losses = np.random.triangular(
        left=base_ir * 0.5, mode=base_ir, right=base_ir * 2.5, size=draws
    )

    # 4. Data Breach Cost (Binomial records x LogNormal unit cost)
    if asset.records_exposed_estimate > 0 and asset.data_breach_cost_per_record_inr > 0:
        records_draws = np.random.binomial(
            n=asset.records_exposed_estimate, p=0.35, size=draws
        )
        cost_per_record = np.random.normal(
            loc=asset.data_breach_cost_per_record_inr, scale=50.0, size=draws
        )
        cost_per_record = np.maximum(50.0, cost_per_record)
        breach_losses = records_draws * cost_per_record
    else:
        breach_losses = np.zeros(draws)

    # 5. SLA Contractual Penalty Step Function based on downtime duration
    sla_losses = np.zeros(draws)
    sla_tier1 = downtime_hours_draws > 2.0
    sla_tier2 = downtime_hours_draws > 4.0
    sla_losses[sla_tier1] += 500000.0   # ₹5 Lakh penalty for > 2 hr downtime
    sla_losses[sla_tier2] += 1500000.0  # Additional ₹15 Lakh penalty for > 4 hr downtime

    # Apply event occurrence mask
    downtime_losses_realized = event_occurred * downtime_losses
    ir_losses_realized = event_occurred * ir_losses
    breach_losses_realized = event_occurred * breach_losses
    sla_losses_realized = event_occurred * sla_losses

    # Total Annual Loss per draw
    total_annual_losses = (
        downtime_losses_realized
        + ir_losses_realized
        + breach_losses_realized
        + sla_losses_realized
    )

    # Compute Aggregate Loss Metrics
    eal = float(np.mean(total_annual_losses))
    p50 = float(np.percentile(total_annual_losses, 50))
    p90 = float(np.percentile(total_annual_losses, 90))
    var95 = float(np.percentile(total_annual_losses, 95))

    # Conditional VaR (Expected Shortfall above 95th percentile)
    tail_losses = total_annual_losses[total_annual_losses >= var95]
    cvar95 = float(np.mean(tail_losses)) if len(tail_losses) > 0 else var95

    # Compute Sub-component Expected Loss Values
    exp_downtime = float(np.mean(downtime_losses_realized))
    exp_ir = float(np.mean(ir_losses_realized))
    exp_breach = float(np.mean(breach_losses_realized))
    exp_sla = float(np.mean(sla_losses_realized))

    return LossDistributionResult(
        expected_annual_loss_inr=round(eal, 2),
        p50_loss_inr=round(p50, 2),
        p90_loss_inr=round(p90, 2),
        var95_inr=round(var95, 2),
        cvar95_inr=round(cvar95, 2),
        min_loss_inr=round(float(np.min(total_annual_losses)), 2),
        max_loss_inr=round(float(np.max(total_annual_losses)), 2),
        expected_downtime_loss_inr=round(exp_downtime, 2),
        expected_incident_response_loss_inr=round(exp_ir, 2),
        expected_breach_loss_inr=round(exp_breach, 2),
        expected_sla_penalty_loss_inr=round(exp_sla, 2),
        simulation_draws=draws,
        currency="INR",
    )
