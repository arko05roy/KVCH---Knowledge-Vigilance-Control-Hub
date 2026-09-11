import numpy as np
from scipy.optimize import linprog
from typing import List
from kvch_risk.schemas.models import (
    MitigationCandidate,
    OptimizationRequest,
    OptimizationResult,
    PortfolioOption,
)


def solve_investment_portfolio(request: OptimizationRequest) -> OptimizationResult:
    """
    Constrained Investment Optimizer using 0-1 Knapsack MILP formulation.
    Maximizes Total Risk Reduction (EAL Reduction) subject to spend <= budget_limit_inr.
    """
    candidates = request.candidate_mitigations
    if not candidates:
        return OptimizationResult(
            scenario_id=request.scenario_id,
            budget_limit_inr=request.budget_limit_inr,
            selected_actions=[],
            total_spend_inr=0.0,
            expected_eal_reduction_inr=0.0,
            residual_eal_inr=request.baseline_eal_inr,
            ros_index=0.0,
            efficient_frontier=[],
        )

    num_candidates = len(candidates)
    costs = np.array([c.cost_inr for c in candidates])
    
    # Calculate EAL reduction per action (compounding reduction approximation for individual actions)
    eal_reductions = np.array([request.baseline_eal_inr * c.risk_reduction_factor for c in candidates])

    # Objective: Minimize (-1 * total_eal_reduction)
    c_obj = -eal_reductions

    # Constraint matrix A_ub @ x <= b_ub: total cost <= budget
    A_ub = [costs]
    b_ub = [request.budget_limit_inr]

    # Binary constraints x_i in {0, 1}
    integrality = np.ones(num_candidates)

    res = linprog(
        c=c_obj,
        A_ub=A_ub,
        b_ub=b_ub,
        bounds=(0, 1),
        integrality=integrality,
        method="highs",
    )

    selected_indices = []
    if res.success:
        selected_indices = [i for i, val in enumerate(res.x) if val > 0.5]

    selected_actions: List[MitigationCandidate] = []
    total_spend = 0.0
    combined_residual_multiplier = 1.0

    for idx in selected_indices:
        act = candidates[idx].model_copy()
        act.selected = True
        selected_actions.append(act)
        total_spend += act.cost_inr
        combined_residual_multiplier *= (1.0 - act.risk_reduction_factor)

    residual_eal = request.baseline_eal_inr * combined_residual_multiplier
    expected_eal_reduction = request.baseline_eal_inr - residual_eal

    ros_index = (expected_eal_reduction - total_spend) / total_spend if total_spend > 0 else 0.0

    # Build Efficient Frontier across budget steps (e.g. 10%, 25%, 50%, 75%, 100% of budget)
    frontier: List[PortfolioOption] = []
    budget_steps = [request.budget_limit_inr * frac for frac in [0.1, 0.25, 0.5, 0.75, 1.0]]

    for step_budget in budget_steps:
        step_res = linprog(
            c=c_obj,
            A_ub=[costs],
            b_ub=[step_budget],
            bounds=(0, 1),
            integrality=integrality,
            method="highs",
        )
        if step_res.success:
            step_indices = [i for i, val in enumerate(step_res.x) if val > 0.5]
            step_actions = [candidates[i] for i in step_indices]
            step_spend = sum(a.cost_inr for a in step_actions)
            step_mult = 1.0
            for a in step_actions:
                step_mult *= (1.0 - a.risk_reduction_factor)
            step_res_eal = request.baseline_eal_inr * step_mult
            step_eal_red = request.baseline_eal_inr - step_res_eal
            step_ros = (step_eal_red - step_spend) / step_spend if step_spend > 0 else 0.0

            frontier.append(
                PortfolioOption(
                    actions=step_actions,
                    total_spend_inr=round(step_spend, 2),
                    expected_eal_reduction_inr=round(step_eal_red, 2),
                    residual_eal_inr=round(step_res_eal, 2),
                    ros_index=round(step_ros, 2),
                )
            )

    return OptimizationResult(
        scenario_id=request.scenario_id,
        budget_limit_inr=request.budget_limit_inr,
        selected_actions=selected_actions,
        total_spend_inr=round(total_spend, 2),
        expected_eal_reduction_inr=round(expected_eal_reduction, 2),
        residual_eal_inr=round(residual_eal, 2),
        ros_index=round(ros_index, 2),
        efficient_frontier=frontier,
    )
