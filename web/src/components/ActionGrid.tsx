import { useCountdown } from "../hooks/useCountdown";

type Cooldowns = {
  doorReadyAt: number;
  barReadyAt: number;
  setReadyAt: number;
  promoReadyAt: number;
};

function ActionCard({ title, copy, readyAt, disabled, onClick }: { title: string; copy: string; readyAt?: number; disabled?: boolean; onClick: () => void }) {
  const countdown = useCountdown(readyAt);
  const locked = disabled || Boolean(readyAt && !countdown.ready);
  return (
    <article className="action-card">
      <h3>{title}</h3>
      <p>{copy}</p>
      <span className="cooldown">{readyAt ? countdown.label : "ready"}</span>
      <button onClick={onClick} disabled={locked}>{locked ? "Cooling down" : title}</button>
    </article>
  );
}

export function ActionGrid({ cooldowns, disabled, actions }: { cooldowns?: Cooldowns; disabled?: boolean; actions: { workDoor: () => void; runBar: () => void; dropSet: () => void; streetPromo: () => void; faucetSpender: () => void; approveSpender: () => void } }) {
  return (
    <section className="panel">
      <div className="section-title">
        <p className="eyebrow">Timed actions</p>
        <h2>Keep the bassline moving</h2>
      </div>
      <div className="utility-row">
        <button className="ghost" onClick={actions.faucetSpender} disabled={disabled}>Faucet CLUB</button>
        <button className="ghost" onClick={actions.approveSpender} disabled={disabled}>Approve CLUB spend</button>
      </div>
      <div className="action-grid">
        <ActionCard title="Work the Door" copy="Earn SECURITY and BONES. Security Team boosts the door." readyAt={cooldowns?.doorReadyAt} disabled={disabled} onClick={actions.workDoor} />
        <ActionCard title="Run the Bar" copy="Earn BONES and VIBE. Back Room upgrades improve output." readyAt={cooldowns?.barReadyAt} disabled={disabled} onClick={actions.runBar} />
        <ActionCard title="Drop a Set" copy="Spend CLUB and VIBE to earn HYPE and claimable Street Rep." readyAt={cooldowns?.setReadyAt} disabled={disabled} onClick={actions.dropSet} />
        <ActionCard title="Street Promo" copy="Earn HYPE fast, but add Club Heat." readyAt={cooldowns?.promoReadyAt} disabled={disabled} onClick={actions.streetPromo} />
      </div>
    </section>
  );
}
