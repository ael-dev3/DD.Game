import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { type Address } from "viem";
import { DegenDogUndergroundClubAbi } from "../chain/abi";
import { chainFromEnv } from "../chain/chains";
import { getConfiguredGameAddress, makePublicClient } from "../chain/client";

interface StoredEvent {
  eventName: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: number;
  args: Record<string, string | number | boolean | null>;
}

type Deployment = { startBlock?: number };

function normalizeArg(value: unknown): string | number | boolean | null {
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (value == null) return null;
  return JSON.stringify(value);
}

function deploymentFilePath() {
  const fallback = chainFromEnv().id === 31337 ? "deployments/localhost.json" : "deployments/baseSepolia.json";
  return path.resolve(process.cwd(), process.env.DEPLOYMENT_FILE || fallback);
}

function configuredStartBlock() {
  if (process.env.START_BLOCK) return BigInt(process.env.START_BLOCK);
  const deploymentFile = deploymentFilePath();
  if (fs.existsSync(deploymentFile)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8")) as Deployment;
    if (deployment.startBlock != null) return BigInt(deployment.startBlock);
  }
  return 0n;
}

async function main() {
  const address: Address = getConfiguredGameAddress();
  const fromBlock = configuredStartBlock();
  const toBlock = process.env.TO_BLOCK ? BigInt(process.env.TO_BLOCK) : "latest";
  const client = makePublicClient(process.env.RPC_URL);
  const logs = await client.getContractEvents({ address, abi: DegenDogUndergroundClubAbi, fromBlock, toBlock });

  const events: StoredEvent[] = logs.map((log) => {
    const args = Object.fromEntries(
      Object.entries((log as { args?: Record<string, unknown> }).args || {}).map(([key, value]) => [key, normalizeArg(value)])
    );
    return {
      eventName: (log as { eventName?: string }).eventName || "Unknown",
      blockNumber: log.blockNumber.toString(),
      transactionHash: log.transactionHash,
      logIndex: log.logIndex,
      args
    };
  });

  const outDir = path.join(process.cwd(), "web", "public", "generated");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "game-events.json");
  fs.writeFileSync(outPath, JSON.stringify({ source: address, fromBlock: fromBlock.toString(), toBlock: String(toBlock), events }, null, 2));
  console.log(`wrote ${events.length} events to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
