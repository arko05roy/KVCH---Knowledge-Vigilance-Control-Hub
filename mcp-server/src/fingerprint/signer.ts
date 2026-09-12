import crypto from "node:crypto";
import { probeFiveLayers } from "./probe.js";
import type { FiveLayerTelemetry, FingerprintEnvelope } from "./types.js";

const DEFAULT_SECRET = process.env.KVCH_SECRET_KEY || "kvch-enterprise-kernel-attestation-secret-key-v1";

/**
 * Derives a cryptographically signed host fingerprint envelope from the 5-layer telemetry.
 * Format: kvch-fp:v1:<timestamp>:<layers_hash>:<signature>
 */
export function generateHostFingerprint(secret: string = DEFAULT_SECRET): FingerprintEnvelope {
  const telemetry = probeFiveLayers();
  return signTelemetry(telemetry, secret);
}

/**
 * Signs a given FiveLayerTelemetry object into an attested FingerprintEnvelope.
 */
export function signTelemetry(telemetry: FiveLayerTelemetry, secret: string = DEFAULT_SECRET): FingerprintEnvelope {
  const timestamp = Math.floor(Date.now() / 1000);

  // Canonical serialization of the 5 layers
  const canonicalString = [
    `OS:${telemetry.layer1_os.platform}:${telemetry.layer1_os.hardwareUuid}:${telemetry.layer1_os.cpuModel}`,
    `NET:${telemetry.layer2_network.primaryInterface}:${telemetry.layer2_network.localIp}:${telemetry.layer2_network.macHash}`,
    `TRANS:${telemetry.layer3_transport.activeSocketsHash}:${telemetry.layer3_transport.listeningPorts.join(",")}`,
    `PRES:${telemetry.layer4_presentation.sslVersion}:${telemetry.layer4_presentation.cryptoCurvesHash}`,
    `MEM:${telemetry.layer5_memory.totalMemoryBytes}:${telemetry.layer5_memory.memorySignature}`,
  ].join("|");

  const layersHash = crypto.createHash("sha256").update(canonicalString).digest("hex");

  // Sign using HMAC-SHA256
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}:${layersHash}`)
    .digest("hex");

  const fingerprint = `kvch-fp:v1:${timestamp}:${layersHash.slice(0, 16)}:${signature.slice(0, 32)}`;
  const prefix = `[KVCH-FP:${fingerprint}]`;

  return {
    fingerprint,
    prefix,
    timestamp,
    layersHash,
    signature,
    telemetry,
    isValid: true,
  };
}

/**
 * Verifies whether an incoming request fingerprint prefix is authentic and fresh.
 */
export function verifyFingerprint(
  tokenString: string,
  secret: string = DEFAULT_SECRET,
  maxAgeSeconds: number = 3600 // 1 hour validity for local session
): { isValid: boolean; reason?: string; extractedFingerprint?: string } {
  if (!tokenString) {
    return { isValid: false, reason: "Missing fingerprint token" };
  }

  // Extract raw fingerprint from prefix or token string
  const match = tokenString.match(/kvch-fp:v1:([0-9]+):([a-f0-9]+):([a-f0-9]+)/);
  if (!match) {
    return { isValid: false, reason: "Malformed fingerprint format" };
  }

  const [, tsStr, shortHash, sig] = match;
  const timestamp = parseInt(tsStr, 10);
  const now = Math.floor(Date.now() / 1000);

  if (isNaN(timestamp) || Math.abs(now - timestamp) > maxAgeSeconds) {
    return { isValid: false, reason: `Fingerprint expired (Age: ${Math.abs(now - timestamp)}s > ${maxAgeSeconds}s)` };
  }

  // Probe live layers to verify hardware continuity
  const live = probeFiveLayers();
  const canonicalString = [
    `OS:${live.layer1_os.platform}:${live.layer1_os.hardwareUuid}:${live.layer1_os.cpuModel}`,
    `NET:${live.layer2_network.primaryInterface}:${live.layer2_network.localIp}:${live.layer2_network.macHash}`,
    `TRANS:${live.layer3_transport.activeSocketsHash}:${live.layer3_transport.listeningPorts.join(",")}`,
    `PRES:${live.layer4_presentation.sslVersion}:${live.layer4_presentation.cryptoCurvesHash}`,
    `MEM:${live.layer5_memory.totalMemoryBytes}:${live.layer5_memory.memorySignature}`,
  ].join("|");

  const expectedLayersHash = crypto.createHash("sha256").update(canonicalString).digest("hex");
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}:${expectedLayersHash}`)
    .digest("hex");

  // Verify signature and layer continuity
  const sigMatch = crypto.timingSafeEqual(
    Buffer.from(sig, "hex"),
    Buffer.from(expectedSig.slice(0, 32), "hex")
  );

  if (!sigMatch) {
    return { isValid: false, reason: "Attestation signature mismatch (host or layer parameters modified)" };
  }

  return {
    isValid: true,
    extractedFingerprint: match[0],
  };
}
