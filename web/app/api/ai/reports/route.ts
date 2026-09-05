import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "srDev";

    const db = prisma;
    const findings = await db.finding.findMany({
      orderBy: { observedAt: "desc" },
      take: 10,
      include: {
        artifact: {
          select: {
            manifest: true,
          },
        },
      },
    });

    // Transform database records into role reports
    const roleKeyMap: Record<string, string> = {
      "sr-dev": "srDev",
      "srDev": "srDev",
      "intern": "intern",
      "hr": "hr",
      "management": "management"
    };
    const targetKey = roleKeyMap[role] || "srDev";

    const reports = findings.map((f) => {
      const envelope = f.envelope as any;
      const aiReports = envelope?.ai_reports;
      const roleReport = aiReports?.[targetKey];

      return {
        id: f.id,
        title: f.title,
        severity: f.severity,
        category: f.category,
        observedAt: f.observedAt,
        envelope,
        aiReport: roleReport || {
          title: f.title,
          summary: envelope?.summary || "Security observation detected.",
          keyInsights: [f.category, `Severity: ${f.severity.toUpperCase()}`],
          actionItems: envelope?.recommended_actions || ["Review security logs"],
          roleSpecificDetail: envelope?.details ? JSON.stringify(envelope.details, null, 2) : "Standard security observation",
        }
      };
    });

    return NextResponse.json({
      success: true,
      role: targetKey,
      count: reports.length,
      reports
    });
  } catch (error: any) {
    console.error("[API AI Reports Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to fetch reports" }, { status: 500 });
  }
}
