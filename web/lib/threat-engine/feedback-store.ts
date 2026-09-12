import { AnalystFeedbackRecord, ThreatClassification } from "./types";

/**
 * Analyst Feedback Store & Closed-Loop Baseline Retuner (Section 5)
 */

class AnalystFeedbackStore {
  private records: AnalystFeedbackRecord[] = [
    {
      id: "FB-001",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      scenario_id: "SCENARIO-1-C2",
      threat_classification: "REVERSE_SHELL",
      asset_tier: "Tier-1",
      disposition: "CONFIRMED_TRUE_POSITIVE",
      primary_differentiators: ["Unsigned node process spawned by npm wrapper", "C2 IP on Tor exit list"],
      analyst_notes: "Confirmed meterpreter staged payload in npm cache.",
    },
  ];

  public recordFeedback(record: Omit<AnalystFeedbackRecord, "id" | "timestamp">): AnalystFeedbackRecord {
    const fullRecord: AnalystFeedbackRecord = {
      ...record,
      id: `FB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };
    this.records.unshift(fullRecord);
    return fullRecord;
  }

  public getHistory(): AnalystFeedbackRecord[] {
    return [...this.records];
  }

  public getFeedbackContext(classification: ThreatClassification): {
    similar_past_verdicts_30d: number;
    similar_past_disposition: "TRUE_POSITIVE" | "FALSE_POSITIVE" | "NEEDS_CONTEXT" | "NONE";
    feedback_confidence_adjustment: string;
  } {
    const matching = this.records.filter((r) => r.threat_classification === classification);
    if (matching.length === 0) {
      return {
        similar_past_verdicts_30d: 0,
        similar_past_disposition: "NONE",
        feedback_confidence_adjustment: "0",
      };
    }

    const tps = matching.filter((r) => r.disposition === "CONFIRMED_TRUE_POSITIVE").length;
    const fps = matching.filter((r) => r.disposition === "FALSE_POSITIVE").length;

    if (tps > fps) {
      return {
        similar_past_verdicts_30d: matching.length,
        similar_past_disposition: "TRUE_POSITIVE",
        feedback_confidence_adjustment: "+5",
      };
    }
    if (fps > tps) {
      return {
        similar_past_verdicts_30d: matching.length,
        similar_past_disposition: "FALSE_POSITIVE",
        feedback_confidence_adjustment: "-10",
      };
    }

    return {
      similar_past_verdicts_30d: matching.length,
      similar_past_disposition: "NEEDS_CONTEXT",
      feedback_confidence_adjustment: "0",
    };
  }
}

export const analystFeedbackStore = new AnalystFeedbackStore();
