import { mockLeaderboard } from "../lib/mockState";

type Row = { rank: number; clubName: string; score: number; status: string };

export function Leaderboard() {
  const rows: Row[] = [...mockLeaderboard];

  return (
    <section className="panel">
      <div className="section-title">
        <p className="eyebrow">Leaderboard</p>
        <h2>Pack Reputation</h2>
      </div>
      <table>
        <thead><tr><th>#</th><th>Club</th><th>Score</th><th>Status</th></tr></thead>
        <tbody>
          {rows.sort((a, b) => b.score - a.score).map((row, index) => (
            <tr key={`${row.clubName}-${index}`}>
              <td>{row.rank ?? index + 1}</td>
              <td>{row.clubName}</td>
              <td>{row.score.toLocaleString()}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
