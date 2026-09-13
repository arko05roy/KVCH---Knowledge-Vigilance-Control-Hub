import { NextResponse } from "next/server";
import { escalationStore } from "@/lib/escalation-store";

export async function GET() {
  const interns = escalationStore.getAll();
  const escalated = escalationStore.getEscalated();

  return NextResponse.json({
    success: true,
    interns,
    escalatedCount: escalated.length,
    pendingHrCount: escalated.filter((e) => e.escalationStatus === "PENDING_HR_REVIEW").length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, action, resolution, notes } = body;

    // If resolving from HR dashboard
    if (resolution) {
      const updated = escalationStore.resolveByHr(id, resolution);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Intern record not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, intern: updated, action: "RESOLVED_BY_HR" });
    }

    // If escalating from Senior Dev dashboard
    if (action === "FIRE_REVIEW" || action === "MANDATORY_TRAINING") {
      const updated = escalationStore.escalate(id, action, notes);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Intern record not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, intern: updated, action: "ESCALATED_TO_HR" });
    }

    // Reset if requested
    if (body.reset) {
      escalationStore.reset();
      return NextResponse.json({ success: true, message: "Escalations reset to defaults" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to process escalation" }, { status: 500 });
  }
}
