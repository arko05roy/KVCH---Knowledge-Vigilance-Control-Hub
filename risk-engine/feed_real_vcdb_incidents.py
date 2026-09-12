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

    print("=" * 85)
    print("      KVCH BAYESIAN CALIBRATION ENGINE — MULTI-SCENARIO VCDB DATASET REPLAY      ")
    print("=" * 85)

    base_dir = Path(__file__).parents[1] / "data-contracts" / "fixtures"
    if not base_dir.exists():
        base_dir = Path(__file__).parent / "data-contracts" / "fixtures"

    vcdb_file = base_dir / "vcdb_real_incidents.json"
    if not vcdb_file.exists():
        print("[-] VCDB fixtures not found.")
        return

    with open(vcdb_file, "r", encoding="utf-8") as f:
        incidents_raw = json.load(f)

    scenario_files = list(base_dir.glob("*scenario*.json"))

    print(f"\n[+] Loaded {len(incidents_raw)} Real VCDB Incident Records across {len(scenario_files)} Enterprise Scenarios.\n")

    for s_file in scenario_files:
        with open(s_file, "r", encoding="utf-8") as f:
            scenario = json.load(f)

        s_id = scenario.get("scenario_id", "UNKNOWN")
        s_title = scenario.get("title", s_file.stem)
        finding = FindingIntake(**scenario["finding"])
        asset = AssetServiceProfile(**scenario["asset_profile"])

        matching_incidents = [
            IncidentRecord(**inc) for inc in incidents_raw if inc.get("scenario_id") == s_id
        ]

        print("=" * 85)
        print(f"  SCENARIO: {s_title} ({s_id})")
        print(f"  Asset: {asset.asset_name} | Prior RTO: {asset.rto_hours}h | Prior IR: ₹{asset.avg_incident_response_cost_inr:,.0f}")
        print("-" * 85)

        # Baseline Monte Carlo
        lh = calculate_likelihood(finding)
        base_loss = run_fair_monte_carlo(lh, asset, draws=10000, seed=42)
        print(f"  [1] PRE-CALIBRATION BASELINE:")
        print(f"      • Annual Exploitation Prob: {lh.exploitation_probability * 100:.1f}%")
        print(f"      • Expected Annual Loss (EAL): ₹{base_loss.expected_annual_loss_inr:,.2f}")
        print(f"      • Value at Risk (VaR 95%):    ₹{base_loss.var95_inr:,.2f}")

        if matching_incidents:
            print(f"\n  [2] INGESTING {len(matching_incidents)} REAL VCDB INCIDENT LOGS:")
            for inc in matching_incidents:
                print(f"      - [{inc.incident_id}] Downtime: {inc.actual_downtime_hours}h | IR Cost: ₹{inc.actual_ir_cost_inr:,.0f} | Recs: {inc.actual_records_exposed:,}")
                print(f"        Summary: {inc.root_cause_summary}")

            calibrated_asset = update_asset_posterior(asset.model_copy(), matching_incidents)
            calib_loss = run_fair_monte_carlo(lh, calibrated_asset, draws=10000, seed=42)

            diff_eal = calib_loss.expected_annual_loss_inr - base_loss.expected_annual_loss_inr
            print(f"\n  [3] POST-BAYESIAN CALIBRATION POSTERIOR:")
            print(f"      • Calibrated RTO:             {calibrated_asset.rto_hours} hrs (Prior: {scenario['asset_profile']['rto_hours']} hrs)")
            print(f"      • Calibrated Avg IR Cost:     ₹{calibrated_asset.avg_incident_response_cost_inr:,.2f}")
            print(f"      • Calibrated EAL:             ₹{calib_loss.expected_annual_loss_inr:,.2f} ({'+' if diff_eal >= 0 else ''}₹{diff_eal:,.2f})")
            print(f"      • Calibrated VaR 95%:         ₹{calib_loss.var95_inr:,.2f}")
        else:
            print("  [!] No empirical VCDB logs mapped for this scenario yet. Retaining prior.")

        print("\n")

    print("=" * 85)
    print("  [✓] Multi-Scenario Bayesian Calibration Replay Completed Successfully.")
    print("=" * 85 + "\n")


if __name__ == "__main__":
    main()
