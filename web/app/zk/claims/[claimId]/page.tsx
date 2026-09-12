import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { ZkRepository } from "@/lib/zk/repository";
import { ZkNavHeader } from "@/components/zk-nav";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const short = (s: string | null | undefined, n = 12) =>
  s ? `${s.slice(0, n)}…${s.slice(-4)}` : "—";

export default async function ZkClaimPage({
  params,
}: {
  params: Promise<{ claimId: string }>;
}) {
  const { claimId } = await params;
  const claim = await new ZkRepository(prisma).getClaim(claimId);
  if (!claim) notFound();

  const named =
    (claim.job?.bundle?.body as { publicInputs?: { named?: Record<string, string> } } | null)
      ?.publicInputs?.named ?? {};
  const atts = claim.job?.attestations ?? [];

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] selection:bg-[#5e6ad2]/30">
      <ZkNavHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        
        <Link
          href="/zk"
          className="text-[12px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
        >
          ← Overview
        </Link>

        {/* Claim Header */}
        <div className="flex items-baseline justify-between border-b border-[#23252a] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold font-mono text-[#f7f8f8]">
                Claim {short(claim.claimId, 16)}
              </h1>
              <span className="text-[11px] font-mono text-[#2ea043] bg-[#2ea043]/10 border border-[#2ea043]/30 px-2 py-0.5 rounded">
                {claim.status}
              </span>
            </div>
            <p className="text-[12.5px] text-[#8a8f98]">
              Minimized public outputs. Witness material is never published.
            </p>
          </div>
          {claim.txHash && (
            <a
              href={`https://sepolia.celoscan.io/tx/${claim.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-mono text-[#828fff] hover:underline inline-flex items-center gap-1"
            >
              <span>{short(claim.txHash, 8)}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Parameters Table */}
        <div className="space-y-2">
          <h2 className="text-[13px] font-medium text-[#f7f8f8]">Parameters</h2>
          <div className="rounded-lg border border-[#23252a] bg-[#0f1011] divide-y divide-[#18191a] text-[12.5px] font-mono">
            <div className="flex justify-between p-3">
              <span className="text-[#8a8f98]">Issuer Code</span>
              <span className="text-[#f7f8f8]">{claim.issuerCompanyCode.toString()}</span>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-[#8a8f98]">Series &amp; Version</span>
              <span className="text-[#d0d6e0]">{claim.claimSeriesId} (v{claim.claimVersion})</span>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-[#8a8f98]">Expiry Epoch</span>
              <span className="text-[#d0d6e0]">{claim.expiryEpoch.toString()}</span>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-[#8a8f98]">Council Set</span>
              <span className="text-[#d0d6e0]">#{claim.councilSetId.toString()}</span>
            </div>
          </div>
        </div>

        {/* Public Inputs */}
        <div className="space-y-2">
          <h2 className="text-[13px] font-medium text-[#f7f8f8]">Disclosed Publics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px] font-mono">
            <div className="rounded-md border border-[#23252a] bg-[#0f1011] p-3 space-y-0.5">
              <span className="text-[10px] uppercase text-[#8a8f98]">Severity Band</span>
              <div className="text-[#f7f8f8] font-medium">{named.severity_band_code ?? "BAND_0"}</div>
            </div>
            <div className="rounded-md border border-[#23252a] bg-[#0f1011] p-3 space-y-0.5">
              <span className="text-[10px] uppercase text-[#8a8f98]">Confidence Band</span>
              <div className="text-[#f7f8f8] font-medium">{named.confidence_band_code ?? "HIGH"}</div>
            </div>
            <div className="rounded-md border border-[#23252a] bg-[#0f1011] p-3 space-y-0.5">
              <span className="text-[10px] uppercase text-[#8a8f98]">Claim Family</span>
              <div className="text-[#f7f8f8] font-medium">{named.claim_family_code ?? "THREAT"}</div>
            </div>
            <div className="rounded-md border border-[#23252a] bg-[#0f1011] p-3 space-y-0.5">
              <span className="text-[10px] uppercase text-[#8a8f98]">Sector</span>
              <div className="text-[#f7f8f8] font-medium">{named.sector_code ?? "FINTECH"}</div>
            </div>
          </div>
        </div>

        {/* Commitment Digests */}
        <div className="space-y-2">
          <h2 className="text-[13px] font-medium text-[#f7f8f8]">Commitment Digests</h2>
          <div className="rounded-lg border border-[#23252a] bg-[#0f1011] p-4 space-y-2.5 font-mono text-[11.5px]">
            <div>
              <span className="text-[#8a8f98] text-[10.5px] uppercase block">Bundle Digest</span>
              <code className="text-[#d0d6e0] break-all">{claim.bundleDigest}</code>
            </div>
            <div>
              <span className="text-[#8a8f98] text-[10.5px] uppercase block">Public Input Digest</span>
              <code className="text-[#d0d6e0] break-all">{claim.publicInputDigest}</code>
            </div>
            <div>
              <span className="text-[#8a8f98] text-[10.5px] uppercase block">Disclosure Nullifier</span>
              <code className="text-[#d0d6e0] break-all">{claim.disclosureNullifier}</code>
            </div>
          </div>
        </div>

        {/* Quorum Attestations */}
        <div className="space-y-2">
          <h2 className="text-[13px] font-medium text-[#f7f8f8]">
            Quorum Attestations ({atts.length})
          </h2>
          <div className="rounded-lg border border-[#23252a] bg-[#0f1011] divide-y divide-[#18191a] text-[12px] font-mono">
            {atts.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <span className="text-[#f7f8f8]">{a.verifier}</span>
                <span className="text-[#2ea043]">Decision: {a.decision}</span>
              </div>
            ))}
            {atts.length === 0 && (
              <div className="p-4 text-center text-[#8a8f98]">
                No individual signatures recorded in local database cache.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
