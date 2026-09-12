import crypto from "node:crypto";
import { TelemetryIntegrity } from "./types";

/**
 * Message-Level Event Signature Verifier & Agent Liveness Monitor (Section 7)
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
