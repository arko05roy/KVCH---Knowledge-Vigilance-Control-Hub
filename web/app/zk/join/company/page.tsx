"use client";

import { useState } from "react";
import Link from "next/link";

const KINDS = [
  ["threat", "Threat eligibility — prove a finding meets the disclosure threshold"],
  ["risk", "Stakeholder risk band — prove a band without revealing the score"],
  ["inclusion", "Evidence inclusion — prove an item sits in a committed set"],
] as const;

const SLUG = /^[a-z0-9][a-z0-9-]{1,62}$/;

export default function JoinCompanyPage() {
  const [companyCode, setCompanyCode] = useState("");
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<string>("threat");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState<{ id: string; status: string } | null>(null);
  const [job, setJob] = useState<{ id: string; status: string } | null>(null);

  const slugOk = SLUG.test(companyCode);

  async function register() {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/zk/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "company", companyCode, label }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "registration failed");
      setRegistered(d.request);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function firstClaim() {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/zk/proof-jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          claimKind: kind,
          companyId: `company-${companyCode}`,
          idempotencyKey: `onboard:${companyCode}:${kind}`,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "job creation failed");
      setJob(d.job);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const step = job ? 3 : registered ? 2 : 1;

  return (
    <main className="mx-auto max-w-xl p-8 font-mono text-sm">
      <Link href="/zk/join" className="text-sky-400">← choose a role</Link>
      <h1 className="mb-2 mt-6 text-xl font-bold">Register your company</h1>
      <p className="mb-4 text-neutral-500">
        Companies publish minimized, ZK-proven claims — the council verifies them and
        only the claim header is anchored on-chain. Findings never leave your side.
      </p>

      <ol className="mb-8 flex gap-2 text-neutral-600">
        {["register", "first claim", "anchored"].map((s, i) => (
          <li key={s} className={step > i ? "text-sky-400" : ""}>
            {i + 1}. {s}{i < 2 ? " →" : ""}
          </li>
        ))}
      </ol>

      {!registered && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-neutral-500">company code — your public identifier</span>
            <input
              className="mt-1 w-full border border-neutral-700 bg-transparent px-3 py-2"
              placeholder="acme-security"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value.trim().toLowerCase())}
            />
            <span className="text-neutral-600">
              lowercase letters, numbers, hyphens — e.g. <span className="text-neutral-400">acme-01</span>.
              Visible on-chain; reveals nothing about your findings.
            </span>
          </label>
          <label className="block">
            <span className="text-neutral-500">display name (optional)</span>
            <input
              className="mt-1 w-full border border-neutral-700 bg-transparent px-3 py-2"
              placeholder="Acme Security Ltd"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>
          <button
            className="w-full border border-sky-600 px-4 py-2 text-sky-400 disabled:opacity-40"
            disabled={busy || !slugOk}
            onClick={register}
          >
            {busy ? "registering…" : "register company"}
          </button>
          {companyCode && !slugOk && (
            <p className="text-amber-500">code must be 2–63 chars: lowercase letters, numbers, hyphens</p>
          )}
        </div>
      )}

      {registered && !job && (
        <div className="space-y-4">
          <p className="text-green-400">
            ✓ registered — <span className="text-neutral-400">{companyCode}</span>
            {registered.status === "pending" ? " (request pending)" : ""}
          </p>
          <p className="text-neutral-500">Prove your first minimized claim:</p>
          <select
            className="w-full border border-neutral-700 bg-black px-3 py-2"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button
            className="w-full border border-sky-600 px-4 py-2 text-sky-400 disabled:opacity-40"
            disabled={busy}
            onClick={firstClaim}
          >
            {busy ? "starting proof job…" : "prove & anchor first claim"}
          </button>
        </div>
      )}

      {job && (
        <div className="space-y-4">
          <p className="text-green-400">✓ proof job started — {job.status}</p>
          <div className="border border-neutral-800 p-4 text-neutral-500">
            <p className="mb-2 text-neutral-300">what happens next</p>
            <ul className="list-inside list-disc space-y-1">
              <li>the worker generates the UltraHonk proof inside the prover boundary</li>
              <li>council verifiers re-verify it and sign attestations</li>
              <li>once M-of-N approve, the minimized claim header anchors on-chain</li>
            </ul>
          </div>
          <div className="flex gap-4">
            <Link className="text-sky-400 underline" href={`/api/zk/proof-jobs/${job.id}`}>job status</Link>
            <Link className="text-sky-400 underline" href="/zk">dashboard</Link>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-red-400">{error}</p>}
    </main>
  );
}
