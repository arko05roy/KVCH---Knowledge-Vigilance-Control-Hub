import { FusedContextVector } from "./types";
import { evaluateStage1Heuristics, Stage1HeuristicResult } from "./rule-filter";

/**
 * Confidence Router Logic (Section 4.2)
 * Decides whether telemetry needs Stage 2 Deep AI Reasoning or can skip LLM.
 */

export interface RouterDecision {
  routeToLLM: boolean;
  routingReason: string;
  stage1Result: Stage1HeuristicResult;
}

export function routeTelemetry(vector: FusedContextVector): RouterDecision {
  const stage1 = evaluateStage1Heuristics(vector);

  // Condition 1: Known-good signed binary + clean destination + no baseline anomaly
  if (stage1.canSkipLLM) {
    return {
      routeToLLM: false,
      routingReason: `Fast-Path: Clean signed binary '${vector.process.signature_signer}' on verified destination. Bypassing AI reasoning to eliminate latency.`,
      stage1Result: stage1,
    };
  }

  // Condition 2: Any threat-intel hit, unsigned binary on Tier-1 asset, first-seen destination, or cross-host correlation flag
  const reasons: string[] = [];
  if (vector.threat_intel.is_known_c2) reasons.push("Threat Intel C2 Hit");
  if (!vector.process.is_signed) reasons.push("Unsigned Binary");
  if (vector.historical_baseline.first_seen_destination) reasons.push("First-Seen Destination");
  if (vector.cross_host_correlation.same_destination_host_count_10min >= 3) reasons.push("Cross-Host Fleet Anomaly");
  if (vector.telemetry_integrity.collector_agent_heartbeat_status === "SILENCED") reasons.push("Agent Silenced Indicator");

  return {
    routeToLLM: true,
    routingReason: `Deep-Path Required: ${reasons.join(", ") || "Ambiguous behavioral profile"}. Routing to Stage 2 SOC Reasoning Engine.`,
    stage1Result: stage1,
  };
}
