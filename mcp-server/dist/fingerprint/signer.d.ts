import type { FiveLayerTelemetry, FingerprintEnvelope } from "./types.js";
/**
 * Derives a cryptographically signed host fingerprint envelope from the 5-layer telemetry.
 * Format: kvch-fp:v1:<timestamp>:<layers_hash>:<signature>
 */
export declare function generateHostFingerprint(secret?: string): FingerprintEnvelope;
/**
 * Signs a given FiveLayerTelemetry object into an attested FingerprintEnvelope.
 */
export declare function signTelemetry(telemetry: FiveLayerTelemetry, secret?: string): FingerprintEnvelope;
/**
 * Verifies whether an incoming request fingerprint prefix is authentic and fresh.
 */
export declare function verifyFingerprint(tokenString: string, secret?: string, maxAgeSeconds?: number): {
    isValid: boolean;
    reason?: string;
    extractedFingerprint?: string;
};
