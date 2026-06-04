export const ACTION_COOLDOWNS = {
  door: 6 * 60 * 60,
  bar: 4 * 60 * 60,
  set: 12 * 60 * 60,
  promo: 3 * 60 * 60,
  raid: 12 * 60 * 60
} as const;

export const NIGHT_RUN_WINDOW_SECONDS = 72 * 60 * 60;
export const SHUTDOWN_GRACE_SECONDS = 48 * 60 * 60;
export const MAX_UPGRADE_LEVEL = 5;
export const RAID_STEAL_BPS = 1500;
export const UPGRADE_BONES_COST_PER_LEVEL = 15;
export const UPGRADE_VIBE_COST_PER_LEVEL = 4;

export const RESOURCES = ["BONES", "HYPE", "VIBE", "SECURITY"] as const;
export const UPGRADES = ["DJ Booth", "Security Team", "VIP Kennel", "Back Room", "Neon Sign"] as const;
