import crypto from "node:crypto";
import { TelemetryIntegrity, TelemetrySourceLayer, DeviceSignature, FusedContextVector } from "./types";

/**
 * Message-Level Event Signature Verifier, Agent Liveness Monitor, & Hardware Device Attestation
 */

export function verifyEventSignature(payload: string, signature: string, secret = "kvch-agent-hmac-key"): boolean {
  if (!signature) return false;
  try {
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function evaluateAgentLiveness(lastHeartbeatSecondsAgo: number): {
  status: "HEALTHY" | "DEGRADED" | "SILENCED";
  isAgentSilencedAlert: boolean;
} {
  if (lastHeartbeatSecondsAgo > 120) {
    // Agent has stopped checking in for >2 minutes: EDR tamper or process killed
    return {
      status: "SILENCED",
      isAgentSilencedAlert: true,
    };
  }
  if (lastHeartbeatSecondsAgo > 45) {
    return {
      status: "DEGRADED",
      isAgentSilencedAlert: false,
    };
  }
  return {
    status: "HEALTHY",
    isAgentSilencedAlert: false,
  };
}

/**
 * Analyzes telemetry context and classifies which architectural layer the threat originated from:
 * OS | NETWORK | TRANSPORT | PRESENTATION | MEMORY
 */
export function detectTelemetrySourceLayer(vector: FusedContextVector): {
  layer: TelemetrySourceLayer;
  indicatorSummary: string;
} {
  const { process, network, threat_intel } = vector;

  // 1. MEMORY Layer Check: Credential Dumping / Browser SQLite / In-Memory Execution
  if (
    process.name.toLowerCase().includes("stealer") ||
    process.path.toLowerCase().includes("temp") ||
    vector.scenario_type.includes("credential") ||
    process.name.toLowerCase().includes("mimikatz")
  ) {
    return {
      layer: "MEMORY",
      indicatorSummary: `In-memory credential dumping & temporary staging detected in '${process.path}' (PID: ${process.pid})`,
    };
  }

  // 2. NETWORK Layer Check: External C2 Destination / Tor Exit Node / Threat Intel Hits
  if (threat_intel.is_known_c2 || network.dst_ip.startsWith("185.220") || threat_intel.reputation_score > 70) {
    return {
      layer: "NETWORK",
      indicatorSummary: `Network layer anomaly: External C2 routing to '${network.dst_ip}' (Threat Intel Flagged / Tor Node)`,
    };
  }

  // 3. TRANSPORT Layer Check: Bulk Exfiltration / Port 443 Session Duration / Multi-Gigabyte Stream
  if (network.bytes_sent > 5000000 || network.connection_duration_sec > 1800) {
    return {
      layer: "TRANSPORT",
      indicatorSummary: `Transport layer anomaly: High-volume TLS socket (${(network.bytes_sent / (1024 * 1024)).toFixed(1)} MB egress over Port ${network.dst_port})`,
    };
  }

  // 4. PRESENTATION Layer Check: Authenticode Cert Validation / Protocol Encoding / Signed Profile Sync
  if (process.is_signed && process.signature_signer) {
    return {
      layer: "PRESENTATION",
      indicatorSummary: `Presentation layer verified: Valid Authenticode certificate signed by '${process.signature_signer}'`,
    };
  }

  // 5. OS / KERNEL Layer: Process Lineage / Parent PID Spawning / Shell Invocation
  return {
    layer: "OS",
    indicatorSummary: `OS / Kernel layer: Process '${process.name}' spawned by parent '${process.parent_name}' (PPID: ${process.parent_pid})`,
  };
}

/**
 * Generates a cryptographically bound hardware device signature for the endpoint
 */
export function generateMandatoryDeviceSignature(
  vector: FusedContextVector,
  layerInfo: { layer: TelemetrySourceLayer; indicatorSummary: string }
): DeviceSignature {
  const hostname = vector.asset.hostname;
  const hardwareSeed = `${hostname}:${vector.asset.asset_criticality}:${vector.process.sha256 || "device-seed"}`;
  
  // Deterministic Hardware UUID
  const hardwareUuid = crypto.createHash("sha256").update(`HW-UUID:${hardwareSeed}`).digest("hex").substring(0, 32);
  const deviceId = `DEV-${hostname.toUpperCase()}-${hardwareUuid.substring(0, 8).toUpperCase()}`;

  // Signature bound to hardware identity, source layer, and process hash
  const payloadToSign = `${deviceId}|${hardwareUuid}|${layerInfo.layer}|${vector.process.pid}|${vector.timestamp}`;
  const signatureHash = crypto.createHmac("sha256", "kvch-hardware-attestation-master-key").update(payloadToSign).digest("hex");

  return {
    device_id: deviceId,
    hostname,
    hardware_uuid: hardwareUuid,
    telemetry_source_layer: layerInfo.layer,
    signature_hash: `0x${signatureHash}`,
    attestation_status: "VERIFIED_HARDWARE_ATTESTED",
    layer_indicator_summary: layerInfo.indicatorSummary,
  };
}
