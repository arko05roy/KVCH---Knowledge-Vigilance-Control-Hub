"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBlock,
  usePublicClient,
} from "wagmi";
import type { Abi, Address } from "viem";
import { ZkNavHeader } from "@/components/zk-nav";

const ROLE_NAMES: Array<[bigint, string]> = [
  [BigInt(1), "verifier"],
  [BigInt(2), "approver"],
  [BigInt(4), "governance"],
  [BigInt(8), "dispute"],
  [BigInt(16), "emergency"],
];
const ROLE_VERIFIER = BigInt(1);

const short = (a?: string, n = 8) => (a ? `${a.slice(0, n)}…${a.slice(-4)}` : "—");

export function CouncilDashboard({
  chainId,
  councilAddress,
  claimsAddress,
  councilAbi,
  claimsAbi,
  pendingRequests,
}: {
  chainId: number;
  councilAddress: Address;
  claimsAddress: Address;
  councilAbi: Abi;
  claimsAbi: Abi;
  pendingRequests: Array<{
    id: string;
    walletAddress: string;
    label: string | null;
    note: string | null;
    createdAt: string;
  }>;
}) {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const {
    writeContract,
    writeContractAsync,
    data: txHash,
    isPending,
    error: writeError,
  } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [claimAction, setClaimAction] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [proposeBusy, setProposeBusy] = useState(false);
  const [proposeMsg, setProposeMsg] = useState("");

  const reads = useReadContracts({
    contracts: [
      { address: councilAddress, abi: councilAbi, functionName: "activeSetId", chainId },
      { address: councilAddress, abi: councilAbi, functionName: "pendingSetId", chainId },
      { address: councilAddress, abi: councilAbi, functionName: "pendingActivateAfter", chainId },
      { address: councilAddress, abi: councilAbi, functionName: "MIN_ACTIVATION_DELAY", chainId },
      { address: claimsAddress, abi: claimsAbi, functionName: "paused", chainId },
      { address: councilAddress, abi: councilAbi, functionName: "nextSetId", chainId },
    ],
  });

  const [activeSetQ, pendingSetQ, activateAfterQ, , pausedQ, nextSetQ] = reads.data ?? [];
  const nextSetId = (nextSetQ?.result as bigint | undefined) ?? BigInt(0);
  const activeSetId = (activeSetQ?.result as bigint | undefined) ?? BigInt(0);
  const pendingSetId = (pendingSetQ?.result as bigint | undefined) ?? BigInt(0);
  const activateAfter = (activateAfterQ?.result as bigint | undefined) ?? BigInt(0);
  const paused = (pausedQ?.result as boolean | undefined) ?? false;
  const activeSet = activeSetId > BigInt(0) ? activeSetId : pendingSetId;

  const memberCountQ = useReadContract({
    address: councilAddress,
    abi: councilAbi,
    functionName: "memberCount",
    args: [activeSet],
    chainId,
    query: { enabled: activeSet > BigInt(0) },
  });
  const memberCount = Number(memberCountQ.data ?? 0);

  const thresholdQ = useReadContract({
    address: councilAddress,
    abi: councilAbi,
    functionName: "thresholdFor",
    args: [activeSet, ROLE_VERIFIER],
    chainId,
    query: { enabled: activeSet > BigInt(0) },
  });
  const threshold = Number(thresholdQ.data ?? 0);

  const allThresholdsQ = useReadContracts({
    contracts: ROLE_NAMES.map(([bit]) => ({
      address: councilAddress,
      abi: councilAbi,
      functionName: "thresholdFor",
      args: [activeSet, bit],
      chainId,
    })),
    query: { enabled: activeSet > BigInt(0) },
  });

  const thresholds = useMemo(() => {
    const t = (allThresholdsQ.data ?? []).map((r) => Number(r.result ?? 0));
    return {
      verifier: t[0] ?? 0,
      approver: t[1] ?? 0,
      governance: t[2] ?? 0,
      dispute: t[3] ?? 0,
      emergency: t[4] ?? 0,
    };
  }, [allThresholdsQ.data]);

  const memberReads = useReadContracts({
    contracts: Array.from({ length: memberCount }, (_, i) => ({
      address: councilAddress,
      abi: councilAbi,
      functionName: "memberAt",
      args: [activeSet, BigInt(i)],
      chainId,
    })),
    query: { enabled: memberCount > 0 },
  });

  const members = useMemo(
    () =>
      (memberReads.data ?? [])
        .map((r) => r.result as [Address, bigint] | undefined)
        .filter((m): m is [Address, bigint] => !!m)
        .map(([key, roleMask]) => ({
          key,
          roleMask,
          roles: ROLE_NAMES.filter(([bit]) => (roleMask & bit) === bit).map(([, n]) => n),
        })),
    [memberReads.data]
  );

  const isVerifierQ = useReadContract({
    address: councilAddress,
    abi: councilAbi,
    functionName: "isActiveMember",
    args: [activeSet, address ?? "0x0000000000000000000000000000000000000000", ROLE_VERIFIER],
    chainId,
    query: { enabled: isConnected && activeSet > BigInt(0) },
  });

  const latestBlock = useBlock({ chainId, watch: true });
  const now = Number(latestBlock.data?.timestamp ?? BigInt(0));
  const activationDue =
    pendingSetId > BigInt(0) && activateAfter > BigInt(0) && now >= Number(activateAfter);
  const wrongChain = isConnected && chain?.id !== chainId;

  const call = (fn: string, args: unknown[], registry: "council" | "claims" = "council") =>
    writeContract({
      address: registry === "council" ? councilAddress : claimsAddress,
      abi: registry === "council" ? councilAbi : claimsAbi,
      functionName: fn,
      args,
      chainId,
    });

  const chosen = pendingRequests.filter((r) => selected.has(r.id));

  async function proposeExpandedSet() {
    if (!publicClient || chosen.length === 0) return;
    setProposeBusy(true);
    setProposeMsg("");
    try {
      const newMembers = [
        ...members.map((m) => ({ key: m.key, roleMask: m.roleMask })),
        ...chosen
          .filter(
            (r) => !members.some((m) => m.key.toLowerCase() === r.walletAddress.toLowerCase())
          )
          .map((r) => ({ key: r.walletAddress as Address, roleMask: ROLE_VERIFIER })),
      ];
      const registerHash = await writeContractAsync({
        address: councilAddress,
        abi: councilAbi,
        functionName: "registerSet",
        args: [newMembers, thresholds, BigInt(now), BigInt(0)],
        chainId,
      });
      await publicClient.waitForTransactionReceipt({ hash: registerHash });
      const setId = nextSetId;
      const schedHash = await writeContractAsync({
        address: councilAddress,
        abi: councilAbi,
        functionName: "scheduleActivation",
        args: [setId],
        chainId,
      });
      await publicClient.waitForTransactionReceipt({ hash: schedHash });
      await Promise.all(
        chosen.map((r) =>
          fetch("/api/zk/join", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: r.id, status: "approved", councilSetId: setId.toString() }),
          })
        )
      );
      setProposeMsg(`Set ${setId} registered and activation scheduled.`);
    } catch (e) {
      setProposeMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setProposeBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] selection:bg-[#5e6ad2]/30">
      <ZkNavHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#23252a] pb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-[#f7f8f8]">
              Verification Council Governance
            </h1>
            <p className="text-[13px] text-[#8a8f98]">
              {threshold}-of-{memberCount} verifier quorum required for claim anchoring on chain {chainId}.
            </p>
          </div>
          <ConnectButton showBalance={false} />
        </div>

        {wrongChain && (
          <div className="rounded-md border border-[#ff9900]/30 bg-[#ff9900]/10 p-3 text-[12.5px] text-[#ff9900]">
            Wallet on chain {chain?.id}. Switch to chain {chainId} to sign governance calls.
          </div>
        )}

        {/* Minimal Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#23252a] rounded-lg border border-[#23252a] bg-[#0f1011]">
          <div className="p-4 space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#8a8f98]">Active Set</span>
            <div className="text-xl font-semibold font-mono text-[#f7f8f8]">
              {activeSetId > BigInt(0) ? `#${activeSetId.toString()}` : "None"}
            </div>
            <p className="text-[11px] text-[#62666d]">{memberCount} verifiers</p>
          </div>
          <div className="p-4 space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#8a8f98]">Pending Set</span>
            <div className="text-xl font-semibold font-mono text-[#f7f8f8]">
              {pendingSetId > BigInt(0) ? `#${pendingSetId.toString()}` : "None"}
            </div>
            <p className="text-[11px] text-[#62666d]">
              {activationDue ? "Ready to activate" : "No pending set"}
            </p>
          </div>
          <div className="p-4 space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#8a8f98]">Ingestion Gateway</span>
            <div className={`text-xl font-semibold font-mono ${paused ? "text-[#ff5555]" : "text-[#2ea043]"}`}>
              {paused ? "PAUSED" : "ACTIVE"}
            </div>
            <p className="text-[11px] text-[#62666d]">Submissions status</p>
          </div>
          <div className="p-4 space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#8a8f98]">Your Role</span>
            <div className="text-xl font-semibold font-mono text-[#f7f8f8]">
              {isConnected ? (isVerifierQ.data ? "Verifier" : "Observer") : "—"}
            </div>
            <p className="text-[11px] text-[#62666d] font-mono">{isConnected ? short(address, 6) : "Disconnected"}</p>
          </div>
        </div>

        {/* Council Members Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-medium text-[#f7f8f8]">
              Active Council Members ({members.length})
            </h2>
            <span className="text-[11px] font-mono text-[#8a8f98]">
              Quorum: {threshold} of {memberCount}
            </span>
          </div>

          <div className="rounded-lg border border-[#23252a] bg-[#0f1011] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-[#23252a] text-[11px] font-mono uppercase text-[#8a8f98]">
                    <th className="py-2.5 px-4">Address</th>
                    <th className="py-2.5 px-4">Roles</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18191a]">
                  {members.map((m) => {
                    const isYou = address?.toLowerCase() === m.key.toLowerCase();
                    return (
                      <tr key={m.key} className="hover:bg-[#141516]/50 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-[12px] text-[#f7f8f8]">
                          {m.key}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-[#8a8f98]">
                          {m.roles.join(", ") || "verifier"}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-[11px]">
                          {isYou ? (
                            <span className="text-[#2ea043] font-semibold">You</span>
                          ) : (
                            <span className="text-[#62666d]">Active</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-[#8a8f98] text-[13px]">
                        No active members.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Seat Applications */}
        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-medium text-[#f7f8f8]">
                Seat Requests ({pendingRequests.length})
              </h2>
              <span className="text-[11px] font-mono text-[#8a8f98]">
                {chosen.length} selected
              </span>
            </div>

            <div className="rounded-lg border border-[#23252a] bg-[#0f1011] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#23252a] text-[11px] font-mono uppercase text-[#8a8f98]">
                      <th className="py-2 px-3 w-8" />
                      <th className="py-2.5 px-4">Wallet</th>
                      <th className="py-2.5 px-4">Label</th>
                      <th className="py-2.5 px-4">Note</th>
                      <th className="py-2.5 px-4 text-right" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#18191a]">
                    {pendingRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-[#141516]/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            checked={selected.has(r.id)}
                            onChange={(e) => {
                              const s = new Set(selected);
                              if (e.target.checked) s.add(r.id);
                              else s.delete(r.id);
                              setSelected(s);
                            }}
                            className="rounded border-[#23252a] bg-[#0c0d0e] text-[#5e6ad2]"
                          />
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[12px] text-[#f7f8f8]">
                          {r.walletAddress}
                        </td>
                        <td className="py-2.5 px-4 text-[#d0d6e0] text-[12.5px]">{r.label ?? "—"}</td>
                        <td className="py-2.5 px-4 text-[#8a8f98] text-[12px] max-w-xs truncate">{r.note ?? "—"}</td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={async () => {
                              await fetch("/api/zk/join", {
                                method: "PATCH",
                                headers: { "content-type": "application/json" },
                                body: JSON.stringify({ id: r.id, status: "rejected" }),
                              });
                              location.reload();
                            }}
                            className="text-[12px] text-[#ff5555] hover:underline"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-[#23252a] p-3 flex items-center justify-between">
                <span className="text-[12px] text-[#8a8f98]">
                  Proposes Set #{nextSetId.toString()} with selected verifiers.
                </span>
                <button
                  disabled={!isConnected || proposeBusy || chosen.length === 0}
                  onClick={proposeExpandedSet}
                  className="rounded-md bg-[#5e6ad2] px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-[#828fff] disabled:opacity-40 transition-colors"
                >
                  {proposeBusy ? "Proposing…" : `Propose Set #${nextSetId.toString()} (${chosen.length} new)`}
                </button>
              </div>
            </div>

            {proposeMsg && <p className="text-[12px] text-[#8a8f98]">{proposeMsg}</p>}
          </div>
        )}

        {/* Governance Controls */}
        <div className="space-y-3">
          <h2 className="text-[14px] font-medium text-[#f7f8f8]">Governance Actions</h2>
          <div className="rounded-lg border border-[#23252a] bg-[#0f1011] p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                disabled={!isConnected || isPending || !activationDue}
                onClick={() => call("activatePendingSet", [])}
                className="rounded-md border border-[#23252a] bg-[#141516] px-3 py-1.5 text-[12.5px] text-[#f7f8f8] hover:bg-[#18191a] disabled:opacity-40 transition-colors"
              >
                Activate Pending Set{!activationDue && pendingSetId > BigInt(0) ? " (Delay Active)" : ""}
              </button>

              <button
                disabled={!isConnected || isPending}
                onClick={() => call(paused ? "unpause" : "pause", [], "claims")}
                className="rounded-md border border-[#23252a] bg-[#141516] px-3 py-1.5 text-[12.5px] text-[#f7f8f8] hover:bg-[#18191a] disabled:opacity-40 transition-colors"
              >
                {paused ? "Resume Submissions" : "Emergency Pause Submissions"}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#18191a]">
              <input
                type="text"
                placeholder="0x... (32-byte claim ID to revoke)"
                value={claimAction}
                onChange={(e) => setClaimAction(e.target.value)}
                className="w-80 rounded-md border border-[#23252a] bg-[#08090a] px-3 py-1.5 font-mono text-[12px] text-[#f7f8f8] placeholder-[#62666d] outline-none focus:border-[#ff5555]"
              />
              <button
                disabled={!isConnected || isPending || !/^0x[0-9a-fA-F]{64}$/.test(claimAction)}
                onClick={() => call("revokeClaim", [claimAction, 1], "claims")}
                className="rounded-md border border-[#ff5555]/30 bg-[#ff5555]/10 px-3 py-1.5 text-[12.5px] text-[#ff5555] hover:bg-[#ff5555]/20 disabled:opacity-40 transition-colors"
              >
                Revoke Claim
              </button>
            </div>

            {(isPending || confirming || confirmed || writeError) && (
              <div className="text-[12px] font-mono text-[#8a8f98] pt-1">
                {isPending && "Awaiting signature…"}
                {confirming && `Confirming ${short(txHash)}…`}
                {confirmed && <span className="text-[#2ea043]">Transaction confirmed: {short(txHash, 10)}</span>}
                {writeError && (
                  <span className="text-[#ff5555]">
                    {(writeError as { shortMessage?: string }).shortMessage ?? writeError.message}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
