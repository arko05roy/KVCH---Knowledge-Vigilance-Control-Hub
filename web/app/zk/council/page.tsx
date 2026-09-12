import { readZkConfig } from "@/lib/zk/config";
import { loadDeployment, loadContractAbi } from "@/lib/ledger/client";
import { prisma } from "@/lib/db/client";
import { CouncilDashboard } from "./dashboard";

export const dynamic = "force-dynamic";

export default async function CouncilPage() {
  const zk = readZkConfig();
  const deployment = loadDeployment(zk);
  const councilAbi = loadContractAbi(zk, "CouncilRegistry");
  const claimsAbi = loadContractAbi(zk, "ClaimAttestationRegistry");
  const pending = await prisma.zkJoinRequest.findMany({
    where: { kind: "verifier", status: "pending" },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  return (
    <CouncilDashboard
      chainId={zk.chainId}
      councilAddress={deployment.contracts.CouncilRegistry}
      claimsAddress={deployment.contracts.ClaimAttestationRegistry}
      councilAbi={councilAbi}
      claimsAbi={claimsAbi}
      pendingRequests={pending.map((r) => ({
        id: r.id,
        walletAddress: r.walletAddress ?? "",
        label: r.label,
        note: r.note,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
