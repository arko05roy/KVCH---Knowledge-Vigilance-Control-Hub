import type { FindingEnvelope } from "../../judge/findings";

export interface OllamaStructuredAnalysis {
  executive_summary: string;
  technical_summary: string;
  severity_reasoning: string;
  business_impact: {
    operational: string;
    financial: string;
    compliance: string;
    reputational: string;
  };
  recommended_actions: Array<{
    action: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    timeToImplement: string;
    rosi: string;
    type: "Quick Win" | "High ROI Action" | "Long-Term Investment";
  }>;
  estimated_risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export function buildOllamaSystemPrompt(): string {
  return `You are the local security AI for KVCH. Respond ONLY with valid JSON.
JSON format required:
{
  "executive_summary": "Brief incident summary",
  "technical_summary": "Technical details (ports, PIDs, processes)",
  "severity_reasoning": "Reason for severity",
  "business_impact": {
    "operational": "Impact on systems",
    "financial": "Estimated monetary loss",
    "compliance": "Regulatory impact",
    "reputational": "Brand impact"
  },
  "recommended_actions": [
    {
      "action": "Remediation step",
      "priority": "HIGH",
      "timeToImplement": "Immediate",
      "rosi": "High",
      "type": "Quick Win"
    }
  ],
  "estimated_risk_level": "HIGH"
}`;
}

export function buildOllamaUserPrompt(finding: FindingEnvelope): string {
  return `Analyze finding details:\n${JSON.stringify(finding, null, 2)}`;
}

/**
 * Robust JSON extraction and auto-repair utility for LLM responses
 */
export function parseAndRepairJSON<T>(rawOutput: string, fallbackObject: T): T {
  if (!rawOutput) return fallbackObject;

  try {
    // 1. Direct parse attempt
    return JSON.parse(rawOutput.trim()) as T;
  } catch {
    // 2. Extract content inside ```json ... ``` or first { ... } block
    let cleaned = rawOutput.trim();

    // Strip markdown code block fences if present
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonCandidate) as T;
      } catch (innerErr) {
        console.warn("[JSON Auto-Repair] Candidate extraction failed:", innerErr);
      }
    }
  }

  // Fallback if parsing fails completely
  console.warn("[JSON Auto-Repair] Returning safe fallback object.");
  return fallbackObject;
}
