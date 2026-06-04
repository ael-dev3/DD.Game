import { ActionGrid } from "./components/ActionGrid";
import { ClubStatus } from "./components/ClubStatus";
import { EventFeed } from "./components/EventFeed";
import { Leaderboard } from "./components/Leaderboard";
import { RaidPanel } from "./components/RaidPanel";
import { UpgradeShop } from "./components/UpgradeShop";
import { mockClub, mockCooldowns } from "./lib/mockState";

export function App() {
  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow">DD.Game initial draft</p>
          <h1>Degen Dogs Underground Club</h1>
          <p className="lede">A static gameplay concept for running an underground Degen Dogs club: resources, venue upgrades, rival pressure, and reputation scoring.</p>
        </div>
        <span className="scope-pill">Static draft · reference only</span>
      </header>

      <section className="mock-banner">
        <strong>Initial draft</strong>
        <span>This live site is a preserved design sketch only, with no active gameplay and no further development planned.</span>
      </section>

      <ClubStatus club={mockClub} cooldowns={mockCooldowns} />
      <ActionGrid cooldowns={mockCooldowns} />
      <UpgradeShop levels={mockClub.upgrades} />
      <RaidPanel />
      <div className="two-col">
        <Leaderboard />
        <EventFeed />
      </div>
      <footer>
        Independent clean-room community draft. Not official, not a live game, and not intended for real funds or production use.
      </footer>
    </main>
  );
}
