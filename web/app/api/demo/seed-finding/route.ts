import { NextResponse } from "next/server";
import { generateAllRoleReports } from "@/lib/ai/report-generator";
import type { FindingEnvelope } from "@/lib/judge/findings";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const sampleFinding: FindingEnvelope = {
      schema_version: "kvch.finding/v1",
      observed_at: new Date().toISOString(),
      severity: body.severity || "high",
      category: body.category || "attack_surface_scan",
      title: body.title || "Discovered Open PostgreSQL Port 5432 & Unencrypted Socket Listener",
      summary: body.summary || "Attack surface scanner identified an open TCP port 5432 binding on 0.0.0.0 on host MacBook-Air.lan",
      resource: {
        type: "host",
        id: "192.168.31.204",
        name: "MacBook-Air.lan"
      },
      evidence: [
        "netstat -anv line: tcp4 0 0 *.5432 *.* LISTEN",
        "nmap scan result: 5432/tcp open postgresql"
      ],
      indicators: ["LISTEN *.5432", "UNENCRYPTED_LISTENER"],
      baseline: { threshold: 0, enforcement: "BLOCK" },
      recommended_actions: [
        "Bind PostgreSQL port 5432 strictly to 127.0.0.1",
        "Enable SSL/TLS certificate authentication on database socket",
        "Audit active user sessions"
      ],
      details: {
        target_ip: "192.168.31.204",
        open_ports: [5432, 445],
        risk_score: 82
      }
    };

    console.log("[Demo Trigger] Calling Groq Key Pool for 4-Role AI Report Generation...");
    const aiReports = await generateAllRoleReports(sampleFinding);

    const enrichedEnvelope = {
      ...sampleFinding,
      ai_reports: aiReports.reports
    };

    return NextResponse.json({
      success: true,
      message: "AI Role Reports generated successfully via Groq key pool!",
      finding: enrichedEnvelope
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[Demo Trigger Error]:", error);
    return NextResponse.json({ success: false, error: err?.message || "Generation failed" }, { status: 500 });
  }
}
