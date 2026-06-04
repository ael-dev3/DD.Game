import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) throw new Error("No deployer account configured. Set PRIVATE_KEY for Base Sepolia deployments.");
  const spenderName = process.env.SPENDER_TOKEN_NAME || "Mock Club Cash";
  const spenderSymbol = process.env.SPENDER_TOKEN_SYMBOL || "CLUB";
  const rewardName = process.env.REWARD_TOKEN_NAME || "Mock Street Rep";
  const rewardSymbol = process.env.REWARD_TOKEN_SYMBOL || "REP";

  console.log(`deploying DD.Game contracts on ${network.name} with ${deployer.address}`);
  const spender = await ethers.deployContract("MockSpenderToken", [spenderName, spenderSymbol]);
  await spender.waitForDeployment();
  const reward = await ethers.deployContract("MockRewardToken", [rewardName, rewardSymbol]);
  await reward.waitForDeployment();
  const game = await ethers.deployContract("DegenDogUndergroundClub", [await spender.getAddress(), await reward.getAddress(), deployer.address]);
  await game.waitForDeployment();
  await (await reward.setGame(await game.getAddress())).wait();

  const block = await ethers.provider.getBlockNumber();
  const deployment = {
    network: network.name,
    chainId: network.config.chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    startBlock: block,
    contracts: {
      spender: await spender.getAddress(),
      reward: await reward.getAddress(),
      game: await game.getAddress()
    },
    tokens: {
      spender: { name: spenderName, symbol: spenderSymbol },
      reward: { name: rewardName, symbol: rewardSymbol }
    }
  };

  const outDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "baseSepolia.json");
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2));
  console.log(`spender=${deployment.contracts.spender}`);
  console.log(`reward=${deployment.contracts.reward}`);
  console.log(`game=${deployment.contracts.game}`);
  console.log(`wrote ${outPath}`);
  console.log("next: add VITE_GAME_CONTRACT_ADDRESS, VITE_SPENDER_TOKEN_ADDRESS, and VITE_REWARD_TOKEN_ADDRESS to web/.env.local");
  console.log("next: faucet/approve the spender token, create a club, then run the event indexer from START_BLOCK");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
