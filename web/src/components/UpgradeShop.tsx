import { upgradeCost } from "../../../src/game/rules";

const upgrades = ["DJ Booth", "Security Team", "VIP Kennel", "Back Room", "Neon Sign"];
const copy = [
  "Bigger HYPE and REP from Drop a Set.",
  "More defense and smaller rival raid losses.",
  "Score multiplier for high-rep clubs.",
  "More BONES/VIBE from club ops.",
  "More discovery, HYPE, and leaderboard score."
];

export function UpgradeShop({ levels, disabled, buyUpgrade }: { levels: number[]; disabled?: boolean; buyUpgrade: (index: number) => void }) {
  return (
    <section className="panel">
      <div className="section-title">
        <p className="eyebrow">Venue upgrades</p>
        <h2>Build the room</h2>
      </div>
      <div className="upgrade-grid">
        {upgrades.map((name, index) => {
          const level = levels[index] ?? 0;
          const next = level + 1;
          const cost = next <= 5 ? upgradeCost(next) : undefined;
          return (
            <article className="upgrade-card" key={name}>
              <h3>{name}</h3>
              <p>{copy[index]}</p>
              <span>Level {level}/5</span>
              <small>Next cost: {cost ? `${cost.bones} BONES + ${cost.vibe} VIBE` : "maxed"}</small>
              <button onClick={() => buyUpgrade(index)} disabled={disabled || level >= 5}>Buy upgrade</button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
