import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { baseSepolia, hardhat } from "wagmi/chains";
import { chainLabel, hasContractsConfigured, isSupportedGameChain } from "../lib/config";
import { shortAddress } from "../lib/format";

export function WalletPanel() {
  const { address, chainId, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const wrongNetwork = isConnected && !isSupportedGameChain(chainId);

  return (
    <section className="panel wallet-panel">
      <div>
        <p className="eyebrow">Wallet</p>
        <h2>{isConnected ? shortAddress(address) : "Connect to run the club"}</h2>
        <p className={hasContractsConfigured ? "ok" : "warn"}>
          {hasContractsConfigured ? `Contracts configured · ${chainLabel(chainId)}` : "Mock mode: add VITE_* contract addresses for live writes"}
        </p>
        <small>Supported chains: Base Sepolia or Hardhat localhost.</small>
      </div>
      <div className="wallet-actions">
        {!isConnected ? (
          <button onClick={() => connect({ connector: connectors[0] })} disabled={!connectors[0] || isPending}>
            Connect injected wallet
          </button>
        ) : (
          <button className="ghost" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
        {wrongNetwork && (
          <>
            <button onClick={() => switchChain({ chainId: baseSepolia.id })}>Switch to Base Sepolia</button>
            <button className="ghost" onClick={() => switchChain({ chainId: hardhat.id })}>Switch to localhost</button>
          </>
        )}
      </div>
    </section>
  );
}
