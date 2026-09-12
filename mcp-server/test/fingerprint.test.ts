import test from "node:test";
import assert from "node:assert/strict";
import { probeFiveLayers } from "../src/fingerprint/probe.js";
import { generateHostFingerprint, verifyFingerprint } from "../src/fingerprint/signer.js";
import { globalVault } from "../src/store/memory-vault.js";
import { handleGetSecurityReports } from "../src/tools/report-tools.js";

test("5-Layer Telemetry Probe extracts non-empty layer profiles", () => {
  const telemetry = probeFiveLayers();

  // Layer 1: OS
  assert.ok(telemetry.layer1_os.platform, "OS platform must be present");
  assert.ok(telemetry.layer1_os.release, "OS release must be present");
  assert.ok(telemetry.layer1_os.hardwareUuid, "Hardware UUID must be present");

  // Layer 2: Network
  assert.ok(telemetry.layer2_network.primaryInterface, "Primary interface must be present");
  assert.ok(telemetry.layer2_network.localIp, "Local IP must be present");

  // Layer 3: Transport
  assert.ok(typeof telemetry.layer3_transport.socketCount === "number", "Socket count must be numeric");
  assert.ok(telemetry.layer3_transport.activeSocketsHash, "Socket hash must be computed");

  // Layer 4: Presentation
  assert.ok(telemetry.layer4_presentation.sslVersion, "SSL version must be present");
  assert.ok(telemetry.layer4_presentation.cryptoCurvesHash, "Curves hash must be present");

  // Layer 5: Memory
  assert.ok(telemetry.layer5_memory.totalMemoryBytes > 0, "Memory must be greater than 0");
  assert.ok(telemetry.layer5_memory.memorySignature, "Memory signature must be computed");
});

test("Host fingerprint derives attested HMAC signature format", () => {
  const fp = generateHostFingerprint("test-secret-key-12345");
  assert.ok(fp.fingerprint.startsWith("kvch-fp:v1:"), "Fingerprint must start with kvch-fp:v1:");
  assert.ok(fp.prefix.startsWith("[KVCH-FP:kvch-fp:v1:"), "Prefix must format correctly");
  assert.equal(fp.isValid, true, "Fingerprint envelope must be valid");
});

test("VerifyFingerprint succeeds with authentic token and fails on tampering", () => {
  const secret = "test-secret-key-12345";
  const fp = generateHostFingerprint(secret);

  const verification = verifyFingerprint(fp.fingerprint, secret);
  assert.equal(verification.isValid, true, "Valid fingerprint must verify successfully");

  // Tampered token test
  const tampered = fp.fingerprint.replace(/kvch-fp:v1:([0-9]+)/, "kvch-fp:v1:9999999999");
  const failed = verifyFingerprint(tampered, secret);
  assert.equal(failed.isValid, false, "Tampered fingerprint must fail verification");
});

test("FingerprintIndexedVault enforces prefix match on retrieval", () => {
  const callerFp = generateHostFingerprint();
  globalVault.store("rec-1", "test", { secret: "kvch-secret-payload" }, callerFp.prefix);

  // Retrieval with correct prefix succeeds
  const successRes = globalVault.get("rec-1", callerFp.prefix);
  assert.equal(successRes.success, true);
  assert.deepEqual(successRes.data, { secret: "kvch-secret-payload" });

  // Retrieval with foreign/tampered prefix fails with 403 Forbidden
  const forbiddenRes = globalVault.get("rec-1", "[KVCH-FP:kvch-fp:v1:12345:fakehash:fakesig]");
  assert.equal(forbiddenRes.success, false);
  assert.ok(forbiddenRes.error?.includes("403 FORBIDDEN"), "Must return 403 Forbidden on fingerprint mismatch");
});

test("handleGetSecurityReports returns report when fingerprint prefix matches", () => {
  const currentFp = generateHostFingerprint();
  const res = handleGetSecurityReports({ role: "sr-dev", format: "json", fingerprintPrefix: currentFp.prefix });
  assert.equal(res.success, true, "Should return security report for matching fingerprint prefix");
  assert.ok(res.content, "Report content must be populated");
});
