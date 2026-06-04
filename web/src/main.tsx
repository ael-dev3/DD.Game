import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { baseSepolia, hardhat } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { App } from "./App";
import "./styles.css";

const config = createConfig({
  chains: [baseSepolia, hardhat],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"),
    [hardhat.id]: http(import.meta.env.VITE_LOCALHOST_RPC_URL || "http://127.0.0.1:8545")
  }
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
