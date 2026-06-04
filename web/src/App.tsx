import { useState } from "react";
import { type Address } from "viem";
import { ActionGrid } from "./components/ActionGrid";
import { ClubStatus } from "./components/ClubStatus";
import { EventFeed } from "./components/EventFeed";
import { Leaderboard } from "./components/Leaderboard";
import { MockModeBanner } from "./components/MockModeBanner";
import { RaidPanel } from "./components/RaidPanel";
import { UpgradeShop } from "./components/UpgradeShop";
import { WalletPanel } from "./components/WalletPanel";
import { useClubState } from "./hooks/useClubState";
import { useGameActions } from "./hooks/useGameActions";

export function App() {
  const state = useClubState();
  const actions = useGameActions(() => void state.refetchAll());
  const [clubName, setClubName] = useState("Bass Kennel");
  const writeDisabled = state.mockMode || actions.pending;

  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow">DD.Game prototype</p>
          <h1>Degen Dogs Underground Club</h1>
        </div>
        <span className="chain-pill">Base Sepolia / localhost · mock tokens only</span>
      </header>
      <WalletPanel />
      <MockModeBanner enabled={state.mockMode} reason={state.error} />
      {!state.hasLiveClub && state.isConfigured && (
        <section className="panel create-panel">
          <div>
            <p className="eyebrow">Open the room</p>
            <h2>Create your club</h2>
          </div>
          <input value={clubName} onChange={(event) => setClubName(event.target.value)} maxLength={31} />
          <button onClick={() => actions.createClub(clubName)} disabled={!state.address || actions.pending}>Create club</button>
        </section>
      )}
      {actions.error && <div className="mock-banner error"><strong>Write error</strong><span>{actions.error}</span></div>}
      <ClubStatus club={state.club} cooldowns={state.cooldowns} disabled={writeDisabled} onRunNight={actions.runNight} onRevive={actions.reviveClub} onClaimRewards={actions.claimRewards} />
      <ActionGrid cooldowns={state.cooldowns} disabled={writeDisabled} actions={actions} />
      <UpgradeShop levels={state.club.upgrades} disabled={writeDisabled} buyUpgrade={actions.buyUpgrade} />
      <RaidPanel disabled={writeDisabled} setDefense={actions.setDefense} raidClub={(target: Address, resource: number) => actions.raidClub(target, resource)} />
      <div className="two-col">
        <Leaderboard />
        <EventFeed />
      </div>
      <footer>
        Independent clean-room community prototype. Not official, not audited, no mainnet funds.
      </footer>
    </main>
  );
}
