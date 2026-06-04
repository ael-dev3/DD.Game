import type { Address } from "viem";

export interface GameAddresses {
  chainId: number;
  game?: Address;
  spender?: Address;
  reward?: Address;
  startBlock?: bigint;
}

export const emptyAddresses: GameAddresses = { chainId: 84532 };

export function normalizeAddress(value?: string): Address | undefined {
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) return undefined;
  return value as Address;
}
