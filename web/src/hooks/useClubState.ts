import { useMemo } from "react";
import { type Abi, type Address } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { DegenDogUndergroundClubAbi } from "../chain/abi";
import { contractConfig, hasContractsConfigured } from "../lib/config";
import { bytes32ToText } from "../lib/format";
import { mockClub } from "../lib/mockState";

const clubAbi = DegenDogUndergroundClubAbi as Abi;
const statusLabels = ["ACTIVE", "AFTERHOURS", "SHUT_DOWN"] as const;

type RawClub = {
  owner: Address;
  name: string;
  createdAt: bigint;
  lastNightRunAt: bigint;
  lastActionAt: bigint;
  score: number;
  bones: number;
  hype: number;
  vibe: number;
  security: number;
  heat: number;
  pendingRewards: number;
  protectedResource: number;
  djBoothLevel: number;
  securityTeamLevel: number;
  vipKennelLevel: number;
  backRoomLevel: number;
  neonSignLevel: number;
};

function asNumber(value: unknown): number {
  return typeof value === "bigint" ? Number(value) : Number(value ?? 0);
}

export function useClubState() {
  const { address, chainId } = useAccount();
  const enabled = Boolean(hasContractsConfigured && address && contractConfig.game);

  const clubRead = useReadContract({
    address: contractConfig.game,
    abi: clubAbi,
    functionName: "getClub",
    args: address ? [address] : undefined,
    query: { enabled }
  });
  const statusRead = useReadContract({
    address: contractConfig.game,
    abi: clubAbi,
    functionName: "getClubStatus",
    args: address ? [address] : undefined,
    query: { enabled }
  });
  const cooldownRead = useReadContract({
    address: contractConfig.game,
    abi: clubAbi,
    functionName: "getCooldowns",
    args: address ? [address] : undefined,
    query: { enabled }
  });
  const scoreRead = useReadContract({
    address: contractConfig.game,
    abi: clubAbi,
    functionName: "getScore",
    args: address ? [address] : undefined,
    query: { enabled }
  });

  const hasLiveClub = Boolean(clubRead.data && !clubRead.error);
  const mockMode = !enabled || !hasLiveClub;

  const club = useMemo(() => {
    if (!hasLiveClub) return mockClub;
    const raw = clubRead.data as RawClub;
    return {
      owner: raw.owner,
      name: bytes32ToText(raw.name),
      status: statusLabels[Number(statusRead.data ?? 0)] ?? "ACTIVE",
      score: asNumber(scoreRead.data ?? raw.score),
      bones: asNumber(raw.bones),
      hype: asNumber(raw.hype),
      vibe: asNumber(raw.vibe),
      security: asNumber(raw.security),
      heat: asNumber(raw.heat),
      pendingRewards: asNumber(raw.pendingRewards),
      protectedResource: asNumber(raw.protectedResource),
      upgrades: [raw.djBoothLevel, raw.securityTeamLevel, raw.vipKennelLevel, raw.backRoomLevel, raw.neonSignLevel].map(asNumber)
    };
  }, [clubRead.data, hasLiveClub, scoreRead.data, statusRead.data]);

  const cooldowns = cooldownRead.data as
    | {
        doorReadyAt: bigint;
        barReadyAt: bigint;
        setReadyAt: bigint;
        promoReadyAt: bigint;
        raidReadyAt: bigint;
        nightDueAt: bigint;
        shutdownAt: bigint;
      }
    | undefined;

  async function refetchAll() {
    await Promise.all([clubRead.refetch(), statusRead.refetch(), cooldownRead.refetch(), scoreRead.refetch()]);
  }

  return {
    address,
    chainId,
    club,
    cooldowns: cooldowns
      ? {
          doorReadyAt: Number(cooldowns.doorReadyAt),
          barReadyAt: Number(cooldowns.barReadyAt),
          setReadyAt: Number(cooldowns.setReadyAt),
          promoReadyAt: Number(cooldowns.promoReadyAt),
          raidReadyAt: Number(cooldowns.raidReadyAt),
          nightDueAt: Number(cooldowns.nightDueAt),
          shutdownAt: Number(cooldowns.shutdownAt)
        }
      : undefined,
    mockMode,
    hasLiveClub,
    isConfigured: hasContractsConfigured,
    error: clubRead.error?.message,
    refetchAll
  };
}
