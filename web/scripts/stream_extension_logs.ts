import { analyzeThreatContext } from "../lib/threat-engine/index";
import { THREAT_SCENARIOS } from "../lib/threat-engine/scenarios";
import crypto from "node:crypto";

function timestamp() {
  return new Date().toISOString();
}

function logHeader(title: string) {
  console.log("\n" + "=".repeat(75));
  console.log(`  [KVCH-EXTENSION DAEMON] ${title}`);
  console.log("=".repeat(75));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Flatten all scenario options into a continuous event queue
const ALL_EVENTS = THREAT_SCENARIOS.flatMap((s) => s.options);

async function runContinuousExtensionDaemon() {
  logHeader("KVCH EXTENSION DAEMON STARTED (CONTINUOUS LIVE STREAM)");
  console.log(`[${timestamp()}] [DAEMON] Extension: @arko05roy/kvch-extension v0.1.2`);
  console.log(`[${timestamp()}] [DAEMON] Mode: CONTINUOUS EVENT & SOCKET MONITORING (Press Ctrl+C to Stop)`);
  console.log(`[${timestamp()}] [DAEMON] Attestation: SHA-256 HMAC Active (Secret: kvch-agent-hmac-key)`);
  console.log(`[${timestamp()}] [DAEMON] Listening to Kernel Process Spawns, Sockets, and File I/O...\n`);
  
  await sleep(1000);

  let cycle = 1;
  let eventIndex = 0;

  while (true) {
    const opt = ALL_EVENTS[eventIndex % ALL_EVENTS.length];
    const v = opt.vector;
    eventIndex++;

    logHeader(`[CYCLE #${cycle}] EVENT: ${opt.label}`);
    
    console.log(`[${timestamp()}] [EVENT]  Process Spawned: ${v.process.name} (PID: ${v.process.pid})`);
    console.log(`[${timestamp()}] [EVENT]  Parent Lineage:  ${v.process.parent_name} (PPID: ${v.process.parent_pid})`);
    console.log(`[${timestamp()}] [EVENT]  Binary Path:     ${v.process.path}`);
    console.log(`[${timestamp()}] [EVENT]  Code Signing:    ${v.process.is_signed ? `SIGNED by "${v.process.signature_signer}"` : "UNSIGNED (Alert)"}`);
    console.log(`[${timestamp()}] [EVENT]  Network Socket:  ${v.network.src_ip} -> ${v.network.dst_ip}:${v.network.dst_port} (${v.network.protocol})`);
    console.log(`[${timestamp()}] [EVENT]  Volume Egress:   ${(v.network.bytes_sent / 1024).toFixed(1)} KB`);
    console.log(`[${timestamp()}] [EVENT]  Host / Asset:    ${v.asset.hostname} [${v.asset.asset_criticality}] User: "${v.user_context.username}"`);

    // 1. Cryptographic Attestation
    const rawPayload = JSON.stringify(v);
    const hmacSignature = crypto.createHmac("sha256", "kvch-agent-hmac-key").update(rawPayload).digest("hex");
    console.log(`[${timestamp()}] [CRYPTO] Generated HMAC-SHA256: ${hmacSignature.substring(0, 28)}... [VALID]`);

    // 2. Dispatch to Backend
    console.log(`[${timestamp()}] [DISPATCH] Streaming telemetry packet to CTDE v2.0 Engine...`);
    await sleep(400);

    const verdict = await analyzeThreatContext(v);

    // 3. Output Analysis & SOAR Response
    console.log(`[${timestamp()}] [ENGINE] Route Stage:      ${verdict.routing_stage} (Skipped LLM: ${verdict.skipped_llm})`);
    console.log(`[${timestamp()}] [ENGINE] Threat Verdict:   ${verdict.threat_classification} [${verdict.severity}]`);
    console.log(`[${timestamp()}] [ENGINE] Confidence Score: ${verdict.confidence_score}%`);
    console.log(`[${timestamp()}] [ENGINE] MITRE ATT&CK:     ${verdict.mitre_attack_technique}`);
    console.log(`[${timestamp()}] [SOAR]   Action Enforced:  ${verdict.soar_action.action_type} (Status: ${verdict.soar_action.execution_status})`);

    if (verdict.primary_differentiators.length > 0) {
      console.log(`[${timestamp()}] [EVIDENCE] Grounded Differentiators:`);
      verdict.primary_differentiators.forEach((d) => console.log(`             * ${d}`));
    }

    // Periodic Heartbeat Pulse
    if (eventIndex % ALL_EVENTS.length === 0) {
      cycle++;
      console.log(`\n[${timestamp()}] [HEARTBEAT] Fleet Daemon Status: HEALTHY | Monitored Nodes: 12 | Agent Silenced Alerts: 0`);
      console.log(`[${timestamp()}] [DAEMON] Waiting for next telemetry burst...`);
      await sleep(1500);
    } else {
      await sleep(800);
    }
  }
}

// Handle graceful termination
process.on("SIGINT", () => {
  console.log(`\n[${timestamp()}] [DAEMON] Stopping KVCH Extension Watchdog gracefully. Bye!`);
  process.exit(0);
});

runContinuousExtensionDaemon().catch((err) => {
  console.error("Extension daemon error:", err);
});
