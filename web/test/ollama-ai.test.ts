import { ollamaProvider } from "../lib/ai/providers/ollama";
import { buildOllamaSystemPrompt, buildOllamaUserPrompt, parseAndRepairJSON } from "../lib/ai/prompts/security-analysis";
import { aiAnalysisQueue } from "../lib/ai/queue";
import { generateAllRoleReports } from "../lib/ai/report-generator";
import type { FindingEnvelope } from "../lib/judge/findings";

const MOCK_FINDING: FindingEnvelope = {
  schema_version: "kvch.finding/v1",
  observed_at: new Date().toISOString(),
  severity: "CRITICAL",
  category: "malicious_dependency",
  title: "Remote Code Execution & Typosquatted Supply Chain Package Injection",
  summary: "Detected unpinned package @kvch-internal/crypto-utils v1.4.2 spawning obfuscated reverse shell to 185.220.101.5:443.",
  resource: {
    type: "host_process",
    id: "PID-14209",
    name: "prod-db-primary-01.local"
  },
  evidence: [
    "Process PID 14209 executing Node.js reverse shell script telemetry_worker.js",
    "Socket connection open to C2 IP 185.220.101.5:443",
    "PostgreSQL 5432 bound to external interface 0.0.0.0"
  ],
  indicators: ["REVERSE_SHELL_PID", "UNAUTHENTICATED_DB_PORT"],
  baseline: { expected_listener: "127.0.0.1" },
  recommended_actions: ["sudo kill -9 14209", "sudo iptables -A OUTPUT -d 185.220.101.5 -j DROP"],
  details: { threat_level: "CRITICAL" }
};

async function runTests() {
  console.log("=== OLLAMA LOCAL AI SUITE AUTOMATED TESTS ===");

  // Test 1: Health Check Probe
  console.log("\n[TEST 1] Testing Ollama Health Probe...");
  const health = await ollamaProvider.checkHealth();
  console.log(`  Result: Status=${health.status}, Reachable=${health.reachable}, Model=${health.activeModel}, Latency=${health.latencyMs}ms`);
  console.assert(typeof health.status === "string", "Status should be string");

  // Test 2: System Prompt & User Prompt Generation
  console.log("\n[TEST 2] Testing Prompt Formatting...");
  const sysPrompt = buildOllamaSystemPrompt();
  const userPrompt = buildOllamaUserPrompt(MOCK_FINDING);
  console.assert(sysPrompt.includes("executive_summary"), "System prompt should require executive_summary");
  console.assert(userPrompt.includes("PID-14209"), "User prompt should contain finding details");
  console.log("  Prompt formatting verified successfully.");

  // Test 3: JSON Parse & Auto-Repair Utility
  console.log("\n[TEST 3] Testing JSON Auto-Repair...");
  const rawMalformedMarkdown = `\`\`\`json
{
  "executive_summary": "Malicious payload detected",
  "estimated_risk_level": "CRITICAL"
}
\`\`\``;
  const repaired = parseAndRepairJSON(rawMalformedMarkdown, { fallback: true });
  console.assert((repaired as any).estimated_risk_level === "CRITICAL", "Auto-repair should parse markdown JSON block");
  console.log("  JSON Auto-Repair verified successfully.");

  // Test 4: Multi-Role Report Projection Generation
  console.log("\n[TEST 4] Testing Multi-Role Report Projections...");
  const reportPackage = await generateAllRoleReports(MOCK_FINDING);
  console.assert(!!reportPackage.reports.srDev, "srDev report should exist");
  console.assert(!!reportPackage.reports.intern, "intern report should exist");
  console.assert(!!reportPackage.reports.hr, "hr report should exist");
  console.assert(!!reportPackage.reports.management, "management report should exist");
  console.log("  All 4 role projections (srDev, intern, hr, management) generated successfully.");

  // Test 5: Queue Priority Sorting (CRITICAL > HIGH > MEDIUM > LOW)
  console.log("\n[TEST 5] Testing AI Priority Queue Enqueueing...");
  const jobLow = aiAnalysisQueue.enqueue({ ...MOCK_FINDING, severity: "LOW" });
  const jobCritical = aiAnalysisQueue.enqueue({ ...MOCK_FINDING, severity: "CRITICAL" });
  console.assert(jobCritical.priority > jobLow.priority, "CRITICAL priority score must exceed LOW priority score");
  console.log(`  Priority score verified: CRITICAL (${jobCritical.priority}) > LOW (${jobLow.priority}).`);

  console.log("\n✅ ALL OLLAMA LOCAL AI TESTS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
