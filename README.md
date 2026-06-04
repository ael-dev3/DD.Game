# DD.Game — Degen Dogs Underground Club

DD.Game is a standalone clean-room Web3 game prototype where each wallet runs an underground Degen Dogs club on Base Sepolia or a local Hardhat chain.

- Live game: [https://ael-dev3.github.io/DD.Game/](https://ael-dev3.github.io/DD.Game/)
- Repository: [https://github.com/ael-dev3/DD.Game](https://github.com/ael-dev3/DD.Game)

Players keep the bassline alive, run timed club actions, manage resources, upgrade the venue, defend against rival clubs, raid rival clubs, and climb a generated leaderboard.

## Live game

<https://ael-dev3.github.io/DD.Game/>

The hosted build is the static Vite frontend. Without deployed contract addresses it stays in mock review mode, so the UI can be opened from GitHub Pages before a Base Sepolia deployment.

## Clean-room boundary

- This repository is the game repository: `ael-dev3/DD.Game`.
- `ael-dev3/Degen-Dogs-Mission-3` is context only. DD.Game does not import it, modify it, or depend on it at runtime.
- This is an independent community prototype. It does not imply official Degen Dogs approval.
- No Stoke Fire code, contracts, copy, UI, art, tokenomics, names, or assets are used.
- No external copyrighted assets are scraped or reused. The web UI uses original CSS, emoji, and placeholder art.
- Mainnet Degen Dogs token references are informational only. Gameplay uses mock Base Sepolia/local ERC20s.

## What the prototype does

- Deploys two mock ERC20s:
  - `MockSpenderToken` / `CLUB`: faucet token spent on important game actions.
  - `MockRewardToken` / `REP`: reward token minted only by the game contract.
- Deploys `DegenDogUndergroundClub`:
  - one club per wallet
  - timed actions: Work the Door, Run the Bar, Drop a Set, Street Promo
  - upkeep: Run the Night every 72 hours, Afterhours state, Shut Down state, revive flow
  - upgrades: DJ Booth, Security Team, VIP Kennel, Back Room, Neon Sign
  - deterministic raids and defense resource selection
  - claimable rewards and score reads
  - strongly typed events for indexers
- Provides TypeScript rules/helpers for cooldowns, score previews, timers, and UI labels.
- Provides a Vite + React + TypeScript frontend with wagmi/viem wallet support and mock review mode.
- Provides a TypeScript viem indexer that exports event and leaderboard JSON.

## What this is not

- Not audited.
- Not production tokenomics.
- Not mainnet-ready.
- Not safe for real funds.
- Not a dashboard repo migration.
- Not a Stoke Fire clone.

## Repository layout

```text
contracts/                    Solidity game and mock token contracts
scripts/                      Hardhat TypeScript deploy/seed scripts and ABI export
src/game/                     Pure TypeScript game constants, rules, scoring, timers
src/chain/                    Base Sepolia config, address helpers, exported ABI JSON
src/indexer/                  viem event indexer and leaderboard builder
test/                         Hardhat TypeScript tests
web/                          Vite React frontend
web/public/generated/         Example/indexed event and leaderboard JSON
```

## Requirements

- Node.js 22+
- npm
- A wallet with Base Sepolia ETH only if deploying to Base Sepolia

## Local setup

```bash
npm install
npm run web:install
npm run compile
npm run export:abi
npm test
npm run web:build
```

Full local quality gate:

```bash
npm run check
```

## Local chain flow

Terminal 1:

```bash
npm run node
```

Terminal 2:

```bash
npm run deploy:local
```

The local deploy writes `deployments/localhost.json`.

Seed a local wallet after copying addresses into env:

```bash
GAME_CONTRACT_ADDRESS=<game> SPENDER_TOKEN_ADDRESS=<spender> npm run seed:local
```

## Base Sepolia setup

Copy `.env.example` to `.env`:

```bash
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
LOCALHOST_RPC_URL=http://127.0.0.1:8545
RPC_URL=
CHAIN_ID=84532
PRIVATE_KEY=
BASESCAN_API_KEY=
DEPLOYER_ADDRESS=
GAME_CONTRACT_ADDRESS=
SPENDER_TOKEN_ADDRESS=
REWARD_TOKEN_ADDRESS=
START_BLOCK=
TO_BLOCK=
DEPLOYMENT_FILE=
```

Get Base Sepolia ETH from a public faucet for the deployer wallet, then deploy:

```bash
npm run deploy:base-sepolia
```

The deploy writes `deployments/baseSepolia.json` with:

- `contracts.spender`
- `contracts.reward`
- `contracts.game`
- `startBlock`

Do not use Base mainnet WOOF/SUP addresses for gameplay testing.

## Frontend setup

Create `web/.env.local` after local or Base Sepolia deployment:

```bash
VITE_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
VITE_LOCALHOST_RPC_URL=http://127.0.0.1:8545
VITE_GAME_CONTRACT_ADDRESS=0x...
VITE_SPENDER_TOKEN_ADDRESS=0x...
VITE_REWARD_TOKEN_ADDRESS=0x...
VITE_START_BLOCK=123456
```

The wallet config supports Base Sepolia (`84532`) and a local Hardhat chain (`31337`). Use the addresses from `deployments/baseSepolia.json` or `deployments/localhost.json`.

Run the app:

```bash
npm run web:dev
```

Build the app:

```bash
npm run web:build
```

If contract addresses are missing or a wallet has not created a club, the UI shows mock review mode so the interface can still be reviewed.

## Playing v1

1. Connect an injected wallet.
2. Switch to Base Sepolia or Hardhat localhost, depending on the deployed addresses.
3. Faucet `CLUB` mock spender tokens.
4. Approve `CLUB` spend for the game contract.
5. Create a club.
6. Run actions:
   - Work the Door: earns SECURITY and BONES.
   - Run the Bar: earns BONES and VIBE.
   - Drop a Set: spends CLUB + VIBE, earns HYPE and claimable REP.
   - Street Promo: earns HYPE and adds Club Heat.
7. Run the Night before 72 hours to stay ACTIVE.
8. If the club goes SHUT_DOWN after the grace window, revive it with CLUB.
9. Buy venue upgrades with BONES/VIBE.
10. Set defense and raid rival clubs with deterministic resource protection.

## Indexer and leaderboard

Export ABIs first:

```bash
npm run compile
npm run export:abi
```

Run the event indexer:

```bash
GAME_CONTRACT_ADDRESS=0x... START_BLOCK=123456 npm run index:events
# or use deployment JSON:
CHAIN_ID=31337 DEPLOYMENT_FILE=deployments/localhost.json npm run index:events
```

Build the leaderboard:

```bash
npm run build:leaderboard
```

Outputs:

- `web/public/generated/game-events.json`
- `web/public/generated/leaderboard.json`

Generated-output policy: example JSON files are committed for mock review mode; live local indexer outputs and local deployment JSON are ignored. A public `deployments/baseSepolia.json` can be committed intentionally after a testnet deploy because it contains public addresses only.

## Security caveats

- Prototype only, not audited.
- Mock testnet tokens only.
- No real funds.
- No mainnet deployment by default.
- Cooldown/resource games are bot-vulnerable without deeper anti-sybil design.
- Raid mechanics need anti-griefing, target constraints, and economic review before production.
- Reward tokens are mock testing instruments, not value-bearing economics.
- Private keys, seed phrases, RPC secrets, Basescan keys, and mnemonics must never be committed.

## Roadmap

1. Local playable prototype.
2. Base Sepolia public test.
3. Better raid balancing.
4. Farcaster identity and Degen Dogs ownership matching.
5. Season scoring.
6. Anti-sybil and anti-bot design.
7. Art and animation pass.
8. Contract audit before any real-value deployment.

## Current scripts

```bash
npm run compile
npm test
npm run node
npm run deploy:local
npm run deploy:base-sepolia
npm run seed:local
npm run export:abi
npm run index:events
npm run build:leaderboard
npm run web:install
npm run web:dev
npm run web:build
npm run check
```
