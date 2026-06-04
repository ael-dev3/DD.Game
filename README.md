# DD.Game — Degen Dogs Underground Club

DD.Game is a static initial draft for a Degen Dogs underground club game concept.

- Live draft: [https://ael-dev3.github.io/DD.Game/](https://ael-dev3.github.io/DD.Game/)
- Repository: [https://github.com/ael-dev3/DD.Game](https://github.com/ael-dev3/DD.Game)

Players keep the bassline alive, run timed club actions, manage resources, upgrade the venue, handle rival club pressure, and climb a reputation board. The hosted site is now a non-interactive concept draft only.

## Current status

- Static website only.
- No wallet connection.
- No live contracts.
- No token, faucet, approval, or transaction flows.
- Smart-contract and wallet-integration prototype archived in [`archive/smart-contract-prototype/`](archive/smart-contract-prototype/).
- No further development is planned for this prototype unless the project is intentionally restarted later.

## Live draft

<https://ael-dev3.github.io/DD.Game/>

## Clean-room boundary

- This repository is the game draft repository: `ael-dev3/DD.Game`.
- `ael-dev3/Degen-Dogs-Mission-3` is context only. DD.Game does not import it, modify it, or depend on it at runtime.
- This is an independent community draft. It does not imply official Degen Dogs approval.
- No Stoke Fire code, contracts, copy, UI, art, tokenomics, names, or assets are used.
- No external copyrighted assets are scraped or reused. The web UI uses original CSS, emoji, and placeholder art.

## What remains active

- `web/` — Vite + React static website.
- `src/game/` — pure TypeScript gameplay constants/rules used by the static draft UI.
- `.github/workflows/` — CI and GitHub Pages deployment for the static website.

## Archived prototype

The earlier smart-contract prototype is preserved for reference only in [`archive/smart-contract-prototype/`](archive/smart-contract-prototype/). It includes:

- Solidity contracts and mock token contracts.
- Hardhat config, deployment scripts, seed scripts, tests, and ABI export tooling.
- Generated ABI files, chain helpers, and indexer scripts.
- Earlier wallet/contract frontend integration files.
- Earlier root and web package manifests.

Archive code is not part of the active build or hosted website.

## Repository layout

```text
archive/smart-contract-prototype/  Archived Hardhat/wallet prototype for reference only
src/game/                          Static draft gameplay constants, rules, scoring, timers
web/                               Hosted Vite React static draft
.github/workflows/                 Static CI and GitHub Pages deploy workflows
```

## Requirements

- Node.js 22+
- npm

## Local setup

```bash
npm install
npm run web:install
npm run check
```

Run the static draft locally:

```bash
npm run web:dev
```

Build the static draft:

```bash
npm run web:build
```

## Current scripts

```bash
npm run typecheck
npm run web:install
npm run web:dev
npm run web:build
npm run check
```

## Project notes

- Prototype only.
- Not official.
- Not a live game.
- Not production-ready.
- Not intended for real funds, live economies, or production deployment.
- Further contract or wallet work should start from an explicit new decision, not from the active static draft.
