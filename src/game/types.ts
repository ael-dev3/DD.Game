export type ClubStatus = "Running" | "Afterhours" | "Shut Down";
export type ResourceName = "BONES" | "HYPE" | "VIBE" | "SECURITY";
export type UpgradeName = "DJ Booth" | "Security Team" | "VIP Kennel" | "Back Room" | "Neon Sign";

export interface ClubSnapshot {
  owner: string;
  name: string;
  dogId: bigint;
  score: bigint;
  bones: bigint;
  hype: bigint;
  vibe: bigint;
  security: bigint;
  heat: bigint;
  status: ClubStatus;
  successfulActions: number;
  successfulRaids: number;
  successfulDefenses: number;
  upgrades: Record<UpgradeName, number>;
}

export interface CooldownSnapshot {
  doorReadyAt: number;
  barReadyAt: number;
  setReadyAt: number;
  promoReadyAt: number;
  raidReadyAt: number;
  nightDueAt: number;
  shutdownAt: number;
}
