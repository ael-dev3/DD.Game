export const mockClub = {
  name: "Bass Kennel",
  status: "Running",
  score: 420,
  bones: 188,
  hype: 94,
  vibe: 77,
  security: 51,
  heat: 14,
  streetRep: 33,
  protectedResource: 1,
  upgrades: [1, 1, 0, 2, 1]
};

const now = Math.floor(Date.now() / 1000);

export const mockCooldowns = {
  nightDueAt: now + 9 * 60 * 60 + 12 * 60,
  shutdownAt: now + 57 * 60 * 60,
  doorReadyAt: 0,
  barReadyAt: now + 46 * 60,
  setReadyAt: now + 2 * 60 * 60 + 15 * 60,
  promoReadyAt: 0
};

export const mockLeaderboard = [
  { rank: 1, clubName: "Bass Kennel", score: 420, status: "Running" },
  { rank: 2, clubName: "Bouncer Yard", score: 318, status: "Afterhours" },
  { rank: 3, clubName: "Neon Pack", score: 276, status: "Running" }
];

export const mockEvents = [
  { eventName: "Room opened", label: "Bass Kennel finds a basement, a booth, and a suspiciously loyal door crew." },
  { eventName: "Set dropped", label: "A midnight set shakes the room and pushes Street Rep higher." },
  { eventName: "Defense held", label: "A rival club noses around the Back Room and gets bounced." }
];
