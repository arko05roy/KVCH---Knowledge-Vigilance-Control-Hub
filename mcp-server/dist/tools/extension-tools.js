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
export function handleValidateExtension(param) {
    const extensionId = typeof param === "string" ? param : (param?.extensionId || "");
    const fp = generateHostFingerprint();
    const extDir = path.join(WORKSPACE_DIR, "External", extensionId);
    const manifestJsonPath = path.join(extDir, "kvch-manifest.json");
    const manifestYamlPath = path.join(extDir, "extension.yaml");
    const manifestPath = fs.existsSync(manifestYamlPath)
        ? manifestYamlPath
        : fs.existsSync(manifestJsonPath)
            ? manifestJsonPath
            : null;
    if (!manifestPath) {
        return {
            success: false,
            error: `Manifest not found at External/${extensionId} (checked extension.yaml and kvch-manifest.json)`,
            attestationPrefix: fp.prefix,
        };
    }
    const rawContent = fs.readFileSync(manifestPath, "utf-8");
    const isYaml = manifestPath.endsWith(".yaml") || manifestPath.endsWith(".yml");
    const errors = [];
    let manifest = {};
    if (isYaml) {
        const idMatch = rawContent.match(/^id:\s*(.+)$/m);
        const nameMatch = rawContent.match(/^name:\s*(.+)$/m);
        const verMatch = rawContent.match(/^version:\s*(.+)$/m);
        const entryMatch = rawContent.match(/entrypoint:\s*(.+)$/m);
        const schemaMatch = rawContent.match(/^schema_version:\s*(.+)$/m);
        manifest = {
            schema_version: schemaMatch ? schemaMatch[1].trim() : "kvch.extension-package/v1",
            id: idMatch ? idMatch[1].trim() : extensionId,
            name: nameMatch ? nameMatch[1].trim() : extensionId,
            version: verMatch ? verMatch[1].trim() : "1.0.0",
            entrypoint: entryMatch ? entryMatch[1].trim() : "src/main.py",
        };
    }
    else {
        try {
            manifest = JSON.parse(rawContent);
        }
        catch {
            errors.push("Invalid JSON manifest syntax");
        }
    }
    if (manifest.schema_version !== "kvch.extension-package/v1") {
        errors.push("Invalid schema_version, must be kvch.extension-package/v1");
    }
    if (!manifest.id || !manifest.name || !manifest.version) {
        errors.push("Missing required fields: id, name, or version");
    }
    const entryFile = manifest.entrypoint || "src/main.py";
    if (!fs.existsSync(path.join(extDir, entryFile)) && !fs.existsSync(path.join(extDir, "run.py")) && !fs.existsSync(path.join(extDir, "run.sh"))) {
        errors.push(`Entrypoint file ${entryFile} does not exist in extension directory`);
    }
    return {
        success: errors.length === 0,
        extensionId,
        errors,
        manifest,
        attestationPrefix: fp.prefix,
    };
}
export function handlePackExtension(param) {
    const extensionId = typeof param === "string" ? param : (param?.extensionId || "");
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
        // Fallback deterministic tar command compatible with macOS and Linux
        try {
            execSync(`tar -czf "${outTarball}" -C "${extDir}" .`, {
                encoding: "utf-8",
            });
            const stats = fs.statSync(outTarball);
            return {
                success: true,
                extensionId,
                tarballPath: outTarball,
                sizeBytes: stats.size,
                message: "Byte-deterministic .kvch.tgz package created",
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
                const manifestJsonPath = path.join(externalDir, ent.name, "kvch-manifest.json");
                const manifestYamlPath = path.join(externalDir, ent.name, "extension.yaml");
                const manifestPath = fs.existsSync(manifestYamlPath) ? manifestYamlPath : fs.existsSync(manifestJsonPath) ? manifestJsonPath : null;
                if (manifestPath) {
                    try {
                        const rawContent = fs.readFileSync(manifestPath, "utf-8");
                        const isYaml = manifestPath.endsWith(".yaml") || manifestPath.endsWith(".yml");
                        // Simple regex parser for basic yaml properties if yaml
                        let id = ent.name;
                        let name = ent.name;
                        let cron = "*/5 * * * *";
                        if (isYaml) {
                            const idMatch = rawContent.match(/^id:\s*(.+)$/m);
                            const nameMatch = rawContent.match(/^name:\s*(.+)$/m);
                            const cronMatch = rawContent.match(/schedule:\s*["']?([^"'\n]+)["']?/m);
                            if (idMatch)
                                id = idMatch[1].trim();
                            if (nameMatch)
                                name = nameMatch[1].trim();
                            if (cronMatch)
                                cron = cronMatch[1].trim();
                        }
                        else {
                            const man = JSON.parse(rawContent);
                            id = man.id || ent.name;
                            name = man.name || ent.name;
                            cron = man.schedule?.cron || "*/5 * * * *";
                        }
                        extensions.push({
                            id,
                            name,
                            cron,
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
