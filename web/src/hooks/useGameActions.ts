import { type Abi, type Address, parseEther, stringToHex } from "viem";
import { useWriteContract } from "wagmi";
import { DegenDogUndergroundClubAbi, MockSpenderTokenAbi } from "../chain/abi";
import { contractConfig } from "../lib/config";

const clubAbi = DegenDogUndergroundClubAbi as Abi;
const spenderAbi = MockSpenderTokenAbi as Abi;

function required(address: Address | undefined, label: string): Address {
  if (!address) throw new Error(`${label} address is not configured`);
  return address;
}

export function useGameActions(onSettled?: () => void) {
  const writer = useWriteContract({ mutation: { onSettled } });
  const game = () => required(contractConfig.game, "game");
  const spender = () => required(contractConfig.spender, "spender");

  return {
    pending: writer.isPending,
    error: writer.error?.message,
    createClub: (name: string) =>
      writer.writeContract({ address: game(), abi: clubAbi, functionName: "createClub", args: [stringToHex(name.slice(0, 31) || "Underground Club", { size: 32 })] }),
    runNight: () => writer.writeContract({ address: game(), abi: clubAbi, functionName: "runNight" }),
    reviveClub: () => writer.writeContract({ address: game(), abi: clubAbi, functionName: "reviveClub" }),
    workDoor: () => writer.writeContract({ address: game(), abi: clubAbi, functionName: "workDoor" }),
    runBar: () => writer.writeContract({ address: game(), abi: clubAbi, functionName: "runBar" }),
    dropSet: () => writer.writeContract({ address: game(), abi: clubAbi, functionName: "dropSet" }),
    streetPromo: () => writer.writeContract({ address: game(), abi: clubAbi, functionName: "streetPromo" }),
    buyUpgrade: (upgrade: number) => writer.writeContract({ address: game(), abi: clubAbi, functionName: "buyUpgrade", args: [upgrade] }),
    setDefense: (resource: number) => writer.writeContract({ address: game(), abi: clubAbi, functionName: "setDefense", args: [resource] }),
    raidClub: (target: Address, resource: number) => writer.writeContract({ address: game(), abi: clubAbi, functionName: "raidClub", args: [target, resource] }),
    claimRewards: () => writer.writeContract({ address: game(), abi: clubAbi, functionName: "claimRewards" }),
    faucetSpender: () => writer.writeContract({ address: spender(), abi: spenderAbi, functionName: "faucet" }),
    approveSpender: () => writer.writeContract({ address: spender(), abi: spenderAbi, functionName: "approve", args: [game(), parseEther("1000")] })
  };
}
