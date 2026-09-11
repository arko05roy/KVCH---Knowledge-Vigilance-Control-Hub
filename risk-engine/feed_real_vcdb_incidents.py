import json
import sys
from pathlib import Path
from kvch_risk.schemas.models import (
    FindingIntake,
    AssetServiceProfile,
    IncidentRecord,
)
from kvch_risk.likelihood.estimator import calculate_likelihood
from kvch_risk.simulation.monte_carlo import run_fair_monte_carlo
from kvch_risk.calibration.bayesian import update_asset_posterior


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    print("=" * 80)
    print("  KVCH BAYESIAN CALIBRATION — FEEDING REAL VCDB INCIDENT DATASET  ")
    print("=" * 80)

    # 1. Load Payment Scenario & VCDB Real Incidents
    base_dir = Path(__file__).parents[1] / "data-contracts" / "fixtures"
    if not base_dir.exists():
        base_dir = Path(__file__).parent / "data-contracts" / "fixtures"

    with open(base_dir / "payment_service_scenario.json", "r", encoding="utf-8") as f:
        scenario = json.load(f)

    with open(base_dir / "vcdb_real_incidents.json", "r", encoding="utf-8") as f:
        incidents_raw = json.load(f)

    finding = FindingIntake(**scenario["finding"])
    asset = AssetServiceProfile(**scenario["asset_profile"])
    incidents = [IncidentRecord(**inc) for inc in incidents_raw if inc["scenario_id"] == scenario["scenario_id"]]

    print(f"\n[+] Baseline Asset Profile: {asset.asset_name} ({asset.asset_id})")
    print(f"    Prior RTO Target: {asset.rto_hours} Hours")
    print(f"    Prior Avg Response Cost: ₹{asset.avg_incident_response_cost_inr:,.2f}")
    print(f"    Prior Records Exposure Estimate: {asset.records_exposed_estimate:,} records")

    # 2. Run Baseline Monte Carlo Before Calibration
    lh = calculate_likelihood(finding)
    baseline_loss = run_fair_monte_carlo(lh, asset, draws=10000, seed=42)

    print("\n" + "-" * 80)
    print("  1. BEFORE CALIBRATION (THEORETICAL PRIOR DISTRIBUTIONS)  ")
    print("-" * 80)
    print(f"  • Expected Annual Loss (EAL): ₹{baseline_loss.expected_annual_loss_inr:,.2f}")
    print(f"  • Value at Risk (VaR 95%):    ₹{baseline_loss.var95_inr:,.2f}")

    # 3. Feed Real VCDB Incidents & Update Bayesian Posteriors
    print("\n" + "-" * 80)
    print(f"  2. INGESTING {len(incidents)} REAL VCDB INCIDENT LOGS  ")
    print("-" * 80)
    for idx, inc in enumerate(incidents, 1):
        print(f"  [Incident #{idx}] {inc.incident_id} — {inc.root_cause_summary}")
        print(f"               Actual Downtime: {inc.actual_downtime_hours} hrs | Response Cost: ₹{inc.actual_ir_cost_inr:,.2f} | Exposed Recs: {inc.actual_records_exposed:,}")

    calibrated_asset = update_asset_posterior(asset, incidents)

    print("\n  [✓] BAYESIAN POSTERIOR UPDATED:")
    print(f"      • Calibrated RTO:             {calibrated_asset.rto_hours} Hours (up from {scenario['asset_profile']['rto_hours']} hrs)")
    print(f"      • Calibrated IR Cost:         ₹{calibrated_asset.avg_incident_response_cost_inr:,.2f}")
    print(f"      • Calibrated Records Est:     {calibrated_asset.records_exposed_estimate:,} records")

    # 4. Run Post-Calibration Monte Carlo
    calibrated_loss = run_fair_monte_carlo(lh, calibrated_asset, draws=10000, seed=42)

    print("\n" + "-" * 80)
    print("  3. AFTER BAYESIAN CALIBRATION (CALIBRATED POSTERIOR DISTRIBUTIONS)  ")
    print("-" * 80)
    print(f"  • Calibrated EAL:             ₹{calibrated_loss.expected_annual_loss_inr:,.2f}")
    print(f"  • Calibrated VaR 95%:         ₹{calibrated_loss.var95_inr:,.2f}")
    print(f"  • Downtime Loss Share:        ₹{calibrated_loss.expected_downtime_loss_inr:,.2f}")
    print(f"  • Forensics & Response Share: ₹{calibrated_loss.expected_incident_response_loss_inr:,.2f}")
    print(f"  • Data Breach Loss Share:     ₹{calibrated_loss.expected_breach_loss_inr:,.2f}")

    diff_eal = calibrated_loss.expected_annual_loss_inr - baseline_loss.expected_annual_loss_inr
    print(f"\n  [+] Calibration Delta: EAL shifted by +₹{diff_eal:,.2f} based on real empirical VCDB incident severity.")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
