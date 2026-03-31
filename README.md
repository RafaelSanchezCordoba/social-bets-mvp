# Social Bets MVP

Private social betting app for groups of friends.

The product uses virtual points only. No real money, no bookmaker logic, and no fixed odds.

## Product Goal

Build a fast MVP where users can:

- sign up and log in
- create or join private groups with invite codes
- create bets inside a group
- place wagers with virtual points
- see pools and implied payouts update in real time
- resolve bets and distribute winnings

## Core Betting Logic

The app uses a parimutuel model.

- total pool = sum of all points bet
- payout multiplier = total pool / points on winning option

Example:

- total pool = 1000
- winning option total = 250
- each winning point receives 4x

## Stack

- `Next.js` App Router
- `TypeScript`
- `Tailwind CSS`
- `Supabase` for Postgres, Auth and Realtime

## Project Status

This repository currently contains the frontend baseline for the MVP.

Next implementation steps:

1. Supabase setup and environment variables
2. Database schema and SQL migrations
3. RPC functions for `place_wager` and bet resolution
4. Auth flows
5. Group and bet management UI

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

## Git Workflow

- `main` -> stable baseline only
- `dev` -> integration branch
- `feature/*` -> new features
- `fix/*` -> bug fixes

Suggested flow:

1. create `dev` from `main`
2. branch from `dev` for each feature
3. merge features back into `dev`
4. merge `dev` into `main` only when stable

## Notes

- prioritize MVP speed over completeness
- keep the code simple and easy to change
- avoid overengineering
