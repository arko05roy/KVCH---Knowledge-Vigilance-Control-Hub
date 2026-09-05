import { generateAllRoleReports } from "../lib/ai/report-generator";
import type { FindingEnvelope } from "../lib/judge/findings";

const sampleFinding: FindingEnvelope = {
  schema_version: "kvch.finding/v1",
  observed_at: new Date().toISOString(),
  severity: "high",
  category: "attack_surface_scan",
  title: "Open PostgreSQL Port 5432 & SMB Port 445 Discovered",
  summary: "Discovered 2 open ports listening on public interface on MacBook-Air.lan",
  resource: {
    type: "laptop",
    id: "192.168.31.204",
    name: "MacBook-Air.lan"
  },
  evidence: [],
  indicators: ["LISTEN *.5432", "LISTEN *.445"],
  baseline: { threshold: 0 },
  recommended_actions: ["Restrict port 5432 to localhost", "Close SMB port 445"],
  details: {
    open_ports: [5432, 445],
    risk_score: 85
  }
};

async function runTest() {
  console.log("Testing Groq AI Report Generator Key Pool...");
  try {
    const result = await generateAllRoleReports(sampleFinding);
    console.log("SUCCESS! Generated Reports for 4 Roles:");
    console.log("-----------------------------------------");
    console.log("[Sr. Dev Report]:", result.reports.srDev.title);
    console.log("Insights:", result.reports.srDev.keyInsights);
    console.log("-----------------------------------------");
    console.log("[Intern Report]:", result.reports.intern.title);
    console.log("-----------------------------------------");
    console.log("[HR Report]:", result.reports.hr.title);
    console.log("-----------------------------------------");
    console.log("[Management Report]:", result.reports.management.title);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTest();
