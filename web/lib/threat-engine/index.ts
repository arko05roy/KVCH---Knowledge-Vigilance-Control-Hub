import { FusedContextVector, DetectionVerdict } from "./types";
import { routeTelemetry } from "./confidence-router";
import { runStage2Reasoning } from "./reasoning-engine";
import { executeTieredSoarPolicy } from "./tiered-soar";
import { analystFeedbackStore } from "./feedback-store";
import { detectTelemetrySourceLayer, generateMandatoryDeviceSignature } from "./attestation";

export * from "./types";
export * from "./sanitizer";
export * from "./attestation";
export * from "./context-fusion";
export * from "./correlation";
export * from "./rule-filter";
export * from "./confidence-router";
export * from "./reasoning-engine";
export * from "./tiered-soar";
export * from "./feedback-store";
export * from "./scenarios";

/**
 * KVCH Contextual Threat Detection Engine (CTDE) v2.0
 * Master Analysis Pipeline (Section 2)
 */
export async function analyzeThreatContext(vector: FusedContextVector): Promise<DetectionVerdict> {
  // Step 1: Query Analyst Feedback adjustments
  const feedbackContext = analystFeedbackStore.getFeedbackContext(vector.process.name.includes("node") ? "REVERSE_SHELL" : "UNKNOWN");
  vector.analyst_feedback_context = feedbackContext;

  // Step 2: Route through Confidence Router (Stage 1 -> Stage 2 Gate)
  const routing = routeTelemetry(vector);

  let verdictClassification = routing.stage1Result.provisionalClassification;
  let verdictSeverity = routing.stage1Result.provisionalSeverity;
  let verdictConfidence = routing.stage1Result.provisionalConfidence;
  let primaryDiffs = routing.stage1Result.primaryDifferentiators;
  let evidenceRefs = routing.stage1Result.evidenceRefs;
  let reasoningSummary = "";
  let mitreTechnique = "None";
  let recommendedAction = "Log and Monitor";
  let skippedLLM = true;
  let routingStage: "STAGE_1_FAST_HEURISTIC" | "STAGE_2_DEEP_AI_REASONING" = "STAGE_1_FAST_HEURISTIC";
  let secondaryValidationResult = undefined;

  if (routing.routeToLLM) {
    // Stage 2: Deep AI Reasoning Layer
    routingStage = "STAGE_2_DEEP_AI_REASONING";
    skippedLLM = false;

    const stage2Res = await runStage2Reasoning(vector, primaryDiffs);

    verdictClassification = stage2Res.threat_classification;
    verdictSeverity = stage2Res.severity;
    verdictConfidence = stage2Res.confidence_score;
    primaryDiffs = stage2Res.primary_differentiators || primaryDiffs;
    reasoningSummary = stage2Res.ai_reasoning_summary;
    mitreTechnique = stage2Res.mitre_attack_technique;
    recommendedAction = stage2Res.recommended_soc_action;
    secondaryValidationResult = stage2Res.secondary_validation;
  } else {
    // Fast Path Heuristic Summary
    reasoningSummary = `Fast-Path Heuristic: Clean signed binary '${vector.process.signature_signer}' on verified destination (${vector.network.dst_ip}). Bypassed AI reasoning to eliminate latency.`;
    mitreTechnique = "N/A (Benign System Tooling)";
    recommendedAction = "Normal system operations. No SOC intervention needed.";
  }

  // Step 3: Execute Tiered SOAR Policy
  const soarAction = executeTieredSoarPolicy({
    confidence_score: verdictConfidence,
    severity: verdictSeverity,
    asset: vector.asset,
    process_name: vector.process.name,
    pid: vector.process.pid,
  });

  // Step 4: Detect Telemetry Source Layer (OS | NETWORK | TRANSPORT | PRESENTATION | MEMORY) & Hardware Signature
  const layerInfo = detectTelemetrySourceLayer(vector);
  const deviceSignature = generateMandatoryDeviceSignature(vector, layerInfo);

  return {
    threat_identified: verdictSeverity === "CRITICAL" || verdictSeverity === "HIGH",
    threat_classification: verdictClassification,
    severity: verdictSeverity,
    confidence_score: verdictConfidence,
    telemetry_source_layer: layerInfo.layer,
    device_signature: deviceSignature,
    primary_differentiators: primaryDiffs,
    evidence_refs: evidenceRefs,
    ai_reasoning_summary: reasoningSummary,
    mitre_attack_technique: mitreTechnique,
    recommended_soc_action: recommendedAction,
    model_version: "kvch-ctde-v2.0-hybrid",
    prompt_version: "2026.09-v2-fewshot-adversarial",
    routing_stage: routingStage,
    skipped_llm: skippedLLM,
    requires_secondary_validation: verdictSeverity === "CRITICAL",
    secondary_validation: secondaryValidationResult,
    soar_action: soarAction,
  };
}
