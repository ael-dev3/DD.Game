import { useCountdown } from "../hooks/useCountdown";

type Cooldowns = {
  doorReadyAt: number;
  barReadyAt: number;
  setReadyAt: number;
  promoReadyAt: number;
};

function ActionCard({ title, copy, readyAt }: { title: string; copy: string; readyAt?: number }) {
  const countdown = useCountdown(readyAt);
  return (
    <article className="action-card">
      <h3>{title}</h3>
      <p>{copy}</p>
      <span className="cooldown">{readyAt ? countdown.label : "ready"}</span>
      <span className="draft-note">Initial draft loop only</span>
    </article>
  );
}

export function ActionGrid({ cooldowns }: { cooldowns?: Cooldowns }) {
  return (
    <section className="panel">
      <div className="section-title">
        <p className="eyebrow">Timed actions</p>
        <h2>Keep the bassline moving</h2>
      </div>
      <div className="action-grid">
        <ActionCard title="Work the Door" copy="Earn SECURITY and BONES. Security Team boosts the door." readyAt={cooldowns?.doorReadyAt} />
        <ActionCard title="Run the Bar" copy="Earn BONES and VIBE. Back Room upgrades improve output." readyAt={cooldowns?.barReadyAt} />
        <ActionCard title="Drop a Set" copy="Spend VIBE to raise HYPE and build Street Rep." readyAt={cooldowns?.setReadyAt} />
        <ActionCard title="Street Promo" copy="Earn HYPE fast, but add Club Heat." readyAt={cooldowns?.promoReadyAt} />
      </div>
    </section>
  );
}
