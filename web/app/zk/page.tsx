import Link from "next/link";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

const short = (s: string | null | undefined, n = 12) =>
  s ? `${s.slice(0, n)}…${s.slice(-4)}` : "—";

export default async function ZkDashboard() {
  const [jobs, claims] = await Promise.all([
    prisma.zkProofJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true, companyId: true, claimKind: true, status: true,
        bundleDigest: true, errorCode: true, createdAt: true,
      },
    }),
    prisma.zkClaim.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { endorsements: true },
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-8 font-mono text-sm">
      <h1 className="mb-2 text-xl font-bold">KVCH Zero-Knowledge Subsystem</h1>
      <p className="mb-8 text-neutral-500">
        Off-chain proving → verifier-council quorum → minimized claims anchored on Celo Sepolia.
        Proofs attest consistency with signed inputs — not real-world truth.
      </p>

      <h2 className="mb-3 font-bold">Proof jobs</h2>
      <table className="mb-10 w-full border-collapse">
        <thead>
          <tr className="border-b text-left text-neutral-500">
            <th className="py-2">Job</th><th>Kind</th><th>Status</th><th>Bundle digest</th><th>Error</th><th>Created</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id} className="border-b border-neutral-800">
              <td className="py-2">{j.id.slice(0, 8)}</td>
              <td>{j.claimKind}</td>
              <td>{j.status}</td>
              <td>{short(j.bundleDigest)}</td>
              <td className="text-red-400">{j.errorCode ?? ""}</td>
              <td className="text-neutral-500">{j.createdAt.toISOString().slice(0, 19)}</td>
            </tr>
          ))}
          {jobs.length === 0 && (
            <tr><td colSpan={6} className="py-4 text-neutral-500">No proof jobs yet — POST /api/zk/proof-jobs</td></tr>
          )}
        </tbody>
      </table>

      <h2 className="mb-3 font-bold">Anchored claims</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left text-neutral-500">
            <th className="py-2">Claim</th><th>Status</th><th>Issuer</th><th>Expiry epoch</th><th>Endorsements</th><th>Tx</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.claimId} className="border-b border-neutral-800">
              <td className="py-2">
                <Link className="text-sky-400 underline" href={`/zk/claims/${c.claimId}`}>
                  {short(c.claimId, 14)}
                </Link>
              </td>
              <td>{c.status}</td>
              <td>{c.issuerCompanyCode.toString()}</td>
              <td>{c.expiryEpoch.toString()}</td>
              <td>{c.endorsements.length}</td>
              <td>{short(c.txHash)}</td>
            </tr>
          ))}
          {claims.length === 0 && (
            <tr><td colSpan={6} className="py-4 text-neutral-500">No claims anchored yet.</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
