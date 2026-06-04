import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createPublicClient, http, type Address } from "viem";
import { baseSepolia, chainFromEnv, hardhatLocal } from "./chains";
import { normalizeAddress } from "./addresses";

function resolveRpcUrl(rpcUrl?: string) {
  if (rpcUrl) return rpcUrl;
  if (process.env.RPC_URL) return process.env.RPC_URL;
  if (process.env.CHAIN_ID === "31337") return process.env.LOCALHOST_RPC_URL || "http://127.0.0.1:8545";
  return process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
}

function resolveChain(rpcUrl: string) {
  if (process.env.CHAIN_ID === "31337" || /localhost|127\.0\.0\.1/.test(rpcUrl)) return hardhatLocal;
  return baseSepolia;
}

export function makePublicClient(rpcUrl?: string) {
  const resolvedRpcUrl = resolveRpcUrl(rpcUrl);
  return createPublicClient({ chain: resolveChain(resolvedRpcUrl), transport: http(resolvedRpcUrl) });
}

type Deployment = { contracts?: { game?: string }; startBlock?: number };

function readDeploymentAddress(): Address | undefined {
  const deploymentFile = process.env.DEPLOYMENT_FILE || (chainFromEnv().id === 31337 ? "deployments/localhost.json" : "deployments/baseSepolia.json");
  const fullPath = path.resolve(process.cwd(), deploymentFile);
  if (!fs.existsSync(fullPath)) return undefined;
  const deployment = JSON.parse(fs.readFileSync(fullPath, "utf8")) as Deployment;
  return normalizeAddress(deployment.contracts?.game);
}

export function getConfiguredGameAddress(): Address {
  const address = normalizeAddress(process.env.GAME_CONTRACT_ADDRESS) || readDeploymentAddress();
  if (!address) throw new Error("GAME_CONTRACT_ADDRESS or deployment JSON with contracts.game is required");
  return address;
}
