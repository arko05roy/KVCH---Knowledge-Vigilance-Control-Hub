import { NextResponse } from "next/server";
import { analystFeedbackStore } from "@/lib/threat-engine/feedback-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenario_id, threat_classification, asset_tier, disposition, primary_differentiators, analyst_notes } = body;

    if (!disposition || !threat_classification) {
      return NextResponse.json(
        { success: false, error: "Missing required feedback disposition or classification." },
        { status: 400 }
      );
    }

    const recorded = analystFeedbackStore.recordFeedback({
      scenario_id: scenario_id || "SCENARIO-MANUAL",
      threat_classification,
      asset_tier: asset_tier || "Tier-1",
      disposition,
      primary_differentiators: primary_differentiators || [],
      analyst_notes,
    });

    const updatedContext = analystFeedbackStore.getFeedbackContext(threat_classification);

    return NextResponse.json({
      success: true,
      message: `Analyst disposition '${disposition}' saved! Dynamic baseline adjustment updated to ${updatedContext.feedback_confidence_adjustment}%.`,
      recorded,
      feedback_context: updatedContext,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[Analyst Feedback API Error]:", error);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to record feedback disposition" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const history = analystFeedbackStore.getHistory();
    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to retrieve feedback history" },
      { status: 500 }
    );
  }
}
