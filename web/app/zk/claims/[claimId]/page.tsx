import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { ZkRepository } from "@/lib/zk/repository";

export const dynamic = "force-dynamic";

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

  const row = (k: string, v: string | number | null | undefined) => (
    <tr className="border-b border-neutral-800" key={k}>
      <td className="py-2 pr-6 text-neutral-500">{k}</td>
      <td className="break-all py-2">{v ?? "—"}</td>
    </tr>
  );

  return (
    <main className="mx-auto max-w-4xl p-8 font-mono text-sm">
      <Link href="/zk" className="text-sky-400">← back</Link>
      <h1 className="mb-1 mt-4 text-xl font-bold">Claim {claim.claimId.slice(0, 18)}…</h1>
      <p className="mb-6 text-neutral-500">
        Minimized claim — public circuit outputs only. No witness material exists on-chain or in this view.
      </p>

      <h2 className="mb-2 font-bold">Status</h2>
      <table className="mb-8 w-full">
        <tbody>
          {row("status", claim.status)}
          {row("chain status", claim.chainStatus)}
          {row("anchored at", claim.anchoredAt?.toISOString())}
          {row("tx hash", claim.txHash)}
          {row("block", claim.blockNumber?.toString())}
          {row("council set", claim.councilSetId.toString())}
        </tbody>
      </table>

      <h2 className="mb-2 font-bold">Disclosed publics</h2>
      <table className="mb-8 w-full">
        <tbody>
          {row("claim series", claim.claimSeriesId)}
          {row("version", claim.claimVersion)}
          {row("issuer company code", claim.issuerCompanyCode.toString())}
          {row("severity band", named.severity_band_code)}
          {row("confidence band", named.confidence_band_code)}
          {row("claim family", named.claim_family_code)}
          {row("sector code", named.sector_code)}
          {row("observed epoch", named.observed_epoch)}
          {row("expiry epoch", claim.expiryEpoch.toString())}
          {row("bundle digest", claim.bundleDigest)}
          {row("public input digest", claim.publicInputDigest)}
          {row("disclosure nullifier", claim.disclosureNullifier)}
        </tbody>
      </table>

      <h2 className="mb-2 font-bold">Quorum attestations ({atts.length})</h2>
      <table className="mb-8 w-full">
        <tbody>
          {atts.map((a) =>
            row(a.verifier, `decision=${a.decision} deadline=${a.deadline.toString()}`),
          )}
          {atts.length === 0 && row("verifiers", "none recorded")}
        </tbody>
      </table>

      <h2 className="mb-2 font-bold">Endorsements ({claim.endorsements.length})</h2>
      <table className="w-full">
        <tbody>
          {claim.endorsements.map((e) =>
            row(
              e.endorsementId.slice(0, 18) + "…",
              `company=${e.endorserCompanyCode.toString()} band=${e.matchBandCode} ${e.chainStatus}`,
            ),
          )}
          {claim.endorsements.length === 0 && row("endorsements", "none")}
        </tbody>
      </table>
    </main>
  );
}
