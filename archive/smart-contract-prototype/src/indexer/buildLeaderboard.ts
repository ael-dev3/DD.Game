import fs from "node:fs";
import path from "node:path";

interface StoredEvent {
  eventName: string;
  args: Record<string, string | number | boolean | null>;
}

interface PlayerScore {
  wallet: string;
  score: number;
  actions: number;
  raidsWon: number;
  defensesWon: number;
  lastEvent: string;
}

const EVENTS_PATH = path.join(process.cwd(), "web", "public", "generated", "game-events.json");
const OUT_PATH = path.join(process.cwd(), "web", "public", "generated", "leaderboard.json");

function addScore(map: Map<string, PlayerScore>, wallet: string, delta: number, eventName: string) {
  const key = wallet.toLowerCase();
  const row = map.get(key) || { wallet, score: 0, actions: 0, raidsWon: 0, defensesWon: 0, lastEvent: eventName };
  row.score += delta;
  row.lastEvent = eventName;
  if (["DoorWorked", "BarRun", "SetDropped", "NightRun", "ClubRevived", "UpgradePurchased", "StreetPromo"].includes(eventName)) row.actions += 1;
  if (eventName === "RaidResolved") row.raidsWon += 1;
  map.set(key, row);
}

function ownerArg(event: StoredEvent): string | undefined {
  return String(event.args.player || event.args.attacker || "") || undefined;
}

function main() {
  const raw = fs.existsSync(EVENTS_PATH) ? JSON.parse(fs.readFileSync(EVENTS_PATH, "utf8")) : { events: [] };
  const map = new Map<string, PlayerScore>();
  for (const event of raw.events as StoredEvent[]) {
    if (event.eventName === "ClubCreated") addScore(map, String(event.args.player), 100, event.eventName);
    if (["DoorWorked", "BarRun"].includes(event.eventName)) addScore(map, ownerArg(event)!, 25, event.eventName);
    if (event.eventName === "StreetPromo") addScore(map, ownerArg(event)!, 15, event.eventName);
    if (event.eventName === "SetDropped") addScore(map, ownerArg(event)!, 50, event.eventName);
    if (event.eventName === "NightRun") addScore(map, ownerArg(event)!, 35, event.eventName);
    if (event.eventName === "UpgradePurchased") addScore(map, ownerArg(event)!, 30, event.eventName);
    if (event.eventName === "RaidResolved" && event.args.defenderWon === false) addScore(map, String(event.args.attacker), 40, event.eventName);
    if (event.eventName === "RaidResolved" && event.args.defenderWon === true) {
      const defender = String(event.args.defender || "");
      if (defender) {
        const key = defender.toLowerCase();
        const row = map.get(key) || { wallet: defender, score: 0, actions: 0, raidsWon: 0, defensesWon: 0, lastEvent: event.eventName };
        row.score += 45;
        row.defensesWon += 1;
        row.lastEvent = event.eventName;
        map.set(key, row);
      }
    }
  }

  const leaderboard = [...map.values()].sort((a, b) => b.score - a.score).map((row, index) => ({ rank: index + 1, ...row }));
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), leaderboard }, null, 2));
  console.log(`wrote ${leaderboard.length} leaderboard rows to ${OUT_PATH}`);
}

main();
