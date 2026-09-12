import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Abi, Address } from "viem";
import { createPublicClient, http, defineChain, type PublicClient } from "viem";
import type { ZkConfig } from "../zk/config";

export interface ZkDeployment {
  chainId: number;
  councilSetId: bigint;
  contracts: {
    AccessManager: Address;
    CouncilRegistry: Address;
    ArtifactPolicyRegistry: Address;
    ClaimAttestationRegistry: Address;
    EndorsementRegistry: Address;
    DisputeLifecycleRegistry: Address;
  };
  ids: { circuitId: string; circuitId2: string; policyId: string };
}

/** Accepts both manifest shapes: the flat Foundry `latest.json` and the
 *  nested consolidated `deployments/<network>.json`. */
export function loadDeployment(config: Pick<ZkConfig, "deploymentManifest">): ZkDeployment {
  const raw = JSON.parse(readFileSync(config.deploymentManifest, "utf8"));
  const c = raw.contracts ?? raw;
  const ids = raw.ids ?? raw;
  return {
    chainId: raw.chainId,
    councilSetId: BigInt(raw.councilSetId),
    contracts: {
      AccessManager: c.AccessManager,
      CouncilRegistry: c.CouncilRegistry,
      ArtifactPolicyRegistry: c.ArtifactPolicyRegistry,
      ClaimAttestationRegistry: c.ClaimAttestationRegistry,
      EndorsementRegistry: c.EndorsementRegistry,
      DisputeLifecycleRegistry: c.DisputeLifecycleRegistry,
    },
    ids: { circuitId: ids.circuitId, circuitId2: ids.circuitId2, policyId: ids.policyId },
  };
}

export function loadContractAbi(config: Pick<ZkConfig, "zkWorkspaceDir">, name: string): Abi {
  const p = path.join(config.zkWorkspaceDir, `contracts/out/${name}.sol/${name}.json`);
  return (JSON.parse(readFileSync(p, "utf8")).abi ?? []) as Abi;
}

export function chainFor(config: Pick<ZkConfig, "chainId" | "rpcUrl">) {
  return defineChain({
    id: config.chainId,
    name: config.chainId === 11142220 ? "Celo Sepolia" : "Anvil",
    nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
    rpcUrls: { default: { http: [config.rpcUrl] } },
  });
}

export function ledgerClient(config: Pick<ZkConfig, "chainId" | "rpcUrl">): PublicClient {
  return createPublicClient({
    chain: chainFor(config),
    transport: http(config.rpcUrl),
  }) as PublicClient;
}
