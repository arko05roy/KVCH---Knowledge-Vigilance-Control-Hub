import { NextResponse } from "next/server";
import { ollamaProvider } from "@/lib/ai/providers/ollama";
import { aiAnalysisQueue } from "@/lib/ai/queue";

export async function GET() {
  try {
    const health = await ollamaProvider.checkHealth();
    const queueDepth = aiAnalysisQueue.getQueueDepth();

    return NextResponse.json(
      {
        provider: "ollama",
        status: health.status,
        reachable: health.reachable,
        modelAvailable: health.modelAvailable,
        latencyMs: health.latencyMs,
        activeModel: health.activeModel,
        queueDepth,
        airGapped: true,
        checkedAt: new Date().toISOString()
      },
      { status: health.status === "OFFLINE" ? 503 : 200 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      {
        provider: "ollama",
        status: "OFFLINE",
        error: err?.message || "Health probe failed",
        airGapped: true,
        checkedAt: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
