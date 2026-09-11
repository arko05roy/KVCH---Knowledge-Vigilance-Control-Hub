import pytest
import json
from pathlib import Path

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


def test_likelihood_estimation():
    fixture = get_payment_fixture()
    finding = FindingIntake(**fixture["finding"])
    likelihood = calculate_likelihood(finding)

    assert likelihood.annual_threat_frequency > 0
    assert 0.0 <= likelihood.vulnerability_susceptibility <= 1.0
    assert 0.0 <= likelihood.exploitation_probability <= 1.0
    assert likelihood.calibrated_confidence >= 0.8  # CISA KEV active


def test_fair_monte_carlo_simulation():
    fixture = get_payment_fixture()
    finding = FindingIntake(**fixture["finding"])
    asset = AssetServiceProfile(**fixture["asset_profile"])

    likelihood = calculate_likelihood(finding)
    loss = run_fair_monte_carlo(likelihood, asset, draws=1000, seed=42)

    assert loss.expected_annual_loss_inr > 0
    assert loss.var95_inr >= loss.p50_loss_inr
    assert loss.cvar95_inr >= loss.var95_inr


def test_investment_optimizer():
    fixture = get_payment_fixture()
    actions = [MitigationCandidate(**act) for act in fixture["candidate_mitigations"]]

    req = OptimizationRequest(
        scenario_id="SCENARIO-PAYMENT-001",
        baseline_eal_inr=5000000.0,
        budget_limit_inr=1000000.0,  # ₹10 Lakh budget
        candidate_mitigations=actions,
    )

    opt = solve_investment_portfolio(req)

    assert opt.total_spend_inr <= 1000000.0
    assert len(opt.selected_actions) > 0
    assert opt.expected_eal_reduction_inr > 0
    assert opt.residual_eal_inr < 5000000.0
    assert len(opt.efficient_frontier) == 5
