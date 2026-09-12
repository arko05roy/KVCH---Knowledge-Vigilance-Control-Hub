"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import type { Abi, Address } from "viem";
import { ZkNavHeader } from "@/components/zk-nav";
import { CheckCircle2, ArrowRight } from "lucide-react";

const ROLE_VERIFIER = BigInt(1);
const short = (a?: string) => (a ? `${a.slice(0, 8)}…${a.slice(-4)}` : "—");

type JoinRequest = { id: string; status: string; councilSetId: string | null };

export function VerifierOnboarding({
  chainId,
  councilAddress,
  councilAbi,
}: {
  chainId: number;
  councilAddress: Address;
  councilAbi: Abi;
}) {
  const { address, isConnected, chain } = useAccount();
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [request, setRequest] = useState<JoinRequest | null>(null);
  const [fetchedFor, setFetchedFor] = useState<string | null>(null);

  const activeSetQ = useReadContract({
    address: councilAddress,
    abi: councilAbi,
    functionName: "activeSetId",
    chainId,
  });
  const activeSet = (activeSetQ.data as bigint | undefined) ?? BigInt(0);

  const isVerifierQ = useReadContract({
    address: councilAddress,
    abi: councilAbi,
    functionName: "isActiveMember",
    args: [activeSet, address ?? "0x0000000000000000000000000000000000000000", ROLE_VERIFIER],
    chainId,
    query: { enabled: isConnected && activeSet > BigInt(0) },
  });
  const isVerifier = Boolean(isVerifierQ.data);
  const wrongChain = isConnected && chain?.id !== chainId;

  // Returning user: fetch existing seat request
  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    fetch(`/api/zk/join?kind=verifier&walletAddress=${address}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setRequest(d.requests?.[0] ?? null);
        setFetchedFor(address);
      })
      .catch(() => {
        if (!cancelled) setFetchedFor(address);
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  const currentRequest = address && fetchedFor === address ? request : null;
  const lookupDone = Boolean(address) && fetchedFor === address;

  async function requestSeat() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/zk/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "verifier", walletAddress: address, label, note, chainId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "request failed");
      setRequest(d.request);
      if (address) setFetchedFor(address);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const showForm =
    isConnected &&
    !isVerifier &&
    lookupDone &&
    (!currentRequest || currentRequest.status === "rejected");

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

        <div className="flex items-center justify-between border-b border-[#23252a] pb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-[#f7f8f8]">
              Verifier Onboarding
            </h1>
            <p className="text-[13px] text-[#8a8f98]">
              Re-verify UltraHonk proofs and vote in the M-of-N consensus quorum.
            </p>
          </div>
          <ConnectButton showBalance={false} />
        </div>

        {wrongChain && (
          <div className="rounded-md border border-[#ff9900]/30 bg-[#ff9900]/10 p-3 text-[12.5px] text-[#ff9900]">
            Wallet on chain {chain?.id}. Please switch to chain {chainId}.
          </div>
        )}

        {!isConnected && (
          <div className="rounded-lg border border-[#23252a] bg-[#0f1011] p-6 text-center space-y-3">
            <p className="text-[13px] text-[#8a8f98]">
              Connect the wallet you will use for signing on-chain verifications.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        )}

        {isConnected && isVerifier && (
          <div className="rounded-lg border border-[#2ea043]/30 bg-[#0f1011] p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#2ea043] text-[13px] font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>Active Council Verifier</span>
            </div>
            <p className="text-[12px] font-mono text-[#8a8f98]">
              Key: {address} · Council Set #{activeSet.toString()}
            </p>
            <Link
              href="/zk/council"
              className="inline-flex items-center gap-1 text-[13px] text-[#828fff] hover:underline"
            >
              <span>Council Dashboard</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {isConnected && !isVerifier && currentRequest && currentRequest.status !== "rejected" && (
          <div className="rounded-lg border border-[#23252a] bg-[#0f1011] p-5 space-y-3">
            <div className="text-[13px] font-medium text-[#f7f8f8]">
              Seat Request {currentRequest.status}
              {currentRequest.councilSetId && ` (Set #${currentRequest.councilSetId})`}
            </div>
            <p className="text-[12px] text-[#8a8f98] leading-relaxed">
              {currentRequest.status === "approved"
                ? "Your address was registered in a new council set and will activate after the on-chain delay."
                : "Your seat application is queued. Council members can include your key in the next proposed set."}
            </p>
            <Link
              href="/zk/council"
              className="inline-flex items-center gap-1 text-[12px] text-[#828fff] hover:underline"
            >
              <span>Watch Council Status →</span>
            </Link>
          </div>
        )}

        {showForm && (
          <div className="space-y-4 rounded-lg border border-[#23252a] bg-[#0f1011] p-5">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#8a8f98] block">
                Wallet Address
              </label>
              <input
                type="text"
                disabled
                value={address ?? ""}
                className="w-full rounded-md border border-[#23252a] bg-[#08090a] px-3 py-2 font-mono text-[12px] text-[#8a8f98]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#8a8f98] block">
                Verifier / Organization Label
              </label>
              <input
                type="text"
                placeholder="e.g. AuditNode-01 or SecurityCorp"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-md border border-[#23252a] bg-[#08090a] px-3 py-2 text-[13px] text-[#f7f8f8] placeholder-[#62666d] outline-none focus:border-[#5e6ad2]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#8a8f98] block">
                Note (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Brief qualification or node uptime pledge"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-md border border-[#23252a] bg-[#08090a] px-3 py-2 text-[13px] text-[#f7f8f8] placeholder-[#62666d] outline-none focus:border-[#5e6ad2]"
              />
            </div>

            {error && <p className="text-[12px] text-[#ff5555]">{error}</p>}

            <button
              disabled={busy || !label.trim()}
              onClick={requestSeat}
              className="w-full rounded-md bg-[#5e6ad2] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#828fff] disabled:opacity-40 transition-colors"
            >
              {busy ? "Submitting request…" : "Submit Seat Request →"}
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
