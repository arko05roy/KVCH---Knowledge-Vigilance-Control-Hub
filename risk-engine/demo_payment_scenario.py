import json
import sys
from pathlib import Path
from kvch_risk.schemas.models import (
    FindingIntake,
    AssetServiceProfile,
    MitigationCandidate,
    OptimizationRequest,
)
from kvch_risk.likelihood.estimator import calculate_likelihood
from kvch_risk.simulation.monte_carlo import run_fair_monte_carlo
from kvch_risk.optimization.portfolio import solve_investment_portfolio


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print("=" * 80)
    print("  KVCH FINANCIAL CYBER RISK INTELLIGENCE — PAYMENT SERVICE TRACER BULLET  ")
    print("=" * 80)

    # 1. Load Fixture Payload
    fixture_path = (
        Path(__file__).parent / "data-contracts" / "fixtures" / "payment_service_scenario.json"
    )
    if not fixture_path.exists():
        fixture_path = (
            Path(__file__).parents[1] / "data-contracts" / "fixtures" / "payment_service_scenario.json"
        )

    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    finding = FindingIntake(**data["finding"])
    asset = AssetServiceProfile(**data["asset_profile"])
    candidates = [MitigationCandidate(**c) for c in data["candidate_mitigations"]]

    print(f"\n[+] Scenario: {data['title']}")
    print(f"    Target Asset: {asset.asset_name} ({asset.asset_id})")
    print(f"    Business Service: {asset.business_service_name} ({asset.business_service_id})")
    print(f"    Finding: {finding.cve_id} in package '{finding.package_name}' (CVSS: {finding.cvss_score}, EPSS: {finding.epss_score})")

    # 2. Estimate Likelihood
    print("\n" + "-" * 80)
    print("  1. CALIBRATED LIKELIHOOD ESTIMATION  ")
    print("-" * 80)
    lh = calculate_likelihood(finding)
    print(f"  • Annual Threat Frequency:        {lh.annual_threat_frequency:.2f} attempts/yr")
    print(f"  • Vulnerability Susceptibility:   {lh.vulnerability_susceptibility * 100:.1f}%")
    print(f"  • Exploitation Probability:       {lh.exploitation_probability * 100:.2f}% per year")
    print(f"  • Calibrated Confidence Grade:    {lh.calibrated_confidence * 100:.0f}%")
    print("  • Primary Risk Drivers:")
    for d in lh.primary_drivers:
        print(f"    - {d}")

    # 3. FAIR Monte Carlo Loss Engine
    print("\n" + "-" * 80)
    print("  2. PROBABILISTIC LOSS SIMULATION (10,000 MONTE CARLO DRAWS)  ")
    print("-" * 80)
    loss = run_fair_monte_carlo(lh, asset, draws=10000, seed=42)
    print(f"  • Expected Annual Loss (EAL):     ₹{loss.expected_annual_loss_inr:,.2f}")
    print(f"  • Median Annual Loss (P50):        ₹{loss.p50_loss_inr:,.2f}")
    print(f"  • 90th Percentile Loss (P90):      ₹{loss.p90_loss_inr:,.2f}")
    print(f"  • Value at Risk (VaR 95%):         ₹{loss.var95_inr:,.2f}")
    print(f"  • Conditional VaR (CVaR 95%):      ₹{loss.cvar95_inr:,.2f}")

    # 4. Investment Portfolio Optimization
    print("\n" + "-" * 80)
    print("  3. INVESTMENT OPTIMIZATION ENGINE (₹1 CRORE BUDGET LIMIT)  ")
    print("-" * 80)
    opt_req = OptimizationRequest(
        scenario_id=data["scenario_id"],
        baseline_eal_inr=loss.expected_annual_loss_inr,
        budget_limit_inr=10000000.0,  # ₹1 Crore
        candidate_mitigations=candidates,
    )
    opt_res = solve_investment_portfolio(opt_req)

    print(f"  • Target Budget:                   ₹{opt_res.budget_limit_inr:,.2f}")
    print(f"  • Selected Portfolio Spend:        ₹{opt_res.total_spend_inr:,.2f}")
    print(f"  • Expected Risk Reduction (ΔEAL): ₹{opt_res.expected_eal_reduction_inr:,.2f}")
    print(f"  • Residual Expected Annual Loss:   ₹{opt_res.residual_eal_inr:,.2f}")
    print(f"  • Return on Security Investment:   {opt_res.ros_index:.2f}x ROSI")

    print("\n  • Selected Optimal Actions:")
    for act in opt_res.selected_actions:
        print(f"    [✓] {act.action_id} — {act.name}")
        print(f"        Cost: ₹{act.cost_inr:,.2f} | Lead Time: {act.lead_time_days} days | Risk Reduction: -{act.risk_reduction_factor * 100:.0f}%")

    print("\n  • Efficient Frontier Curve:")
    for opt in opt_res.efficient_frontier:
        print(f"    - Spend: ₹{opt.total_spend_inr:10,.2f} | Risk Reduced: ₹{opt.expected_eal_reduction_inr:10,.2f} | Residual EAL: ₹{opt.residual_eal_inr:10,.2f} | ROSI: {opt.ros_index:.2f}x")

    print("\n" + "=" * 80)
    print("  [SUCCESS] VERIFIED FULL CHAIN FROM TECHNICAL FINDING TO RUPEE LOSS & OPTIMIZED SPEND  ")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
