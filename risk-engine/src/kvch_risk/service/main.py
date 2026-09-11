import uuid
from fastapi import FastAPI, HTTPException
from kvch_risk.schemas.models import (
    OptimizationRequest,
    OptimizationResult,
    QuantifyRequest,
    QuantifyResponse,
    CalibrateRequest,
    CalibrateResponse,
)
from kvch_risk.likelihood.estimator import calculate_likelihood
from kvch_risk.simulation.monte_carlo import run_fair_monte_carlo
from kvch_risk.optimization.portfolio import solve_investment_portfolio

app = FastAPI(
    title="KVCH Risk Quantification Engine API",
    version="0.1.0",
    description="Financial Cyber Risk Quantification, FAIR Monte Carlo Engine, and Investment Optimizer",
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "kvch-risk-engine", "version": "0.1.0"}


@app.post("/api/v1/risk/quantify", response_model=QuantifyResponse)
def quantify_risk(request: QuantifyRequest):
    """
    Quantifies monetary risk for a given security finding and asset profile.
    Calculates calibrated likelihood and runs FAIR Monte Carlo loss simulation.
    """
    try:
        likelihood = calculate_likelihood(request.finding)
        loss = run_fair_monte_carlo(
            likelihood=likelihood,
            asset=request.asset_profile,
            draws=request.simulation_draws,
            seed=request.seed,
        )
        calc_id = f"CALC-{uuid.uuid4().hex[:8].upper()}"

        return QuantifyResponse(
            scenario_id=request.scenario_id,
            title=request.title,
            likelihood=likelihood,
            baseline_loss=loss,
            data_quality_grade="A",
            calculation_id=calc_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/risk/optimize", response_model=OptimizationResult)
def optimize_mitigation_portfolio(request: OptimizationRequest):
    """
    Solves 0-1 Knapsack MILP to maximize risk reduction under a budget limit.
    """
    try:
        result = solve_investment_portfolio(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/risk/calibrate", response_model=CalibrateResponse)
def calibrate_with_incidents(request: CalibrateRequest):
    """
    Ingests real historical incident log entries to update Bayesian posterior priors.
    """
    try:
        from kvch_risk.calibration.bayesian import update_asset_posterior
        updated_asset = update_asset_posterior(request.asset_profile, request.incidents)
        return CalibrateResponse(
            calibrated_asset_profile=updated_asset,
            incidents_processed=len(request.incidents),
            calibration_status="BAYESIAN_POSTERIOR_UPDATED",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
