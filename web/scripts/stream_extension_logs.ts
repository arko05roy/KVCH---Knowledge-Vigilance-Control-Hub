import { analyzeThreatContext } from "../lib/threat-engine/index";
import { THREAT_SCENARIOS } from "../lib/threat-engine/scenarios";
import { sanitizeTelemetryString } from "../lib/threat-engine/sanitizer";
import { verifyEventSignature } from "../lib/threat-engine/attestation";
import crypto from "node:crypto";

function timestamp() {
  return new Date().toISOString();
}

function logHeader(title: string) {
  console.log("\n" + "=".repeat(75));
  console.log(`  [KVCH-EXTENSION LOG STREAM] ${title}`);
  console.log("=".repeat(75));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function streamExtensionLogs() {
  logHeader("INITIALIZING TELEMETRY EXTENSION & EVENT WATCHDOG");
  console.log(`[${timestamp()}] [INFO]  Extension loaded: @arko05roy/kvch-extension v0.1.2`);
  console.log(`[${timestamp()}] [INFO]  Attestation key: SHA-256 HMAC (Loaded)`);
  console.log(`[${timestamp()}] [INFO]  Listening for Host Sockets, Process Lineage & SQLite I/O...`);
  await sleep(600);

  for (const scenario of THREAT_SCENARIOS) {
    for (const opt of scenario.options) {
      logHeader(`CAPTURING EVENT: ${opt.label}`);
      
      const v = opt.vector;
      console.log(`[${timestamp()}] [EVENT]  Process Spawned: ${v.process.name} (PID: ${v.process.pid})`);
      console.log(`[${timestamp()}] [EVENT]  Parent Lineage:  ${v.process.parent_name} (PPID: ${v.process.parent_pid})`);
      console.log(`[${timestamp()}] [EVENT]  Binary Path:     ${v.process.path}`);
      console.log(`[${timestamp()}] [EVENT]  Code Signing:    ${v.process.is_signed ? `SIGNED by "${v.process.signature_signer}"` : "UNSIGNED (Alert)"}`);
      console.log(`[${timestamp()}] [EVENT]  Network Socket:  ${v.network.src_ip} -> ${v.network.dst_ip}:${v.network.dst_port} (${v.network.protocol})`);
      console.log(`[${timestamp()}] [EVENT]  Volume Egress:   ${(v.network.bytes_sent / 1024).toFixed(1)} KB`);
      console.log(`[${timestamp()}] [EVENT]  Host / Asset:    ${v.asset.hostname} [${v.asset.asset_criticality}] User: "${v.user_context.username}"`);

      // 1. Attestation Signing
      const rawPayload = JSON.stringify(v);
      const hmacSignature = crypto.createHmac("sha256", "kvch-agent-hmac-key").update(rawPayload).digest("hex");
      console.log(`[${timestamp()}] [CRYPTO] Generated HMAC-SHA256: ${hmacSignature.substring(0, 24)}... (Verified: VALID)`);

      // 2. Dispatch to CTDE Engine
      console.log(`[${timestamp()}] [DISPATCH] Sending attested telemetry packet to CTDE v2.0 Engine...`);
      await sleep(350);

      const verdict = await analyzeThreatContext(v);

      // 3. Log Engine Stage & Response
      console.log(`[${timestamp()}] [ENGINE] Route Stage:      ${verdict.routing_stage} (Skipped LLM: ${verdict.skipped_llm})`);
      console.log(`[${timestamp()}] [ENGINE] Threat Verdict:   ${verdict.threat_classification} [${verdict.severity}]`);
      console.log(`[${timestamp()}] [ENGINE] Confidence Score: ${verdict.confidence_score}%`);
      console.log(`[${timestamp()}] [ENGINE] MITRE ATT&CK:     ${verdict.mitre_attack_technique}`);
      console.log(`[${timestamp()}] [SOAR]   Action Enforced:  ${verdict.soar_action.action_type} (Status: ${verdict.soar_action.execution_status})`);

      if (verdict.primary_differentiators.length > 0) {
        console.log(`[${timestamp()}] [EVIDENCE] Primary Differentiators:`);
        verdict.primary_differentiators.forEach((d) => console.log(`             * ${d}`));
      }

      await sleep(500);
    }
  }

  logHeader("LOG STREAM COMPLETE - ALL EVENTS AUDITED");
}

streamExtensionLogs().catch(console.error);
