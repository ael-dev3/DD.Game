import type { Address } from "viem";

function addressFromEnv(value: string | undefined): Address | undefined {
  return value && /^0x[a-fA-F0-9]{40}$/.test(value) ? (value as Address) : undefined;
}

export const baseSepoliaChainId = 84532;
export const hardhatLocalChainId = 31337;
export const supportedChainIds = [baseSepoliaChainId, hardhatLocalChainId] as const;

export function isSupportedGameChain(chainId?: number) {
  return Boolean(chainId && supportedChainIds.includes(chainId as (typeof supportedChainIds)[number]));
}

export function chainLabel(chainId?: number) {
  if (chainId === baseSepoliaChainId) return "Base Sepolia";
  if (chainId === hardhatLocalChainId) return "Hardhat localhost";
  return "unsupported network";
}

export const contractConfig = {
  game: addressFromEnv(import.meta.env.VITE_GAME_CONTRACT_ADDRESS),
  spender: addressFromEnv(import.meta.env.VITE_SPENDER_TOKEN_ADDRESS),
  reward: addressFromEnv(import.meta.env.VITE_REWARD_TOKEN_ADDRESS),
  startBlock: import.meta.env.VITE_START_BLOCK ? BigInt(import.meta.env.VITE_START_BLOCK) : undefined
};

export const hasContractsConfigured = Boolean(contractConfig.game && contractConfig.spender && contractConfig.reward);
