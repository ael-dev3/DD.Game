export interface ScoreInputs {
  baseScore: bigint;
  createdAt: number;
  vipKennelLevel: number;
  neonSignLevel: number;
  now?: number;
}

export function computeDisplayScore({ baseScore, createdAt, vipKennelLevel, neonSignLevel, now = Math.floor(Date.now() / 1000) }: ScoreInputs): bigint {
  const uptimeBonus = BigInt(Math.max(0, Math.floor((now - createdAt) / 86_400)));
  const multiplier = BigInt(100 + vipKennelLevel * 5 + neonSignLevel * 3);
  return ((baseScore + uptimeBonus) * multiplier) / 100n;
}

export function raidStealAmount(available: bigint, afterhours = false, securityTeamLevel = 0): bigint {
  const bps = BigInt(afterhours ? 2000 : 1500);
  const reduction = BigInt(securityTeamLevel * 5);
  const max = 75n;
  let raw = (available * bps) / 10_000n;
  raw = raw > reduction ? raw - reduction : 0n;
  return raw > max ? max : raw;
}
