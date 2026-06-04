import {
  ACTION_COOLDOWNS,
  MAX_UPGRADE_LEVEL,
  NIGHT_RUN_WINDOW_SECONDS,
  SHUTDOWN_GRACE_SECONDS,
  UPGRADE_BONES_COST_PER_LEVEL,
  UPGRADE_VIBE_COST_PER_LEVEL,
  UPGRADES
} from "./constants";
import type { ClubStatus, UpgradeName } from "./types";

export function statusFromNightRun(lastNightRunAt: number, now = Math.floor(Date.now() / 1000)): ClubStatus {
  const elapsed = Math.max(0, now - lastNightRunAt);
  if (elapsed > NIGHT_RUN_WINDOW_SECONDS + SHUTDOWN_GRACE_SECONDS) return "Shut Down";
  if (elapsed > NIGHT_RUN_WINDOW_SECONDS) return "Afterhours";
  return "Running";
}

export function nextReadyAt(lastAt: number, cooldownSeconds: number): number {
  return lastAt === 0 ? 0 : lastAt + cooldownSeconds;
}

export function isReady(lastAt: number, cooldownSeconds: number, now = Math.floor(Date.now() / 1000)): boolean {
  return nextReadyAt(lastAt, cooldownSeconds) <= now;
}

export function upgradeCost(nextLevel: number) {
  if (nextLevel < 1 || nextLevel > MAX_UPGRADE_LEVEL) throw new Error("upgrade level out of range");
  return {
    bones: nextLevel * UPGRADE_BONES_COST_PER_LEVEL,
    vibe: nextLevel * UPGRADE_VIBE_COST_PER_LEVEL
  };
}

export function actionLabel(action: keyof typeof ACTION_COOLDOWNS): string {
  return {
    door: "Work the Door",
    bar: "Run the Bar",
    set: "Drop a Set",
    promo: "Street Promo",
    raid: "Rival Pressure"
  }[action];
}

export function upgradeDescription(upgrade: UpgradeName): string {
  return {
    "DJ Booth": "More HYPE and Street Rep when you Drop a Set.",
    "Security Team": "Better defense and smaller rival losses.",
    "VIP Kennel": "Score multiplier and bigger headline nights.",
    "Back Room": "More BONES and VIBE from club operations.",
    "Neon Sign": "More discovery, HYPE, and uptime score."
  }[upgrade];
}

export { ACTION_COOLDOWNS, UPGRADES };
