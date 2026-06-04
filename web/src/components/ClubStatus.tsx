import { useCountdown } from "../hooks/useCountdown";
import { formatSeconds } from "../lib/format";

type Props = {
  club: {
    name: string;
    status: string;
    score: number;
    bones: number;
    hype: number;
    vibe: number;
    security: number;
    heat: number;
    pendingRewards: number;
    upgrades: number[];
  };
  cooldowns?: { nightDueAt: number; shutdownAt: number };
  onRunNight: () => void;
  onRevive: () => void;
  onClaimRewards: () => void;
  disabled?: boolean;
};

export function ClubStatus({ club, cooldowns, onRunNight, onRevive, onClaimRewards, disabled }: Props) {
  const night = useCountdown(cooldowns?.nightDueAt);
  const shutdown = useCountdown(cooldowns?.shutdownAt);
  const shutDown = club.status === "SHUT_DOWN";
  const resources = [
    ["BONES", club.bones],
    ["HYPE", club.hype],
    ["VIBE", club.vibe],
    ["SECURITY", club.security],
    ["HEAT", club.heat]
  ];

  return (
    <section className="panel hero-card">
      <div className="hero-art" aria-hidden="true">
        <div className="dog-mask">◖•ᴥ•◗</div>
        <div className="bassline" />
      </div>
      <div className="club-copy">
        <p className="eyebrow">Underground Club</p>
        <h1>{club.name}</h1>
        <div className={`status-pill ${club.status.toLowerCase().replace("_", "-")}`}>{club.status}</div>
        <p className="score">Pack Reputation: <strong>{club.score.toLocaleString()}</strong></p>
        <p className="timer">Run the Night: {cooldowns ? night.label : "mock 9h 12m"}</p>
        {club.status === "AFTERHOURS" && <p className="warn">Afterhours output is reduced and rival raids hit harder.</p>}
        {shutDown && <p className="warn">Club is shut down. Revive before normal actions.</p>}
        <div className="cta-row">
          <button onClick={onRunNight} disabled={disabled || shutDown}>Run the Night</button>
          <button onClick={onRevive} disabled={disabled || !shutDown}>Revive Club</button>
          <button className="ghost" onClick={onClaimRewards} disabled={disabled || club.pendingRewards <= 0}>Claim {club.pendingRewards} REP</button>
        </div>
        <small>Shutdown grace: {cooldowns ? formatSeconds(shutdown.seconds) : "mock 57h"}</small>
      </div>
      <div className="resource-grid">
        {resources.map(([label, value]) => (
          <div className="resource" key={label}>
            <span>{label}</span>
            <strong>{Number(value).toLocaleString()}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
