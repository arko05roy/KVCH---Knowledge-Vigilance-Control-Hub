import { cpus, arch, networkInterfaces, hostname, platform, release, type } from "node:os";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export interface HardwareTelemetry {
  cpuHash: string;
  systemArch: string;
  platform: string;
  hostnameHash: string;
  macHash: string;
  salt: string;
}

export interface CryptographicHardwareBinding {
  hardwareFingerprint: string;
  signature: string;
  artifactSha256: string;
  telemetry: HardwareTelemetry;
}

/**
 * Queries local hardware telemetry (CPU microarchitecture, OS platform, MAC addresses, hostname)
 * and constructs a unique, cryptographically salted hardware fingerprint string (kvch-hw-v1:<hash>).
 */
export function getHardwareFingerprint(): { fingerprint: string; telemetry: HardwareTelemetry } {
  const cpuList = cpus() || [];
  const cpuInfo = cpuList.map((cpu) => `${cpu.model}:${cpu.speed}`).join(";");
  const cpuHash = createHash("sha256").update(cpuInfo || "cpu-microarchitecture-unknown").digest("hex");
  const sysArch = `${arch()}:${platform()}:${type()}:${release()}`;

  const nets = networkInterfaces();
  const macs: string[] = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.mac && net.mac !== "00:00:00:00:00:00") {
        macs.push(net.mac.toLowerCase());
      }
    }
  }
  const macHash = createHash("sha256").update(macs.sort().join(",") || "mac-interface-unknown").digest("hex");
  const hostHash = createHash("sha256").update(hostname() || "host-unknown").digest("hex");

  // Hardware salt derived from hardware characteristics
  const salt = createHash("sha256").update(`salt:${cpuHash}:${macHash}:${sysArch}`).digest("hex").slice(0, 16);

  const rawFingerprint = `kvch-hw-v1:${cpuHash}:${sysArch}:${macHash}:${hostHash}:${salt}`;
  const fingerprintHash = createHash("sha256").update(rawFingerprint).digest("hex");
  const fingerprint = `kvch-hw-v1:${fingerprintHash}`;

  return {
    fingerprint,
    telemetry: {
      cpuHash,
      systemArch: sysArch,
      platform: platform(),
      hostnameHash: hostHash,
      macHash,
      salt,
    },
  };
}

/**
 * Signs the hardware fingerprint and artifact SHA-256 using HMAC-SHA256
 * with an enterprise signing authority key.
 */
export function signHardwareFingerprint(
  fingerprint: string,
  artifactSha256: string,
  secretKey?: string
): string {
  const secret = secretKey || process.env.KVCH_HARDWARE_SIGNING_KEY || "kvch-enterprise-signing-authority-default-salt";
  return createHmac("sha256", secret)
    .update(`${fingerprint}:${artifactSha256}`)
    .digest("hex");
}

/**
 * Timing-safe verification of hardware fingerprint signature.
 */
export function verifyHardwareSignature(
  fingerprint: string,
  artifactSha256: string,
  signature: string,
  secretKey?: string
): boolean {
  if (!fingerprint || !artifactSha256 || !signature) return false;
  const expectedSignature = signHardwareFingerprint(fingerprint, artifactSha256, secretKey);
  const bufExpected = Buffer.from(expectedSignature, "hex");
  const bufActual = Buffer.from(signature, "hex");
  if (bufExpected.length !== bufActual.length) return false;
  return timingSafeEqual(bufExpected, bufActual);
}

/**
 * Cross-references a hardware fingerprint against an array of authorized hardware profiles or wildcards.
 */
export function verifyHardwareProfile(
  fingerprint: string,
  authorizedProfiles?: string[]
): boolean {
  if (!fingerprint) return false;
  const profiles = authorizedProfiles ||
    (process.env.KVCH_AUTHORIZED_HARDWARE_PROFILES
      ? process.env.KVCH_AUTHORIZED_HARDWARE_PROFILES.split(",").map((s) => s.trim())
      : ["*"]);

  if (profiles.includes("*") || profiles.includes("kvch-hw-v1:*")) return true;
  return profiles.includes(fingerprint);
}
