import unittest
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1] / "src"))

from kvch_risk.schemas.models import (
    FindingIntake,
    AssetServiceProfile,
    QuantifyRequest,
    OptimizationRequest,
    MitigationCandidate,
)
from kvch_risk.likelihood.estimator import calculate_likelihood
from kvch_risk.simulation.monte_carlo import run_fair_monte_carlo
from kvch_risk.optimization.portfolio import solve_investment_portfolio


def get_payment_fixture():
    fixture_path = (
        Path(__file__).parents[2]
        / "data-contracts"
        / "fixtures"
        / "payment_service_scenario.json"
    )
    with open(fixture_path, "r", encoding="utf-8") as f:
        return json.load(f)


class TestRiskEngine(unittest.TestCase):
    def test_likelihood_estimation(self):
        fixture = get_payment_fixture()
        finding = FindingIntake(**fixture["finding"])
        likelihood = calculate_likelihood(finding)

        self.assertGreater(likelihood.annual_threat_frequency, 0)
        self.assertTrue(0.0 <= likelihood.vulnerability_susceptibility <= 1.0)
        self.assertTrue(0.0 <= likelihood.exploitation_probability <= 1.0)
        self.assertGreaterEqual(likelihood.calibrated_confidence, 0.8)  # CISA KEV active

    def test_fair_monte_carlo_simulation(self):
        fixture = get_payment_fixture()
        finding = FindingIntake(**fixture["finding"])
        asset = AssetServiceProfile(**fixture["asset_profile"])

        likelihood = calculate_likelihood(finding)
        loss = run_fair_monte_carlo(likelihood, asset, draws=1000, seed=42)

        self.assertGreater(loss.expected_annual_loss_inr, 0)
        self.assertGreaterEqual(loss.var95_inr, loss.p50_loss_inr)
        self.assertGreaterEqual(loss.cvar95_inr, loss.var95_inr)

    def test_investment_optimizer(self):
        fixture = get_payment_fixture()
        actions = [MitigationCandidate(**act) for act in fixture["candidate_mitigations"]]

        req = OptimizationRequest(
            scenario_id="SCENARIO-PAYMENT-001",
            baseline_eal_inr=5000000.0,
            budget_limit_inr=1000000.0,  # ₹10 Lakh budget
            candidate_mitigations=actions,
        )

        opt = solve_investment_portfolio(req)

        self.assertLessEqual(opt.total_spend_inr, 1000000.0)
        self.assertGreater(len(opt.selected_actions), 0)
        self.assertGreater(opt.expected_eal_reduction_inr, 0)
        self.assertLess(opt.residual_eal_inr, 5000000.0)
        self.assertEqual(len(opt.efficient_frontier), 5)

    def test_bayesian_calibration(self):
        from kvch_risk.schemas.models import IncidentRecord
        from kvch_risk.calibration.bayesian import update_asset_posterior

        fixture = get_payment_fixture()
        asset = AssetServiceProfile(**fixture["asset_profile"])
        initial_rto = asset.rto_hours

        real_incidents = [
            IncidentRecord(
                incident_id="INC-2026-001",
                scenario_id="SCENARIO-PAYMENT-001",
                asset_id=asset.asset_id,
                occurred_at="2026-08-15T10:00:00Z",
                actual_downtime_hours=6.5,
                actual_ir_cost_inr=3500000.0,
                actual_records_exposed=75000,
            )
        ]

        calibrated_asset = update_asset_posterior(asset, real_incidents)
        self.assertGreater(calibrated_asset.rto_hours, initial_rto)
        self.assertGreater(calibrated_asset.records_exposed_estimate, 50000)


