import "server-only";
import path from "node:path";

export interface ZkConfig {
  zkWorkspaceDir: string;
  pipelineScript: string;
  deploymentManifest: string;
  verifierKeysFile: string;
  rpcUrl: string;
  chainId: number;
  publisherKey: string;
  commandTimeoutMs: number;
  indexerBatchSize: number;
  indexerFinalityDepth: number;
  verifierCount: number;
}

type Environment = Record<string, string | undefined>;

function req(env: Environment, key: string, fallback?: string): string {
  const value = env[key]?.trim() || fallback;
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export function readZkConfig(env: Environment = process.env): ZkConfig {
  const defaultZkDir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "../zk");
  const zkWorkspaceDir = path.resolve(/*turbopackIgnore: true*/ req(env, "ZK_WORKSPACE_DIR", defaultZkDir));
  const deploymentManifest =
    env.ZK_DEPLOYMENT_MANIFEST?.trim() ||
    path.join(zkWorkspaceDir, "contracts/deployments/latest.json");
  return {
    zkWorkspaceDir,
    pipelineScript: path.join(zkWorkspaceDir, "runtime/src/pipeline.mjs"),
    deploymentManifest,
    verifierKeysFile:
      env.ZK_VERIFIER_KEYS_FILE?.trim() ||
      path.join(zkWorkspaceDir, ".env.deploy"),
    rpcUrl: env.ZK_RPC_URL?.trim() || "http://127.0.0.1:8545",
    chainId: Number(env.ZK_CHAIN_ID?.trim() || "31337"),
    publisherKey: env.ZK_PUBLISHER_KEY?.trim() || "",
    commandTimeoutMs: Number(env.ZK_COMMAND_TIMEOUT_MS?.trim() || "300000"),
    indexerBatchSize: Number(env.ZK_INDEXER_BATCH_SIZE?.trim() || "2000"),
    indexerFinalityDepth: Number(env.ZK_INDEXER_FINALITY_DEPTH?.trim() || "2"),
    verifierCount: Number(env.ZK_VERIFIER_COUNT?.trim() || "3"),
  };
}
