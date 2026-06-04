import { useEffect, useState } from "react";
import { shortAddress } from "../lib/format";
import { mockLeaderboard } from "../lib/mockState";

type Row = { rank: number; wallet: string; clubName?: string; score: number; status?: string };

export function Leaderboard() {
  const [rows, setRows] = useState<Row[]>(mockLeaderboard);
  useEffect(() => {
    fetch("/generated/leaderboard.json")
      .then((response) => (response.ok ? response.json() : undefined))
      .then((json) => {
        if (json?.leaderboard?.length) setRows(json.leaderboard);
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="panel">
      <div className="section-title">
        <p className="eyebrow">Leaderboard</p>
        <h2>Pack Reputation</h2>
      </div>
      <table>
        <thead><tr><th>#</th><th>Club</th><th>Wallet</th><th>Score</th><th>Status</th></tr></thead>
        <tbody>
          {rows.sort((a, b) => b.score - a.score).map((row, index) => (
            <tr key={`${row.wallet}-${index}`}>
              <td>{row.rank ?? index + 1}</td>
              <td>{row.clubName || "Underground Club"}</td>
              <td>{shortAddress(row.wallet)}</td>
              <td>{row.score.toLocaleString()}</td>
              <td>{row.status || "indexed"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
