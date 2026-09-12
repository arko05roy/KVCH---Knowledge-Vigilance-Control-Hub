"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import type { Abi, Address } from "viem";

const ROLE_VERIFIER = BigInt(1);
const short = (a?: string) => (a ? `${a.slice(0, 10)}…${a.slice(-4)}` : "—");

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
    address: councilAddress, abi: councilAbi, functionName: "activeSetId", chainId,
  });
  const activeSet = (activeSetQ.data as bigint | undefined) ?? BigInt(0);

  const isVerifierQ = useReadContract({
    address: councilAddress, abi: councilAbi, functionName: "isActiveMember",
    args: [activeSet, address ?? "0x0000000000000000000000000000000000000000", ROLE_VERIFIER],
    chainId, query: { enabled: isConnected && activeSet > BigInt(0) },
  });
  const isVerifier = Boolean(isVerifierQ.data);
  const wrongChain = isConnected && chain?.id !== chainId;

  // Returning user: pick up an existing seat request for this wallet.
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
    setBusy(true); setError("");
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

  const showForm = isConnected && !isVerifier && lookupDone && (!currentRequest || currentRequest.status === "rejected");

  return (
    <main className="mx-auto max-w-xl p-8 font-mono text-sm">
      <Link href="/zk/join" className="text-sky-400">← choose a role</Link>
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Become a verifier</h1>
        <ConnectButton />
      </div>
      <p className="mb-6 mt-2 text-neutral-500">
        Verifiers independently re-verify UltraHonk proofs off-chain and sign EIP-712
        attestations. The council accepts claims when M-of-N approve.
      </p>

      {wrongChain && (
        <p className="mb-4 border border-amber-700 p-3 text-amber-500">
          wallet is on chain {chain?.id} — switch to chain {chainId} to check membership
        </p>
      )}

      {!isConnected && (
        <p className="border border-neutral-700 p-4 text-neutral-400">
          connect the wallet you want to attest with — it becomes your on-chain identity
        </p>
      )}

      {isConnected && isVerifier && (
        <div className="border border-green-800 p-4">
          <p className="text-green-400">you&apos;re an active council verifier</p>
          <p className="mt-1 text-neutral-500">{short(address)} — duties: proof re-verification, attestation signing</p>
          <Link className="mt-2 inline-block text-sky-400 underline" href="/zk/council">
            open council dashboard →
          </Link>
        </div>
      )}

      {isConnected && !isVerifier && currentRequest && currentRequest.status !== "rejected" && (
        <div className="border border-sky-800 p-4">
          <p className="text-sky-400">
            seat request {currentRequest.status}
            {currentRequest.councilSetId ? ` — included in council set ${currentRequest.councilSetId}` : ""}
          </p>
          <p className="mt-1 text-neutral-500">
            {currentRequest.status === "approved"
              ? "Your key was registered in a new council set — it activates after the on-chain delay. This page recognizes you automatically once active."
              : "Governance will see your request on the council dashboard and can include your key in the next council set."}
          </p>
          <Link className="mt-2 inline-block text-sky-400 underline" href="/zk/council">
            watch council dashboard →
          </Link>
        </div>
      )}

      {showForm && (
        <div className="space-y-4">
          {currentRequest?.status === "rejected" && (
            <p className="border border-red-900 p-3 text-red-400">
              a previous request from this wallet was declined — you can request again
            </p>
          )}
          <p className="border border-neutral-700 p-4 text-neutral-400">
            {short(address)} is not in the active council set. Request a seat —
            governance includes your key in the next registered set.
          </p>
          <label className="block">
            <span className="text-neutral-500">organization / name (optional)</span>
            <input
              className="mt-1 w-full border border-neutral-700 bg-transparent px-3 py-2"
              placeholder="Verifier Co"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-neutral-500">why should we trust you? (optional)</span>
            <textarea
              className="mt-1 w-full border border-neutral-700 bg-transparent px-3 py-2"
              rows={3}
              placeholder="infra you run, jurisdiction, independence statement…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button
            className="w-full border border-sky-600 px-4 py-2 text-sky-400 disabled:opacity-40"
            disabled={busy || wrongChain}
            onClick={requestSeat}
          >
            {busy ? "requesting…" : "request council seat"}
          </button>
          <p className="text-neutral-600">
            requesting a seat does not change the council — a governor must register a
            new set containing your key, then an activation delay applies.
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-red-400">{error}</p>}
    </main>
  );
}
