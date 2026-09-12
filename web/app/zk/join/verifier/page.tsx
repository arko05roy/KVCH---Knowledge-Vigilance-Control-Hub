import { readZkConfig } from "@/lib/zk/config";
import { loadDeployment, loadContractAbi } from "@/lib/ledger/client";
import { VerifierOnboarding } from "./onboarding";

export const dynamic = "force-dynamic";

export default function JoinVerifierPage() {
  const zk = readZkConfig();
  const deployment = loadDeployment(zk);
  return (
    <VerifierOnboarding
      chainId={zk.chainId}
      councilAddress={deployment.contracts.CouncilRegistry}
      councilAbi={loadContractAbi(zk, "CouncilRegistry")}
    />
  );
}
