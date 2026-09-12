"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celoSepolia } from "wagmi/chains";
import { defineChain } from "viem";
import { http } from "wagmi";

export const anvilLocal = defineChain({
  id: 31337,
  name: "Anvil (local)",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
});

/** The chain the council deployment lives on. Defaults to local Anvil;
 *  set NEXT_PUBLIC_ZK_CHAIN_ID=11142220 for Celo Sepolia. */
export const deploymentChainId = Number(
  process.env.NEXT_PUBLIC_ZK_CHAIN_ID ?? "31337",
);

export const deploymentChain = deploymentChainId === 11142220 ? celoSepolia : anvilLocal;

export const config = getDefaultConfig({
  appName: "KVCH ZK Council",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "kvch-zk-dev",
  chains: [deploymentChain],
  transports: {
    [deploymentChain.id]: http(
      process.env.NEXT_PUBLIC_ZK_RPC_URL ??
        (deploymentChainId === 11142220
          ? "https://forno.celo-sepolia.celo-testnet.org"
          : "http://127.0.0.1:8545"),
    ),
  },
  ssr: true,
});
