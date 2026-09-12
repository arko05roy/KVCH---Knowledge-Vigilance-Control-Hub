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

const ROLE_NAMES: Array<[bigint, string]> = [
  [BigInt(1), "verifier"],
  [BigInt(2), "approver"],
  [BigInt(4), "governance"],
  [BigInt(8), "dispute"],
  [BigInt(16), "emergency"],
];
const ROLE_VERIFIER = BigInt(1);

const short = (a?: string) => (a ? `${a.slice(0, 8)}…${a.slice(-4)}` : "—");

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
  pendingRequests: Array<{ id: string; walletAddress: string; label: string | null; note: string | null; createdAt: string }>;
}) {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { writeContract, writeContractAsync, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } = useWaitForTransactionReceipt({ hash: txHash });
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
    address: councilAddress, abi: councilAbi, functionName: "memberCount",
    args: [activeSet], chainId, query: { enabled: activeSet > BigInt(0) },
  });
  const memberCount = Number(memberCountQ.data ?? 0);

  const thresholdQ = useReadContract({
    address: councilAddress, abi: councilAbi, functionName: "thresholdFor",
    args: [activeSet, ROLE_VERIFIER], chainId, query: { enabled: activeSet > BigInt(0) },
  });
  const threshold = Number(thresholdQ.data ?? 0);

  const allThresholdsQ = useReadContracts({
    contracts: ROLE_NAMES.map(([bit]) => ({
      address: councilAddress, abi: councilAbi, functionName: "thresholdFor",
      args: [activeSet, bit], chainId,
    })),
    query: { enabled: activeSet > BigInt(0) },
  });
  const thresholds = useMemo(() => {
    const t = (allThresholdsQ.data ?? []).map((r) => Number(r.result ?? 0));
    return { verifier: t[0] ?? 0, approver: t[1] ?? 0, governance: t[2] ?? 0, dispute: t[3] ?? 0, emergency: t[4] ?? 0 };
  }, [allThresholdsQ.data]);

  const memberReads = useReadContracts({
    contracts: Array.from({ length: memberCount }, (_, i) => ({
      address: councilAddress, abi: councilAbi, functionName: "memberAt",
      args: [activeSet, BigInt(i)], chainId,
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
    [memberReads.data],
  );

  const setInfoQ = useReadContract({
    address: councilAddress, abi: councilAbi, functionName: "setInfo",
    args: [activeSet], chainId, query: { enabled: activeSet > BigInt(0) },
  });
  const setInfo = setInfoQ.data as [bigint, bigint, boolean] | undefined;

  const isVerifierQ = useReadContract({
    address: councilAddress, abi: councilAbi, functionName: "isActiveMember",
    args: [activeSet, address ?? "0x0000000000000000000000000000000000000000", ROLE_VERIFIER],
    chainId, query: { enabled: isConnected && activeSet > BigInt(0) },
  });

  const latestBlock = useBlock({ chainId, watch: true });
  const now = Number(latestBlock.data?.timestamp ?? BigInt(0));
  const activationDue = pendingSetId > BigInt(0) && activateAfter > BigInt(0) && now >= Number(activateAfter);
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
          .filter((r) => !members.some((m) => m.key.toLowerCase() === r.walletAddress.toLowerCase()))
          .map((r) => ({ key: r.walletAddress as Address, roleMask: ROLE_VERIFIER })),
      ];
      const registerHash = await writeContractAsync({
        address: councilAddress, abi: councilAbi, functionName: "registerSet",
        args: [newMembers, thresholds, BigInt(now), BigInt(0)], chainId,
      });
      await publicClient.waitForTransactionReceipt({ hash: registerHash });
      const setId = nextSetId;
      const schedHash = await writeContractAsync({
        address: councilAddress, abi: councilAbi, functionName: "scheduleActivation",
        args: [setId], chainId,
      });
      await publicClient.waitForTransactionReceipt({ hash: schedHash });
      await Promise.all(
        chosen.map((r) =>
          fetch("/api/zk/join", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: r.id, status: "approved", councilSetId: setId.toString() }),
          }),
        ),
      );
      setProposeMsg(`set ${setId} registered + activation scheduled — anyone can activate after the delay`);
    } catch (e) {
      setProposeMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setProposeBusy(false);
    }
  }

  const row = (k: string, v: React.ReactNode) => (
    <tr className="border-b border-neutral-800" key={k}>
      <td className="py-2 pr-6 text-neutral-500">{k}</td>
      <td className="break-all py-2">{v}</td>
    </tr>
  );

  return (
    <main className="mx-auto max-w-4xl p-8 font-mono text-sm">
      <div className="flex items-center justify-between">
        <Link href="/zk" className="text-sky-400">← zk dashboard</Link>
        <ConnectButton />
      </div>

      <h1 className="mb-1 mt-6 text-xl font-bold">M-of-N Verification Council</h1>
      <p className="mb-6 text-neutral-500">
        {threshold}-of-{memberCount} verifier quorum · chain {chainId}
        {wrongChain && (
          <span className="ml-2 text-amber-400">
            — wallet on {chain?.name ?? "unknown"}; switch to the deployment chain to sign
          </span>
        )}
      </p>

      <h2 className="mb-2 font-bold">Set state</h2>
      <table className="mb-8 w-full">
        <tbody>
          {row("active set", activeSetId.toString() || "none")}
          {row("pending set", pendingSetId.toString() || "none")}
          {row(
            "pending activates",
            activateAfter > BigInt(0)
              ? `${new Date(Number(activateAfter) * 1000).toISOString()} ${activationDue ? "(due now)" : ""}`
              : "—",
          )}
          {row("validity", setInfo ? `${new Date(Number(setInfo[0]) * 1000).toISOString().slice(0, 10)} → ${setInfo[1] === BigInt(0) ? "open-ended" : new Date(Number(setInfo[1]) * 1000).toISOString().slice(0, 10)}` : "—")}
          {row("revoked", setInfo ? String(setInfo[2]) : "—")}
          {row("claim submissions", paused ? "PAUSED" : "open")}
          {row(
            "your wallet",
            isConnected
              ? `${short(address)} — ${isVerifierQ.data ? "ACTIVE VERIFIER" : "not a council verifier"}`
              : "not connected",
          )}
        </tbody>
      </table>

      <h2 className="mb-2 font-bold">Members ({memberCount})</h2>
      <table className="mb-8 w-full">
        <thead>
          <tr className="border-b text-left text-neutral-500"><th className="py-2">Key</th><th>Duties</th><th /></tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.key} className="border-b border-neutral-800">
              <td className="py-2">{m.key}</td>
              <td>{m.roles.join(", ") || "—"}</td>
              <td className="text-sky-400">{address?.toLowerCase() === m.key.toLowerCase() ? "you" : ""}</td>
            </tr>
          ))}
          {members.length === 0 && <tr><td colSpan={3} className="py-4 text-neutral-500">no active set members</td></tr>}
        </tbody>
      </table>

      {pendingRequests.length > 0 && (
        <>
          <h2 className="mb-2 font-bold">Seat requests ({pendingRequests.length})</h2>
          <table className="mb-4 w-full">
            <thead>
              <tr className="border-b text-left text-neutral-500">
                <th className="py-2" /><th>Wallet</th><th>Label</th><th>Note</th><th />
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((r) => (
                <tr key={r.id} className="border-b border-neutral-800">
                  <td className="py-2 pr-3">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={(e) => {
                        const s = new Set(selected);
                        if (e.target.checked) s.add(r.id); else s.delete(r.id);
                        setSelected(s);
                      }}
                    />
                  </td>
                  <td>{r.walletAddress}</td>
                  <td className="text-neutral-400">{r.label ?? "—"}</td>
                  <td className="max-w-48 truncate text-neutral-500" title={r.note ?? ""}>{r.note ?? "—"}</td>
                  <td>
                    <button
                      className="text-red-400 underline"
                      onClick={async () => {
                        await fetch("/api/zk/join", {
                          method: "PATCH",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ id: r.id, status: "rejected" }),
                        });
                        location.reload();
                      }}
                    >
                      reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="mb-2 border border-sky-600 px-4 py-2 text-sky-400 disabled:opacity-40"
            disabled={!isConnected || proposeBusy || chosen.length === 0}
            onClick={proposeExpandedSet}
          >
            {proposeBusy
              ? "proposing…"
              : `propose set ${nextSetId} with ${chosen.length} new verifier${chosen.length === 1 ? "" : "s"}`}
          </button>
          {proposeMsg && <p className="mb-2 text-neutral-400">{proposeMsg}</p>}
          <p className="mb-8 text-neutral-600">
            registers a new council set (existing members + selected requesters, same
            thresholds) then schedules activation — governor role required.
          </p>
        </>
      )}

      <h2 className="mb-2 font-bold">Actions</h2>
      <div className="mb-4 flex flex-wrap gap-3">
        <button
          className="border border-neutral-600 px-4 py-2 disabled:opacity-40"
          disabled={!isConnected || isPending || !activationDue}
          onClick={() => call("activatePendingSet", [])}
        >
          activate pending set{!activationDue && pendingSetId > BigInt(0) ? " (not due)" : ""}
        </button>
        <button
          className="border border-neutral-600 px-4 py-2 disabled:opacity-40"
          disabled={!isConnected || isPending}
          onClick={() => call(paused ? "unpause" : "pause", [], "claims")}
        >
          {paused ? "unpause claims" : "pause claims"}
        </button>
      </div>
      <div className="mb-8 flex gap-3">
        <input
          className="w-[30rem] border border-neutral-700 bg-transparent px-3 py-2"
          placeholder="claimId (0x…) to revoke"
          value={claimAction}
          onChange={(e) => setClaimAction(e.target.value)}
        />
        <button
          className="border border-red-700 px-4 py-2 text-red-400 disabled:opacity-40"
          disabled={!isConnected || isPending || !/^0x[0-9a-fA-F]{64}$/.test(claimAction)}
          onClick={() => call("revokeClaim", [claimAction, 1], "claims")}
        >
          revoke claim
        </button>
      </div>

      {(isPending || confirming || confirmed || writeError) && (
        <p className="text-neutral-400">
          {isPending && "awaiting wallet signature…"}
          {confirming && `confirming ${short(txHash)}…`}
          {confirmed && `confirmed: ${txHash}`}
          {writeError && (
            <span className="text-red-400">
              {(writeError as { shortMessage?: string }).shortMessage ?? writeError.message}
            </span>
          )}
        </p>
      )}
      <p className="mt-4 text-neutral-600">
        Restricted calls (pause/revoke/schedule) revert unless your wallet holds the
        governor/guardian role on this deployment. activatePendingSet is permissionless.
      </p>
    </main>
  );
}
