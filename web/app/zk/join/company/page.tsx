"use client";

import { useState } from "react";
import Link from "next/link";
import { ZkNavHeader } from "@/components/zk-nav";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const KINDS = [
  { id: "threat", title: "Threat Eligibility", desc: "Prove finding meets disclosure threshold without revealing CVE" },
  { id: "risk", title: "Risk Band", desc: "Prove risk sits within approved band without revealing exact loss metrics" },
  { id: "inclusion", title: "Evidence Inclusion", desc: "Prove audit artifact is included in committed Merkle root" },
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
    setBusy(true);
    setError("");
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
    setBusy(true);
    setError("");
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
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] selection:bg-[#5e6ad2]/30">
      <ZkNavHeader />

      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6 space-y-6">
        
        <Link
          href="/zk/join"
          className="text-[12px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
        >
          ← Choose role
        </Link>

        <div className="space-y-1 border-b border-[#23252a] pb-4">
          <h1 className="text-xl font-semibold text-[#f7f8f8]">
            Company Registration
          </h1>
          <p className="text-[13px] text-[#8a8f98]">
            Register your company code and prove your first posture claim on Celo Sepolia.
          </p>
        </div>

        {/* Minimal Steps */}
        <div className="flex items-center gap-4 text-[12px] font-mono border-b border-[#23252a] pb-4">
          <span className={step >= 1 ? "text-[#f7f8f8] font-medium" : "text-[#62666d]"}>
            1. Register
          </span>
          <span className="text-[#34343a]">→</span>
          <span className={step >= 2 ? "text-[#f7f8f8] font-medium" : "text-[#62666d]"}>
            2. Prove Claim
          </span>
          <span className="text-[#34343a]">→</span>
          <span className={step >= 3 ? "text-[#f7f8f8] font-medium" : "text-[#62666d]"}>
            3. Finalized
          </span>
        </div>

        {/* Step 1: Form */}
        {step === 1 && (
          <div className="space-y-4 rounded-lg border border-[#23252a] bg-[#0f1011] p-5">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#8a8f98] block">
                Company Code Identifier
              </label>
              <input
                type="text"
                placeholder="acme-security"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value.trim().toLowerCase())}
                className="w-full rounded-md border border-[#23252a] bg-[#08090a] px-3 py-2 font-mono text-[13px] text-[#f7f8f8] placeholder-[#62666d] outline-none focus:border-[#5e6ad2]"
              />
              <span className="text-[11px] text-[#62666d] block font-mono">
                Lowercase letters, numbers, hyphens. Visible on-chain.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#8a8f98] block">
                Display Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Acme Security Ltd"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-md border border-[#23252a] bg-[#08090a] px-3 py-2 text-[13px] text-[#f7f8f8] placeholder-[#62666d] outline-none focus:border-[#5e6ad2]"
              />
            </div>

            {error && <p className="text-[12px] text-[#ff5555]">{error}</p>}

            <button
              disabled={busy || !slugOk}
              onClick={register}
              className="w-full rounded-md bg-[#5e6ad2] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#828fff] disabled:opacity-40 transition-colors"
            >
              {busy ? "Registering…" : "Register Company →"}
            </button>
          </div>
        )}

        {/* Step 2: Prove */}
        {step === 2 && (
          <div className="space-y-4 rounded-lg border border-[#23252a] bg-[#0f1011] p-5">
            <div className="flex items-center gap-2 text-[12px] font-mono text-[#2ea043]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Registered: {companyCode}</span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase text-[#8a8f98] block">
                Select Claim Kind
              </label>
              <div className="space-y-2">
                {KINDS.map((k) => (
                  <label
                    key={k.id}
                    onClick={() => setKind(k.id)}
                    className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                      kind === k.id
                        ? "border-[#5e6ad2] bg-[#141516]"
                        : "border-[#23252a] bg-[#08090a] hover:border-[#34343a]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="claimKind"
                      checked={kind === k.id}
                      onChange={() => setKind(k.id)}
                      className="mt-0.5 text-[#5e6ad2]"
                    />
                    <div>
                      <div className="text-[13px] font-medium text-[#f7f8f8]">{k.title}</div>
                      <div className="text-[12px] text-[#8a8f98]">{k.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-[12px] text-[#ff5555]">{error}</p>}

            <button
              disabled={busy}
              onClick={firstClaim}
              className="w-full rounded-md bg-[#5e6ad2] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#828fff] disabled:opacity-40 transition-colors"
            >
              {busy ? "Compiling UltraHonk Proof…" : "Prove & Anchor Claim →"}
            </button>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && job && (
          <div className="space-y-4 rounded-lg border border-[#23252a] bg-[#0f1011] p-5">
            <div className="flex items-center gap-2 text-[#2ea043] text-[13px] font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>Proof Job Queued</span>
            </div>
            <div className="text-[12px] font-mono text-[#8a8f98] space-y-1">
              <div>Job ID: <span className="text-[#f7f8f8]">{job.id}</span></div>
              <div>Status: <span className="text-[#2ea043]">{job.status}</span></div>
            </div>
            <div className="pt-2 flex gap-3">
              <Link
                href="/zk"
                className="rounded-md bg-[#5e6ad2] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-[#828fff] transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
