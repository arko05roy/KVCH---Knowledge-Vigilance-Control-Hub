import { NextResponse } from "next/server";
import { analyzeThreatContext, FusedContextVector } from "@/lib/threat-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const vector: FusedContextVector = body.vector || body;

    if (!vector || !vector.network || !vector.process) {
      return NextResponse.json(
        { success: false, error: "Invalid telemetry matrix. Missing network or process context." },
        { status: 400 }
      );
    }

    const verdict = await analyzeThreatContext(vector);

    return NextResponse.json({
      success: true,
      vector,
      verdict,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[CTDE Engine API Error]:", error);
    return NextResponse.json(
      { success: false, error: err?.message || "Threat context analysis failed" },
      { status: 500 }
    );
  }
}
