export const mockClub = {
  owner: "0xDDBa55000000000000000000000000000000C1ub",
  name: "Mock Bass Kennel",
  status: "ACTIVE",
  score: 420,
  bones: 188,
  hype: 94,
  vibe: 77,
  security: 51,
  heat: 14,
  pendingRewards: 33,
  protectedResource: 1,
  upgrades: [1, 1, 0, 2, 1]
};

export const mockLeaderboard = [
  { rank: 1, wallet: "0xDDBa55000000000000000000000000000000C1ub", clubName: "Mock Bass Kennel", score: 420, status: "ACTIVE" },
  { rank: 2, wallet: "0xB0unce000000000000000000000000000000000", clubName: "Bouncer Yard", score: 318, status: "AFTERHOURS" },
  { rank: 3, wallet: "0xD15c000000000000000000000000000000000000", clubName: "Neon Pack", score: 276, status: "ACTIVE" }
];

export const mockEvents = [
  { eventName: "ClubCreated", label: "Mock Bass Kennel opened under the street." },
  { eventName: "SetDropped", label: "DJ booth shook the room and earned Street Rep." },
  { eventName: "RaidResolved", label: "A rival club bounced off the guarded Back Room." }
];
