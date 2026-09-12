import { probeFiveLayers } from "./dist/fingerprint/probe.js";
import { generateHostFingerprint } from "./dist/fingerprint/signer.js";
import { handleGetSecurityReports } from "./dist/tools/report-tools.js";
import { handleListExtensions } from "./dist/tools/extension-tools.js";
import { handleRunSandboxScan, handleExecuteSoar } from "./dist/tools/scan-tools.js";

console.log("=========================================================================");
console.log("1. TESTING MCP FINGERPRINT PROBE (5-LAYER HARDWARE TELEMETRY)");
console.log("=========================================================================");
const fp = generateHostFingerprint();
console.log("Attested Fingerprint:", fp.fingerprint);
console.log("Attestation Prefix:", fp.prefix);
console.log("Telemetry Summary:", {
  os: `${fp.telemetry.layer1_os.platform} (${fp.telemetry.layer1_os.arch})`,
  network: `Interface ${fp.telemetry.layer2_network.primaryInterface} (${fp.telemetry.layer2_network.localIp})`,
  openSockets: `${fp.telemetry.layer3_transport.socketCount} listening ports`,
  ssl: fp.telemetry.layer4_presentation.sslVersion,
  memory: `${Math.round(fp.telemetry.layer5_memory.totalMemoryBytes / 1024 / 1024 / 1024)}GB RAM`
});

console.log("\n=========================================================================");
console.log("2. TESTING MCP EXTENSION LISTINGS (PULLED FROM External/)");
console.log("=========================================================================");
const extResult = handleListExtensions();
console.log(`Discovered ${extResult.count} Extensions:`);
extResult.extensions.forEach(ext => {
  console.log(`  - [${ext.id}] ${ext.name} (Schedule: ${ext.cron}) -> Path: ${ext.path}`);
});

console.log("\n=========================================================================");
console.log("3. TESTING MCP SECURITY intelligence REPORTS (PULLED FROM final reports/)");
console.log("=========================================================================");
["sr-dev", "intern", "hr", "management"].forEach(role => {
  const report = handleGetSecurityReports({ role: role, format: "json" });
  console.log(`\n--- [Role: ${role.toUpperCase()}] ---`);
  if (report.success) {
    const summary = typeof report.content === "object" ? JSON.stringify(report.content).slice(0, 200) + "..." : String(report.content).slice(0, 200) + "...";
    console.log("Status: SUCCESS");
    console.log("Attestation Prefix Verified:", report.attestationPrefix);
    console.log("Content Snippet:", summary);
  } else {
    console.log("Error:", report.error);
  }
});

console.log("\n=========================================================================");
console.log("4. TESTING MCP SANDBOX BENCHMARK SCAN (kvch_run_sandbox_scan)");
console.log("=========================================================================");
const scanRes = handleRunSandboxScan({ durationMinutes: 120 });
console.log("Scan ID:", scanRes.scanResult.scanId);
console.log("Threats Detected:", scanRes.scanResult.threatsDetected);
console.log("Critical Interceptions:");
scanRes.scanResult.criticalInterceptions.forEach(item => console.log(`  ⚠ ${item}`));

console.log("\n=========================================================================");
console.log("5. TESTING MCP SOAR CONTAINMENT PLAYBOOK (kvch_execute_soar_containment)");
console.log("=========================================================================");
const soarRes = handleExecuteSoar({ action: "full_quarantine", pid: 14209, ip: "185.220.101.5" });
console.log("Execution ID:", soarRes.execution.executionId);
console.log("Commands Executed:");
soarRes.execution.commandsExecuted.forEach(cmd => console.log(`  ➜ ${cmd}`));
console.log("Host Clean Baseline:", soarRes.execution.hostReturnedToCleanBaseline);
console.log("=========================================================================");
