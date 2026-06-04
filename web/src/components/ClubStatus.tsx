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
    streetRep: number;
    upgrades: number[];
  };
  cooldowns?: { nightDueAt: number; shutdownAt: number };
};

function statusClass(status: string) {
  return status.toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");
}

export function ClubStatus({ club, cooldowns }: Props) {
  const night = useCountdown(cooldowns?.nightDueAt);
  const shutdown = useCountdown(cooldowns?.shutdownAt);
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
        <div className={`status-pill ${statusClass(club.status)}`}>{club.status}</div>
        <p className="score">Pack Reputation: <strong>{club.score.toLocaleString()}</strong></p>
        <p className="timer">Run the Night: {cooldowns ? night.label : "draft 9h 12m"}</p>
        <p className="timer">Street Rep queued: <strong>{club.streetRep.toLocaleString()}</strong></p>
        <div className="cta-row">
          <span className="draft-note">72h upkeep pressure</span>
          <span className="draft-note">Upgrade-first resource loop</span>
          <span className="draft-note">Rival heat risk</span>
        </div>
        <small>Shutdown grace concept: {cooldowns ? formatSeconds(shutdown.seconds) : "draft 57h"}</small>
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
