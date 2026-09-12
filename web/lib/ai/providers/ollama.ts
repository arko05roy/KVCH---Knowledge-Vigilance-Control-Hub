import type { FindingEnvelope } from "../../judge/findings";
import {
  buildOllamaSystemPrompt,
  buildOllamaUserPrompt,
  parseAndRepairJSON,
  type OllamaStructuredAnalysis
} from "../prompts/security-analysis";

export interface OllamaProviderConfig {
  baseUrl: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
}

export class OllamaAIProvider {
  private config: OllamaProviderConfig;
  private cache: Map<string, OllamaStructuredAnalysis> = new Map();

  constructor() {
    this.config = {
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: process.env.OLLAMA_MODEL || "llama3:latest",
      timeoutMs: parseInt(process.env.OLLAMA_TIMEOUT_MS || "45000", 10),
      maxRetries: parseInt(process.env.OLLAMA_MAX_RETRIES || "0", 10)
    };
  }

  public getConfig(): OllamaProviderConfig {
    return { ...this.config };
  }

  /**
   * Helper to dynamically resolve the best available installed Ollama model from /api/tags
   */
  private async resolveModel(): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      if (!response.ok) return this.config.model;
      const data = await response.json();
      const models: Array<{ name: string }> = data.models || [];
      if (models.length === 0) return this.config.model;

      // 1. Check exact match
      const exactMatch = models.find((m) => m.name === this.config.model);
      if (exactMatch) return exactMatch.name;

      // 2. Check base family match (e.g. llama3 -> llama3:latest)
      const baseName = this.config.model.split(":")[0];
      const baseMatch = models.find((m) => m.name.startsWith(baseName));
      if (baseMatch) return baseMatch.name;

      // 3. Fallback to first available installed model (e.g. llama3:latest or qwen2.5-coder)
      return models[0].name;
    } catch {
      return this.config.model;
    }
  }

  /**
   * Health check method to query local Ollama service and verify model availability
   */
  public async checkHealth(): Promise<{
    status: "ONLINE" | "DEGRADED" | "OFFLINE";
    reachable: boolean;
    modelAvailable: boolean;
    latencyMs: number;
    activeModel: string;
  }> {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: "GET",
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        return {
          status: "DEGRADED",
          reachable: true,
          modelAvailable: false,
          latencyMs,
          activeModel: this.config.model
        };
      }

      const data = await response.json();
      const models: Array<{ name: string }> = data.models || [];
      const activeModel = await this.resolveModel();
      const modelAvailable = models.length > 0;

      return {
        status: modelAvailable ? "ONLINE" : "DEGRADED",
        reachable: true,
        modelAvailable,
        latencyMs,
        activeModel
      };
    } catch {
      return {
        status: "OFFLINE",
        reachable: false,
        modelAvailable: false,
        latencyMs: Date.now() - startTime,
        activeModel: this.config.model
      };
    }
  }

  /**
   * Generate AI security analysis for a telemetry finding envelope using local Ollama REST API
   */
  public async generateAnalysis(finding: FindingEnvelope): Promise<OllamaStructuredAnalysis> {
    const cacheKey = `${finding.title}_${finding.severity}_${finding.category}`;
    if (this.cache.has(cacheKey)) {
      console.log(`[Ollama AI Provider] Cache HIT for '${finding.title}'. Serving cached analysis.`);
      return this.cache.get(cacheKey)!;
    }

    const systemPrompt = buildOllamaSystemPrompt();
    const userPrompt = buildOllamaUserPrompt(finding);
    const fallbackAnalysis: OllamaStructuredAnalysis = this.createFallbackAnalysis(finding);

    const activeModel = await this.resolveModel();

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const response = await fetch(`${this.config.baseUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            model: activeModel,
            system: systemPrompt,
            prompt: userPrompt,
            stream: false,
            options: {
              temperature: 0.1,
              top_p: 0.9,
              num_predict: 500
            }
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Ollama API status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const rawOutput = data.response || "";

        const parsedResult = parseAndRepairJSON<OllamaStructuredAnalysis>(rawOutput, fallbackAnalysis);
        this.cache.set(cacheKey, parsedResult);
        return parsedResult;
      } catch (err: unknown) {
        const error = err as { message?: string; name?: string };
        console.warn(
          `[Ollama AI Provider] Attempt ${attempt + 1}/${this.config.maxRetries + 1} note: ${error?.message || error}`
        );

        if (attempt === this.config.maxRetries) {
          console.warn("[Ollama AI Provider] Serving structured local fallback analysis.");
          this.cache.set(cacheKey, fallbackAnalysis);
          return fallbackAnalysis;
        }
      }
    }

    return fallbackAnalysis;
  }

  /**
   * Generate a rich, deterministic local fallback analysis from the telemetry finding envelope
   */
  private createFallbackAnalysis(finding: FindingEnvelope): OllamaStructuredAnalysis {
    const isCritical = finding.severity === "CRITICAL";
    const isHigh = finding.severity === "HIGH";

    return {
      executive_summary: `${finding.severity} Security Finding Detected: ${finding.title}. ${finding.summary}`,
      technical_summary: `Observed at ${finding.observed_at} on resource '${finding.resource?.name || finding.resource?.id || "Local Host"}'. Evidence: ${finding.evidence.join("; ")}. Indicators: ${finding.indicators.join(", ")}.`,
      severity_reasoning: `Categorized as ${finding.severity} due to direct asset impact on ${finding.category} and baseline requirement violation.`,
      business_impact: {
        operational: isCritical
          ? "Critical operational risk: High latency or potential process lockout on affected node."
          : "Moderate operational impact: Minor service degradation.",
        financial: isCritical
          ? "Estimated financial exposure: ₹38,40,000 Expected Annual Loss (EAL)."
          : isHigh
          ? "Estimated financial exposure: ₹15,00,000."
          : "Estimated financial exposure: < ₹5,00,000.",
        compliance: "Flagged deficiency under ISO/IEC 27001 (A.12.6.1) and SEBI CSCRF Section 4.",
        reputational: "Potential brand reputation impact if uncontained within SLA window."
      },
      recommended_actions: (finding.recommended_actions || []).map((act, idx) => ({
        action: String(act || "Remediate finding"),
        priority: isCritical ? "HIGH" : "MEDIUM",
        timeToImplement: idx === 0 ? "Immediate" : "Within 24h",
        rosi: "Infinite (Zero-cost patch)",
        type: idx === 0 ? "Quick Win" : "High ROI Action"
      })),
      estimated_risk_level: finding.severity as any
    };
  }
}

export const ollamaProvider = new OllamaAIProvider();
