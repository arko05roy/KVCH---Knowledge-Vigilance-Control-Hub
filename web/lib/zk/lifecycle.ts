import "server-only";
import type { ZkJobStatus, ZkClaimStatus } from "@prisma/client";

/** Legal proof-job transitions; anything else is a bug or a stale worker. */
const JOB_TRANSITIONS: Record<ZkJobStatus, ZkJobStatus[]> = {
  queued: ["proving", "cancelled"],
  proving: ["verifying", "failed", "cancelled"],
  verifying: ["attestating", "failed"],
  attestating: ["publishing", "failed"],
  publishing: ["submitted", "failed"],
  submitted: ["anchored", "failed"],
  anchored: [],
  failed: ["queued"], // explicit retry only
  cancelled: [],
};

export function assertJobTransition(from: ZkJobStatus, to: ZkJobStatus): void {
  if (!JOB_TRANSITIONS[from].includes(to)) {
    throw new Error(`illegal proof-job transition ${from} -> ${to}`);
  }
}

/** Legal claim lifecycle transitions (mirrors on-chain state machine). */
const CLAIM_TRANSITIONS: Record<ZkClaimStatus, ZkClaimStatus[]> = {
  pending: ["anchored"],
  anchored: ["revoked", "superseded", "invalidated", "expired"],
  revoked: [],
  superseded: [],
  invalidated: [],
  expired: [],
};

export function assertClaimTransition(from: ZkClaimStatus, to: ZkClaimStatus): void {
  if (!CLAIM_TRANSITIONS[from].includes(to)) {
    throw new Error(`illegal claim transition ${from} -> ${to}`);
  }
}

export const TERMINAL_CLAIM_STATES: ZkClaimStatus[] = [
  "revoked",
  "superseded",
  "invalidated",
  "expired",
];
