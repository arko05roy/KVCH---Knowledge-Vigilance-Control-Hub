import type { FindingEnvelope } from "../judge/findings";
import { ollamaProvider } from "./providers/ollama";
import { generateAllRoleReports, type MultiRoleReportPackage } from "./report-generator";
import { broadcastDashboardRefresh, broadcastAnalysisCompleted } from "../websocket/gateway";

export interface QueueJob {
  id: string;
  finding: FindingEnvelope;
  priority: number; // 4: CRITICAL, 3: HIGH, 2: MEDIUM, 1: LOW
  enqueuedAt: number;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  result?: MultiRoleReportPackage;
  error?: string;
}

export class AIAnalysisQueue {
  private jobs: Map<string, QueueJob> = new Map();
  private isProcessing: boolean = false;

  public getQueueDepth(): number {
    return Array.from(this.jobs.values()).filter(
      (j) => j.status === "QUEUED" || j.status === "PROCESSING"
    ).length;
  }

  /**
   * Calculate numerical priority (CRITICAL: 4 > HIGH: 3 > MEDIUM: 2 > LOW: 1)
   */
  private getPriorityScore(severity: string): number {
    const sev = String(severity || "").toUpperCase();
    if (sev === "CRITICAL") return 4;
    if (sev === "HIGH") return 3;
    if (sev === "MEDIUM") return 2;
    return 1;
  }

  /**
   * Enqueue finding telemetry for asynchronous background Ollama inference
   */
  public enqueue(finding: FindingEnvelope): QueueJob {
    const id = `job_${finding.resource?.id || "finding"}_${Date.now()}`;
    const priority = this.getPriorityScore(finding.severity);

    const job: QueueJob = {
      id,
      finding,
      priority,
      enqueuedAt: Date.now(),
      status: "QUEUED"
    };

    this.jobs.set(id, job);

    // Trigger async queue processing loop
    setImmediate(() => this.processNext());

    return job;
  }

  /**
   * Background queue worker processing jobs in priority order
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing) return;

    // Get next highest priority queued job
    const queuedJobs = Array.from(this.jobs.values()).filter((j) => j.status === "QUEUED");
    if (queuedJobs.length === 0) return;

    // Sort by priority DESC, then by enqueuedAt ASC
    queuedJobs.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.enqueuedAt - b.enqueuedAt;
    });

    const currentJob = queuedJobs[0];
    currentJob.status = "PROCESSING";
    this.isProcessing = true;

    try {
      // Execute local Ollama AI report generation
      const reportPackage = await generateAllRoleReports(currentJob.finding);

      currentJob.result = reportPackage;
      currentJob.status = "COMPLETED";

      // Broadcast WebSocket notifications
      broadcastAnalysisCompleted({
        findingId: currentJob.finding.resource?.id || currentJob.id,
        severity: currentJob.finding.severity,
        modelUsed: ollamaProvider.getConfig().model,
        generatedAt: new Date().toISOString()
      });

      broadcastDashboardRefresh();
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error(`[AI Analysis Queue] Job ${currentJob.id} failed:`, error?.message || error);
      currentJob.status = "FAILED";
      currentJob.error = error?.message || "Inference error";
    } finally {
      this.isProcessing = false;
      // Continue processing remaining queue
      setImmediate(() => this.processNext());
    }
  }

  public getJob(id: string): QueueJob | undefined {
    return this.jobs.get(id);
  }

  public getAllJobs(): QueueJob[] {
    return Array.from(this.jobs.values());
  }
}

export const aiAnalysisQueue = new AIAnalysisQueue();
