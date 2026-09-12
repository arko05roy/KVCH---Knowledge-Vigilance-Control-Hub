import { NextResponse } from "next/server";
import { THREAT_SCENARIOS } from "@/lib/threat-engine/scenarios";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      scenarios: THREAT_SCENARIOS,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load scenarios" },
      { status: 500 }
    );
  }
}
