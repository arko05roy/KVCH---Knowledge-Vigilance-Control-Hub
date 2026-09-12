import assert from "node:assert/strict";
import test from "node:test";
import { getHardwareFingerprint, signHardwareFingerprint, verifyHardwareProfile, verifyHardwareSignature } from "./hardware.js";

test("hardware fingerprint generates valid telemetry and format", () => {
  const { fingerprint, telemetry } = getHardwareFingerprint();
  assert.ok(fingerprint.startsWith("kvch-hw-v1:"));
  assert.ok(telemetry.cpuHash.length > 0);
  assert.ok(telemetry.systemArch.length > 0);
  assert.ok(telemetry.salt.length > 0);
});

test("hardware signature signing and verification timing-safe match", () => {
  const { fingerprint } = getHardwareFingerprint();
  const artifactSha = "a".repeat(64);
  const signature = signHardwareFingerprint(fingerprint, artifactSha, "test-secret-key");

  assert.equal(verifyHardwareSignature(fingerprint, artifactSha, signature, "test-secret-key"), true);
  assert.equal(verifyHardwareSignature(fingerprint, "b".repeat(64), signature, "test-secret-key"), false);
  assert.equal(verifyHardwareSignature(fingerprint, artifactSha, signature, "wrong-secret-key"), false);
});

test("hardware profile authorization cross-referencing", () => {
  const { fingerprint } = getHardwareFingerprint();
  assert.equal(verifyHardwareProfile(fingerprint, ["*"]), true);
  assert.equal(verifyHardwareProfile(fingerprint, ["kvch-hw-v1:*"]), true);
  assert.equal(verifyHardwareProfile(fingerprint, [fingerprint]), true);
  assert.equal(verifyHardwareProfile(fingerprint, ["kvch-hw-v1:unauthorized"]), false);
});
