export interface FindingIntake {
  finding_id: string;
  source_extension: string;
  category: string;
  cve_id?: string;
  package_name?: string;
  asset_id: string;
  observed_at: string;
  internet_reachable: boolean;
  authentication_required: boolean;
  compensating_controls: string[];
  epss_score?: number;
  cisa_kev?: boolean;
  cvss_score?: number;
}

export interface AssetServiceProfile {
  asset_id: string;
  asset_name: string;
  business_service_id: string;
  business_service_name: string;
  environment?: string;
  downtime_cost_per_hour_inr: number;
  avg_incident_response_cost_inr: number;
  data_breach_cost_per_record_inr?: number;
  records_exposed_estimate?: number;
  rto_hours: number;
  active_users: number;
}

export interface MitigationCandidate {
  action_id: string;
  name: string;
  cost_inr: number;
  lead_time_days: number;
  risk_reduction_factor: number;
  technique: string;
  selected?: boolean;
}

export interface LikelihoodResult {
  annual_threat_frequency: number;
  vulnerability_susceptibility: number;
  exploitation_probability: number;
  calibrated_confidence: number;
  primary_drivers: string[];
}

export interface LossDistributionResult {
  expected_annual_loss_inr: number;
  p50_loss_inr: number;
  p90_loss_inr: number;
  var95_inr: number;
  cvar95_inr: number;
  min_loss_inr: number;
  max_loss_inr: number;
  expected_downtime_loss_inr?: number;
  expected_incident_response_loss_inr?: number;
  expected_breach_loss_inr?: number;
  expected_sla_penalty_loss_inr?: number;
  simulation_draws: number;
  currency: string;
}

export interface PortfolioOption {
  actions: MitigationCandidate[];
  total_spend_inr: number;
  expected_eal_reduction_inr: number;
  residual_eal_inr: number;
  ros_index: number;
}

export interface QuantifyResponse {
  scenario_id: string;
  title: string;
  likelihood: LikelihoodResult;
  baseline_loss: LossDistributionResult;
  data_quality_grade: string;
  calculation_id: string;
}

export interface OptimizationResult {
  scenario_id: string;
  budget_limit_inr: number;
  selected_actions: MitigationCandidate[];
  total_spend_inr: number;
  expected_eal_reduction_inr: number;
  residual_eal_inr: number;
  ros_index: number;
  efficient_frontier: PortfolioOption[];
}

const RISK_ENGINE_URL = process.env.RISK_ENGINE_URL || 'http://127.0.0.1:8000';

export async function quantifyRiskScenario(payload: {
  scenario_id: string;
  title: string;
  finding: FindingIntake;
  asset_profile: AssetServiceProfile;
  simulation_draws?: number;
  seed?: number;
}): Promise<QuantifyResponse> {
  const res = await fetch(`${RISK_ENGINE_URL}/api/v1/risk/quantify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      simulation_draws: 10000,
      seed: 42,
      ...payload,
    }),
  });

  if (!res.ok) {
    throw new Error(`Risk engine quantify failed: ${res.statusText}`);
  }

  return res.json();
}

export async function optimizeMitigationPortfolio(payload: {
  scenario_id: string;
  baseline_eal_inr: number;
  budget_limit_inr: number;
  candidate_mitigations: MitigationCandidate[];
}): Promise<OptimizationResult> {
  const res = await fetch(`${RISK_ENGINE_URL}/api/v1/risk/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Risk engine optimize failed: ${res.statusText}`);
  }

  return res.json();
}
