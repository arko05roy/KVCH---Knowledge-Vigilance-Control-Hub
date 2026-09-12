import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { generateHostFingerprint } from "../fingerprint/signer.js";
import { globalVault } from "../store/memory-vault.js";
const WORKSPACE_DIR = process.env.KVCH_WORKSPACE || path.resolve(process.cwd(), "..");
export function handleCreateExtension(params) {
    const fp = generateHostFingerprint();
    const extDir = path.join(WORKSPACE_DIR, "External", params.id);
    if (fs.existsSync(extDir)) {
        return {
            success: false,
            error: `Extension directory already exists: External/${params.id}`,
            attestationPrefix: fp.prefix,
        };
    }
    fs.mkdirSync(extDir, { recursive: true });
    const manifest = {
        schema_version: "kvch.extension-package/v1",
        id: params.id,
        name: params.name,
        version: params.version || "0.1.0",
        description: params.description,
        schedule: {
            cron: params.cronSchedule || "*/5 * * * *",
            timeout_seconds: 30,
        },
        sandbox: {
            network: "host",
            isolated: true,
            allowed_paths: ["/tmp", "/var/log"],
        },
        entrypoint: params.primaryLanguage === "python" ? "run.py" : "run.sh",
    };
    fs.writeFileSync(path.join(extDir, "kvch-manifest.json"), JSON.stringify(manifest, null, 2));
    let runCode = "";
    if (params.primaryLanguage === "python") {
        runCode = `#!/usr/bin/env python3
# KVCH Extension: ${params.name} (${params.id})
# Attested Host: ${fp.fingerprint}
import json
import sys

def main():
    finding = {
        "schema_version": "kvch.finding/v1",
        "title": "${params.name} Active Inspection",
        "severity": "info",
        "category": "${params.id.replace(/-/g, "_")}",
        "summary": "Automated security probe executed clean.",
        "indicators": []
    }
    print(json.dumps(finding))

if __name__ == "__main__":
    main()
`;
        fs.writeFileSync(path.join(extDir, "run.py"), runCode);
        fs.chmodSync(path.join(extDir, "run.py"), 0o755);
    }
    else {
        runCode = `#!/usr/bin/env bash
# KVCH Extension: ${params.name} (${params.id})
# Attested Host: ${fp.fingerprint}
echo '{"schema_version":"kvch.finding/v1","title":"${params.name}","severity":"info","indicators":[]}'
`;
        fs.writeFileSync(path.join(extDir, "run.sh"), runCode);
        fs.chmodSync(path.join(extDir, "run.sh"), 0o755);
    }
    // Index in vault with fingerprint prefix
    globalVault.store(params.id, "extension", manifest, fp.prefix);
    return {
        success: true,
        message: `Extension ${params.id} scaffolded successfully in External/${params.id}`,
        manifestPath: path.join(extDir, "kvch-manifest.json"),
        attestationPrefix: fp.prefix,
    };
}
export function handleValidateExtension(extensionId) {
    const fp = generateHostFingerprint();
    const extDir = path.join(WORKSPACE_DIR, "External", extensionId);
    const manifestPath = path.join(extDir, "kvch-manifest.json");
    if (!fs.existsSync(manifestPath)) {
        return {
            success: false,
            error: `Manifest not found at External/${extensionId}/kvch-manifest.json`,
            attestationPrefix: fp.prefix,
        };
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const errors = [];
    if (manifest.schema_version !== "kvch.extension-package/v1") {
        errors.push("Invalid schema_version, must be kvch.extension-package/v1");
    }
    if (!manifest.id || !manifest.name || !manifest.version) {
        errors.push("Missing required fields: id, name, or version");
    }
    if (!manifest.entrypoint || !fs.existsSync(path.join(extDir, manifest.entrypoint))) {
        errors.push(`Entrypoint file ${manifest.entrypoint} does not exist in extension directory`);
    }
    return {
        success: errors.length === 0,
        extensionId,
        errors,
        manifest,
        attestationPrefix: fp.prefix,
    };
}
export function handlePackExtension(extensionId) {
    const fp = generateHostFingerprint();
    const extDir = path.join(WORKSPACE_DIR, "External", extensionId);
    const artifactsDir = path.join(WORKSPACE_DIR, "External", "artifacts");
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }
    const outTarball = path.join(artifactsDir, `${extensionId}.kvch.tgz`);
    try {
        // Invoke kvch-extension deterministic packaging CLI
        execSync(`npx kvch-extension pack "${extDir}" --out "${outTarball}"`, {
            cwd: path.join(WORKSPACE_DIR, "kvch-extension"),
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "pipe"],
        });
        const stats = fs.statSync(outTarball);
        return {
            success: true,
            extensionId,
            tarballPath: outTarball,
            sizeBytes: stats.size,
            message: "Byte-deterministic .kvch.tgz package created (1970-01-01 mtime, canonical sorting)",
            attestationPrefix: fp.prefix,
        };
    }
    catch (err) {
        // Fallback deterministic tar command if CLI is not locally built
        try {
            execSync(`tar --sort=name --mtime='1970-01-01 00:00:00Z' --owner=0 --group=0 --numeric-owner -czf "${outTarball}" -C "${extDir}" .`, {
                encoding: "utf-8",
            });
            const stats = fs.statSync(outTarball);
            return {
                success: true,
                extensionId,
                tarballPath: outTarball,
                sizeBytes: stats.size,
                message: "Packaged via fallback deterministic tarball format",
                attestationPrefix: fp.prefix,
            };
        }
        catch (fallbackErr) {
            return {
                success: false,
                error: `Packaging failed: ${err.message || fallbackErr.message}`,
                attestationPrefix: fp.prefix,
            };
        }
    }
}
export function handleListExtensions() {
    const fp = generateHostFingerprint();
    const externalDir = path.join(WORKSPACE_DIR, "External");
    const extensions = [];
    if (fs.existsSync(externalDir)) {
        const entries = fs.readdirSync(externalDir, { withFileTypes: true });
        for (const ent of entries) {
            if (ent.isDirectory() && !["venv", "artifacts", "fixtures", "reports", "utils", "extensions", "edr_daemon"].includes(ent.name)) {
                const manifestPath = path.join(externalDir, ent.name, "kvch-manifest.json");
                if (fs.existsSync(manifestPath)) {
                    try {
                        const man = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
                        extensions.push({
                            id: man.id || ent.name,
                            name: man.name || ent.name,
                            cron: man.schedule?.cron || "*/5 * * * *",
                            path: `External/${ent.name}`,
                        });
                    }
                    catch {
                        extensions.push({ id: ent.name, name: ent.name, cron: "unknown", path: `External/${ent.name}` });
                    }
                }
            }
        }
    }
    return {
        success: true,
        count: extensions.length,
        extensions,
        attestationPrefix: fp.prefix,
    };
}
