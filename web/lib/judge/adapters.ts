import "server-only";
import { spawn } from "node:child_process";
import type { ExtensionManifest } from "@arko05roy/kvch-extension";

/** Stable identity and independently versioned execution contract. */
export type AdapterKey = "typescript/node" | "python/python3";
export interface AdapterDescriptor {
  key: AdapterKey;
  version: "1";
}

// Runtime constraints are retained in the manifest. Selection identifies the
// runtime family only; the execution kernel must check the installed version.
export function selectAdapter(manifest: ExtensionManifest): AdapterDescriptor | null {
  const { language, runtime } = manifest.implementation;
  if (language === "typescript" && /^node(?:\s|$)/.test(runtime)) {
    return { key: "typescript/node", version: "1" };
  }
  if (language === "python" && /^python3?(?:\s|$)/.test(runtime)) {
    return { key: "python/python3", version: "1" };
  }
  return null;
}

export async function verifyAdapterRuntime(adapter: AdapterDescriptor, commands: { nodeCommand: string; pythonCommand: string }): Promise<void> {
  const command = adapter.key === "typescript/node" ? commands.nodeCommand : commands.pythonCommand;
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, ["--version"], { stdio: "ignore" });
    child.once("error", () => reject(new Error(`Configured ${adapter.key} executable is unavailable: ${command}`)));
    child.once("close", (code) => code === 0 ? resolve() : reject(new Error(`Configured ${adapter.key} executable failed its version check: ${command}`)));
  });
}
