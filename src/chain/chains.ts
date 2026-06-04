export const baseSepolia = {
  id: 84532,
  name: "Base Sepolia",
  network: "base-sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://sepolia.base.org"] },
    public: { http: ["https://sepolia.base.org"] }
  },
  blockExplorers: {
    default: { name: "BaseScan", url: "https://sepolia.basescan.org" }
  },
  testnet: true
} as const;

export const hardhatLocal = {
  id: 31337,
  name: "Hardhat Localhost",
  network: "hardhat-localhost",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] }
  },
  testnet: true
} as const;

export function chainFromEnv(chainId = process.env.CHAIN_ID) {
  return chainId === "31337" ? hardhatLocal : baseSepolia;
}
