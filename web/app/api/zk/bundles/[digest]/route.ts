import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

/** Content-addressed bundle download — the same artifact verifiers fetch. */
export async function GET(_request: Request, { params }: { params: Promise<{ digest: string }> }) {
  const { digest } = await params;
  if (!/^0x[0-9a-fA-F]{64}$/.test(digest)) {
    return NextResponse.json({ error: "invalid digest" }, { status: 400 });
  }
  const bundle = await prisma.zkProofBundle.findUnique({ where: { bundleDigest: digest } });
  if (!bundle) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(bundle.body, {
    headers: { "x-bundle-digest": bundle.bundleDigest, "cache-control": "public, immutable" },
  });
}
