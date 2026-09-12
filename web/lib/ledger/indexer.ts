import "server-only";
import { parseAbiItem, type Log } from "viem";
import type { ZkConfig } from "../zk/config";
import type { ZkRepository } from "../zk/repository";
import { ledgerClient, loadDeployment } from "./client";

const WATCHED_EVENTS = [
  parseAbiItem(
    "event ClaimAnchored(bytes32 indexed claimId, bytes32 indexed claimSeriesId, bytes32 bundleDigest, bytes32 publicInputDigest, uint64 issuerCompanyCode, uint64 expiryEpoch)",
  ),
  parseAbiItem("event ClaimStatusChanged(bytes32 indexed claimId, uint8 status, uint8 reasonCode)"),
  parseAbiItem("event ClaimSuperseded(bytes32 indexed oldClaimId, bytes32 indexed newClaimId)"),
  parseAbiItem(
    "event EndorsementAnchored(bytes32 indexed endorsementId, bytes32 indexed targetClaimId, uint64 endorserCompanyCode, uint16 matchBandCode)",
  ),
  parseAbiItem("event DisputeOpened(bytes32 indexed claimId, uint8 reasonCode, bytes32 evidenceDigest)"),
  parseAbiItem("event DisputeResolved(bytes32 indexed claimId, uint8 resolutionCode, bytes32 resolutionDigest, uint8 action)"),
  parseAbiItem("event DisputeAppealed(bytes32 indexed claimId, bytes32 appealRef)"),
];

const STATUS_BY_UINT8: Record<number, "revoked" | "superseded" | "invalidated"> = {
  2: "revoked",
  3: "superseded",
  4: "invalidated",
};

/** Polls new registry events, records them, and reconciles ZkClaim state. */
export async function indexChainEvents(repo: ZkRepository, config: ZkConfig): Promise<{ events: number; toBlock: bigint }> {
  const deployment = loadDeployment(config);
  const client = ledgerClient(config);
  const cursor = await repo.getCursor(config.chainId);
  const head = await client.getBlockNumber();
  const safeHead = head > BigInt(config.indexerFinalityDepth) ? head - BigInt(config.indexerFinalityDepth) : head;
  if (cursor.lastBlock >= safeHead) return { events: 0, toBlock: safeHead };

  const zero = BigInt(0);
  let from = cursor.lastBlock === zero ? safeHead - BigInt(config.indexerBatchSize) : cursor.lastBlock + BigInt(1);
  if (from < zero) from = zero;
  const to = from + BigInt(config.indexerBatchSize) < safeHead ? from + BigInt(config.indexerBatchSize) : safeHead;
  if (to < from) return { events: 0, toBlock: safeHead };

  const addresses = [
    deployment.contracts.ClaimAttestationRegistry,
    deployment.contracts.EndorsementRegistry,
    deployment.contracts.DisputeLifecycleRegistry,
  ];
  const logs = await client.getLogs({ address: addresses, events: WATCHED_EVENTS, fromBlock: from, toBlock: to });

  for (const log of logs as Log[]) {
    const name = (log as { eventName?: string }).eventName ?? "unknown";
    const args = (log as { args?: Record<string, unknown> }).args ?? {};
    await repo.recordChainEvent({
      chainId: config.chainId,
      contractAddress: log.address,
      eventName: name,
      txHash: log.transactionHash ?? "0x",
      logIndex: Number(log.logIndex ?? 0),
      blockNumber: log.blockNumber ?? BigInt(0),
      blockHash: log.blockHash ?? "0x",
      payload: JSON.parse(JSON.stringify(args, (_k, v) => (typeof v === "bigint" ? v.toString() : v))),
    });
    await reconcileEvent(repo, config, name, args, log.transactionHash ?? null);
  }
  await repo.setCursor(cursor.id, to);
  return { events: logs.length, toBlock: to };
}

async function reconcileEvent(
  repo: ZkRepository,
  config: ZkConfig,
  name: string,
  args: Record<string, unknown>,
  logTxHash: string | null,
): Promise<void> {
  const claimId = typeof args.claimId === "string" ? args.claimId : undefined;
  const claim = claimId ? await repo.getClaim(claimId) : null;

  if (name === "ClaimAnchored") {
    if (!claim || !claimId) return;
    if (claim.status === "pending") {
      await repo.transitionClaim(claimId, "anchored", {
        chainStatus: "confirmed",
        anchoredAt: new Date(),
      });
    } else {
      await repo.db.zkClaim.update({ where: { claimId }, data: { chainStatus: "confirmed" } });
    }
    if (!claim.txHash && logTxHash) {
      await repo.db.zkClaim.update({ where: { claimId }, data: { txHash: logTxHash } });
    }
    await repo.db.zkProofJob.updateMany({
      where: { id: claim.jobId, status: "submitted" },
      data: { status: "anchored", finishedAt: new Date() },
    });
    return;
  }
  if (name === "ClaimStatusChanged") {
    const next = STATUS_BY_UINT8[Number(args.status)];
    if (claim && claimId && next && ["anchored", "pending"].includes(claim.status)) {
      await repo.transitionClaim(claimId, next).catch(() => {});
    }
    return;
  }
  if (name === "ClaimSuperseded") {
    const oldId = typeof args.oldClaimId === "string" ? args.oldClaimId : undefined;
    if (oldId) await repo.transitionClaim(oldId, "superseded").catch(() => {});
    return;
  }
  if (name === "EndorsementAnchored") {
    const target = typeof args.targetClaimId === "string" ? args.targetClaimId : undefined;
    const eid = typeof args.endorsementId === "string" ? args.endorsementId : undefined;
    if (target && eid) {
      await repo.db.zkEndorsement.updateMany({
        where: { endorsementId: eid },
        data: { chainStatus: "confirmed" },
      });
    }
    return;
  }
  if (name === "DisputeOpened" && claim && claimId) {
    await repo.db.zkDispute.upsert({
      where: { id: `chain-${claimId}` },
      update: { status: "open" },
      create: {
        id: `chain-${claimId}`,
        claimId,
        reasonCode: Number(args.reasonCode ?? 0),
        evidenceDigest: String(args.evidenceDigest ?? "0x"),
        txHash: undefined,
      },
    });
  }
}
