from typing import List, Optional
from pydantic import BaseModel, Field


class FindingIntake(BaseModel):
    finding_id: str
    source_extension: str
    category: str
    cve_id: Optional[str] = None
    package_name: Optional[str] = None
    asset_id: str
    observed_at: str
    internet_reachable: bool = True
    authentication_required: bool = False
    compensating_controls: List[str] = Field(default_factory=list)
    epss_score: float = Field(default=0.01, ge=0.0, le=1.0)
    cisa_kev: bool = False
    cvss_score: float = Field(default=5.0, ge=0.0, le=10.0)


class AssetServiceProfile(BaseModel):
    asset_id: str
    asset_name: str
    business_service_id: str
    business_service_name: str
    environment: str = "production"
    downtime_cost_per_hour_inr: float = Field(default=100000.0, ge=0.0)
    avg_incident_response_cost_inr: float = Field(default=500000.0, ge=0.0)
    data_breach_cost_per_record_inr: float = Field(default=350.0, ge=0.0)
    records_exposed_estimate: int = Field(default=10000, ge=0)
    rto_hours: float = Field(default=4.0, ge=0.0)
    active_users: int = Field(default=10000, ge=0)


class MitigationCandidate(BaseModel):
    action_id: str
    name: str
    cost_inr: float = Field(..., ge=0.0)
    lead_time_days: float = Field(default=1.0, ge=0.0)
    risk_reduction_factor: float = Field(..., ge=0.0, le=1.0)
    technique: str = "General Shielding"
    selected: bool = False


class LikelihoodResult(BaseModel):
    annual_threat_frequency: float
    vulnerability_susceptibility: float
    exploitation_probability: float
    calibrated_confidence: float
    primary_drivers: List[str]


class LossDistributionResult(BaseModel):
    expected_annual_loss_inr: float  # EAL
    p50_loss_inr: float
    p90_loss_inr: float
    var95_inr: float  # Value at Risk 95%
    cvar95_inr: float  # Conditional VaR 95%
    min_loss_inr: float
    max_loss_inr: float
    expected_downtime_loss_inr: float = 0.0
    expected_incident_response_loss_inr: float = 0.0
    expected_breach_loss_inr: float = 0.0
    expected_sla_penalty_loss_inr: float = 0.0
    simulation_draws: int = 10000
    currency: str = "INR"


class PortfolioOption(BaseModel):
    actions: List[MitigationCandidate]
    total_spend_inr: float
    expected_eal_reduction_inr: float
    residual_eal_inr: float
    ros_index: float  # Return on Security Investment


class QuantifyRequest(BaseModel):
    scenario_id: str
    title: str
    finding: FindingIntake
    asset_profile: AssetServiceProfile
    simulation_draws: int = 10000
    seed: Optional[int] = 42


class QuantifyResponse(BaseModel):
    scenario_id: str
    title: str
    likelihood: LikelihoodResult
    baseline_loss: LossDistributionResult
    data_quality_grade: str = "A"
    calculation_id: str


class OptimizationRequest(BaseModel):
    scenario_id: str
    baseline_eal_inr: float
    budget_limit_inr: float = 10000000.0  # Default ₹1 Crore
    candidate_mitigations: List[MitigationCandidate]


class OptimizationResult(BaseModel):
    scenario_id: str
    budget_limit_inr: float
    selected_actions: List[MitigationCandidate]
    total_spend_inr: float
    expected_eal_reduction_inr: float
    residual_eal_inr: float
    ros_index: float
    efficient_frontier: List[PortfolioOption]
