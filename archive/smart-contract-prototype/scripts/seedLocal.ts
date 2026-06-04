import "dotenv/config";
import { ethers } from "hardhat";

async function main() {
  const gameAddress = process.env.GAME_CONTRACT_ADDRESS;
  const spenderAddress = process.env.SPENDER_TOKEN_ADDRESS;
  if (!gameAddress || !spenderAddress) throw new Error("GAME_CONTRACT_ADDRESS and SPENDER_TOKEN_ADDRESS are required");

  const [player] = await ethers.getSigners();
  const spender = await ethers.getContractAt("MockSpenderToken", spenderAddress);
  const game = await ethers.getContractAt("DegenDogUndergroundClub", gameAddress);

  await (await spender.faucet()).wait();
  await (await spender.approve(gameAddress, ethers.parseEther("1000"))).wait();

  try {
    await (await game.createClub(ethers.encodeBytes32String("Local Bass Kennel"))).wait();
  } catch (error) {
    console.log("club may already exist, continuing", error instanceof Error ? error.message : error);
  }

  console.log(`seeded ${player.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
