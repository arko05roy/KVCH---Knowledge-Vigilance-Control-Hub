import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { ZkNavHeader } from "@/components/zk-nav";
import { ArrowRight, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const short = (s: string | null | undefined, n = 10) =>
  s ? `${s.slice(0, n)}…${s.slice(-4)}` : "—";

export default async function ZkDashboard() {
  let jobs: Array<{
    id: string;
    companyId: string;
    claimKind: string;
    status: string;
    bundleDigest: string | null;
    errorCode: string | null;
    createdAt: Date;
  }> = [];

  let claims: Array<{
    claimId: string;
    status: string;
    issuerCompanyCode: bigint;
    expiryEpoch: bigint;
    endorsements: any[];
    txHash: string | null;
  }> = [];

  try {
    const [fetchedJobs, fetchedClaims] = await Promise.all([
      prisma.zkProofJob
        ? prisma.zkProofJob.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
            select: {
              id: true,
              companyId: true,
              claimKind: true,
              status: true,
              bundleDigest: true,
              errorCode: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
      prisma.zkClaim
        ? prisma.zkClaim.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
            include: { endorsements: true },
          })
        : Promise.resolve([]),
    ]);
    jobs = fetchedJobs;
    claims = fetchedClaims;
  } catch (err) {
    console.warn("ZkDashboard database query skipped:", err);
  }

  const anchoredCount = claims.filter((c) => c.status === "anchored").length;

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] selection:bg-[#5e6ad2]/30">
      <ZkNavHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#23252a] pb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-[#f7f8f8]">
              Zero-Knowledge Subsystem
            </h1>
            <p className="text-[13px] text-[#8a8f98]">
              Off-chain UltraHonk proving with verifier council consensus anchored on Celo Sepolia.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/zk/join"
              className="rounded-md bg-[#5e6ad2] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#828fff]"
            >
              Join Network
            </Link>
            <Link
              href="/zk/council"
              className="rounded-md border border-[#23252a] bg-[#0f1011] px-3 py-1.5 text-[13px] text-[#f7f8f8] transition-colors hover:bg-[#141516]"
            >
              Council
            </Link>
          </div>
        </div>

        {/* Minimalist Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#23252a] rounded-lg border border-[#23252a] bg-[#0f1011]">
          <div className="p-4 space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#8a8f98]">Anchored Claims</span>
            <div className="text-xl font-semibold font-mono text-[#f7f8f8]">{anchoredCount}</div>
            <p className="text-[11px] text-[#62666d]">Finalized on-chain</p>
          </div>
          <div className="p-4 space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#8a8f98]">Proof Jobs</span>
            <div className="text-xl font-semibold font-mono text-[#f7f8f8]">{jobs.length}</div>
            <p className="text-[11px] text-[#62666d]">UltraHonk pipeline</p>
          </div>
          <div className="p-4 space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#8a8f98]">Quorum Consensus</span>
            <div className="text-xl font-semibold font-mono text-[#f7f8f8]">M-of-N</div>
            <p className="text-[11px] text-[#62666d]">Council verified</p>
          </div>
          <div className="p-4 space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#8a8f98]">Data Exposure</span>
            <div className="text-xl font-semibold font-mono text-[#2ea043]">0%</div>
            <p className="text-[11px] text-[#62666d]">Witness stays local</p>
          </div>
        </div>

        {/* Anchored Claims Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-medium text-[#f7f8f8]">Anchored Claims</h2>
              <span className="text-[11px] font-mono text-[#62666d]">({claims.length})</span>
            </div>
            <Link
              href="/zk/join/company"
              className="text-[12px] text-[#828fff] hover:underline"
            >
              + Prove Claim
            </Link>
          </div>

          <div className="rounded-lg border border-[#23252a] bg-[#0f1011] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-[#23252a] text-[11px] font-mono uppercase text-[#8a8f98]">
                    <th className="py-2.5 px-4">Claim</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Issuer</th>
                    <th className="py-2.5 px-4">Expiry</th>
                    <th className="py-2.5 px-4">Endorsements</th>
                    <th className="py-2.5 px-4 text-right">Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18191a]">
                  {claims.map((c) => (
                    <tr key={c.claimId} className="hover:bg-[#141516]/50 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium">
                        <Link
                          href={`/zk/claims/${c.claimId}`}
                          className="text-[#f7f8f8] hover:text-[#828fff] underline underline-offset-2"
                        >
                          {short(c.claimId, 12)}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[#d0d6e0]">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              c.status === "anchored" ? "bg-[#2ea043]" : "bg-[#f2c94c]"
                            }`}
                          />
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#8a8f98] text-[12px]">
                        {c.issuerCompanyCode.toString()}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#8a8f98] text-[12px]">
                        {c.expiryEpoch.toString()}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[12px] text-[#8a8f98]">
                        {c.endorsements?.length || 0}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-[12px]">
                        {c.txHash ? (
                          <a
                            href={`https://sepolia.celoscan.io/tx/${c.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#828fff] hover:underline inline-flex items-center gap-1"
                          >
                            <span>{short(c.txHash, 8)}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-[#62666d]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {claims.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[13px] text-[#8a8f98]">
                        No claims anchored yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Proof Jobs Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-medium text-[#f7f8f8]">Proof Jobs</h2>
              <span className="text-[11px] font-mono text-[#62666d]">({jobs.length})</span>
            </div>
          </div>

          <div className="rounded-lg border border-[#23252a] bg-[#0f1011] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-[#23252a] text-[11px] font-mono uppercase text-[#8a8f98]">
                    <th className="py-2.5 px-4">Job ID</th>
                    <th className="py-2.5 px-4">Company</th>
                    <th className="py-2.5 px-4">Kind</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Digest</th>
                    <th className="py-2.5 px-4 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18191a]">
                  {jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-[#141516]/50 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[#f7f8f8] text-[12px]">
                        {j.id.slice(0, 8)}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#8a8f98] text-[12px]">
                        {j.companyId}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[12px] text-[#d0d6e0]">
                        {j.claimKind}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[#d0d6e0]">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              j.status === "anchored" || j.status === "verified"
                                ? "bg-[#2ea043]"
                                : j.status === "failed"
                                ? "bg-[#ff5555]"
                                : "bg-[#5e6ad2]"
                            }`}
                          />
                          {j.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[#8a8f98] text-[12px]">
                        {short(j.bundleDigest, 8)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-[12px] text-[#8a8f98]">
                        {j.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                      </td>
                    </tr>
                  ))}
                  {jobs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[13px] text-[#8a8f98]">
                        No proof jobs registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
