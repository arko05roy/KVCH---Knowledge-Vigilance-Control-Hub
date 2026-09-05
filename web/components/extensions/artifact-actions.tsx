"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Rocket } from "lucide-react";

export function ArtifactActions({ artifactId, state, deployment }: { artifactId: string; state: string; deployment?: { id: string; status: string } }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"evaluate" | "deploy">();
  const [error, setError] = useState<string>();
  async function invoke(action: "evaluate" | "deploy") {
    setBusy(action); setError(undefined);
    const response = await fetch(`/api/extensions/${artifactId}/${action}`, { method: "POST" });
    const payload = await response.json() as { error?: string };
    setBusy(undefined);
    if (!response.ok) { setError(payload.error ?? `${action} failed`); return; }
    router.refresh();
  }
  async function deploymentAction(action: "pause" | "resume") {
    if (!deployment) return;
    setBusy("deploy"); setError(undefined);
    const response = await fetch(`/api/extensions/${artifactId}/deployments/${deployment.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const payload = await response.json() as { error?: string };
    setBusy(undefined);
    if (!response.ok) { setError(payload.error ?? `${action} failed`); return; }
    router.refresh();
  }
  return <div className="flex flex-wrap items-center gap-2">
    {(state === "uploaded" || state === "evaluation_failed") && <button onClick={() => invoke("evaluate")} disabled={!!busy} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#c9d6ff] px-3 text-sm font-semibold text-[#11182b] disabled:opacity-60"><Play size={15} />{busy === "evaluate" ? "Queued…" : state === "evaluation_failed" ? "Retry evaluation" : "Evaluate artifact"}</button>}
    {state === "deployable" && <button onClick={() => invoke("deploy")} disabled={!!busy} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#a6efca] px-3 text-sm font-semibold text-[#102518] disabled:opacity-60"><Rocket size={15} />{busy === "deploy" ? "Deploying…" : "Deploy schedule"}</button>}
    {deployment?.status === "active" && <button onClick={() => deploymentAction("pause")} disabled={!!busy} className="inline-flex h-9 items-center rounded-lg border border-[#556176] px-3 text-sm font-medium text-[#d0d8e7] disabled:opacity-60">Pause deployment</button>}
    {deployment?.status === "paused" && <button onClick={() => deploymentAction("resume")} disabled={!!busy} className="inline-flex h-9 items-center rounded-lg border border-[#658c76] px-3 text-sm font-medium text-[#b9eacb] disabled:opacity-60">Resume deployment</button>}
    {error && <p role="alert" className="basis-full text-sm text-[#ff9d9d]">{error}</p>}
  </div>;
}
