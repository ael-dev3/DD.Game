import { useState } from "react";
import type { Address } from "viem";

const resources = [
  [1, "BONES"],
  [2, "HYPE"],
  [3, "VIBE"],
  [4, "SECURITY"]
] as const;

export function RaidPanel({ disabled, setDefense, raidClub }: { disabled?: boolean; setDefense: (resource: number) => void; raidClub: (target: Address, resource: number) => void }) {
  const [target, setTarget] = useState("");
  const [resource, setResource] = useState(1);
  const validTarget = /^0x[a-fA-F0-9]{40}$/.test(target);

  return (
    <section className="panel raid-panel">
      <div className="section-title">
        <p className="eyebrow">Rival clubs</p>
        <h2>Guard the Back Room</h2>
      </div>
      <p>Defense is deterministic: if the attacker chooses the resource you protected, you win and they steal nothing.</p>
      <div className="form-row">
        <label>
          Target wallet
          <input value={target} onChange={(event) => setTarget(event.target.value)} placeholder="0x rival club wallet" />
        </label>
        <label>
          Target resource
          <select value={resource} onChange={(event) => setResource(Number(event.target.value))}>
            {resources.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      <div className="cta-row">
        <button className="ghost" onClick={() => setDefense(resource)} disabled={disabled}>Protect {resources.find(([value]) => value === resource)?.[1]}</button>
        <button onClick={() => raidClub(target as Address, resource)} disabled={disabled || !validTarget}>Raid Rival Club</button>
      </div>
    </section>
  );
}
