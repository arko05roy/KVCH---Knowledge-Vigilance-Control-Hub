import { NextResponse } from "next/server";
import { getAddress } from "viem";
import { prisma } from "@/lib/db/client";

const SLUG = /^[a-z0-9][a-z0-9-]{1,62}$/;

const normalizeWallet = (w: unknown): string | undefined => {
  if (typeof w !== "string") return undefined;
  try {
    return getAddress(w);
  } catch {
    return undefined;
  }
};

/** POST /api/zk/join — self-service onboarding request.
 *  kind=verifier requires a wallet; kind=company requires a company code slug. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const kind = String(body.kind ?? "");
    if (kind !== "verifier" && kind !== "company") {
      return NextResponse.json({ error: "kind must be verifier or company" }, { status: 400 });
    }

    const walletAddress = normalizeWallet(body.walletAddress);
    const companyCode =
      typeof body.companyCode === "string" ? body.companyCode.trim().toLowerCase() : undefined;
    const label = typeof body.label === "string" ? body.label.slice(0, 200) : undefined;
    const note = typeof body.note === "string" ? body.note.slice(0, 1000) : undefined;
    const chainId = body.chainId != null ? Number(body.chainId) : undefined;

    if (kind === "verifier" && !walletAddress) {
      return NextResponse.json({ error: "verifier requires a valid 0x wallet address" }, { status: 400 });
    }
    if (kind === "company" && (!companyCode || !SLUG.test(companyCode))) {
      return NextResponse.json(
        { error: "company requires a code: lowercase letters, numbers, hyphens (2–63 chars)" },
        { status: 400 },
      );
    }

    // Idempotent: an open request for the same identity is returned as-is.
    const existing = await prisma.zkJoinRequest.findFirst({
      where: {
        kind,
        status: { in: ["pending", "approved"] },
        ...(kind === "verifier" ? { walletAddress } : { companyCode }),
      },
    });
    if (existing) return NextResponse.json({ request: serialize(existing), deduplicated: true });

    const created = await prisma.zkJoinRequest.create({
      data: { kind, walletAddress, companyCode, label, note, chainId },
    });
    return NextResponse.json({ request: serialize(created) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

/** GET /api/zk/join?kind=verifier&status=pending&walletAddress=0x…&companyCode=acme-01 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const walletAddress = normalizeWallet(url.searchParams.get("walletAddress"));
  const companyCode = url.searchParams.get("companyCode")?.trim().toLowerCase();
  const requests = await prisma.zkJoinRequest.findMany({
    where: {
      kind: kind === "verifier" || kind === "company" ? kind : undefined,
      status: status === "pending" || status === "approved" || status === "rejected" ? status : undefined,
      walletAddress: url.searchParams.has("walletAddress") ? walletAddress ?? "0x0" : undefined,
      companyCode: url.searchParams.has("companyCode") ? companyCode : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ requests: requests.map(serialize) });
}

/** PATCH /api/zk/join {id, status, councilSetId?} — governance resolution. */
export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id ?? "");
    const status = body.status === "approved" || body.status === "rejected" ? body.status : undefined;
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
    const updated = await prisma.zkJoinRequest.update({
      where: { id },
      data: {
        status,
        resolvedAt: new Date(),
        councilSetId: body.councilSetId != null ? BigInt(body.councilSetId) : undefined,
      },
    });
    return NextResponse.json({ request: serialize(updated) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

const serialize = (r: {
  id: string; kind: string; status: string; walletAddress: string | null;
  companyCode: string | null; label: string | null; note: string | null;
  chainId: number | null; councilSetId: bigint | null; createdAt: Date; resolvedAt: Date | null;
}) => ({
  ...r,
  councilSetId: r.councilSetId?.toString() ?? null,
});
