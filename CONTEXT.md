# Social Prediction App — Project Context

## 🎯 Goal

Build a private social prediction/betting app where users can create and join groups, place bets using virtual points, and see real-time updates of odds and pools.

This is an MVP-focused project. Prioritize simplicity, speed, and clean architecture over completeness.

---

## 🧠 Core Concept

- Users join **private groups** via invite code
- Each group contains:
  - Members
  - Active bets
- Bets are created by users inside a group
- Users place **points (not real money)** on bet options
- The bet creator resolves the outcome

---

## 💰 Betting Logic (CRITICAL)

Use a **parimutuel system**:

- Total pool = sum of all points bet
- Payout = total pool / points on winning option

Example:

- Total pool = 1000
- Winning option total = 250
- Each user gets 4x their bet

⚠️ Do NOT implement fixed odds or bookmaker logic.

---

## ⚡ UX Requirements

- Real-time updates (core feature)
  - When a user places a bet:
    - option totals update instantly
    - implied odds update instantly
- Fast UI (no lag, minimal re-renders)
- Simple dashboard:
  - List of active bets per group
  - Optional: global overview across groups

---

## 🧱 Tech Stack

- Frontend: Next.js (App Router, latest stable)
- Backend: Supabase
  - PostgreSQL
  - Auth (email/password + optional Google)
  - Realtime subscriptions
- Styling: Tailwind CSS

---

## 🗄️ Database Schema (MVP)

### groups

- id (uuid, pk)
- name (text)
- invite_code (text, unique)
- created_at (timestamp)

### group_members

- id (uuid, pk)
- user_id (uuid)
- group_id (uuid)
- points (int, default: 1000)
- created_at

### bets

- id (uuid, pk)
- group_id (uuid)
- creator_id (uuid)
- title (text)
- status (open | closed | resolved)
- ends_at (timestamp)
- created_at

### bet_options

- id (uuid, pk)
- bet_id (uuid)
- option_text (text)
- total_points (int, default 0)

### wagers

- id (uuid, pk)
- user_id (uuid)
- bet_option_id (uuid)
- points (int)
- created_at

---

## 🔁 Core Actions

### Place Bet

- Deduct points from user
- Increase `bet_options.total_points`
- Insert into `wagers`
- Must be atomic (transaction or RPC)

### Resolve Bet

- Set bet as resolved
- Calculate payouts:
  - total_pool / winning_option_points
- Distribute points to winners

---

## ⚙️ Backend Logic

Use Supabase RPC functions for:

- placing bets (atomic updates)
- resolving bets (payout distribution)

Example function:

- increment_option_points
- place_wager (recommended)

---

## 🔴 Important Constraints

- No real money (points only)
- Keep logic simple (MVP first)
- Avoid premature optimization
- Avoid overengineering (no microservices, no complex state managers)

---

## 🧑‍💻 Coding Guidelines

- Write clean, minimal code
- Prefer simple solutions over abstract patterns
- Keep components small and focused
- Use server actions where appropriate
- Avoid unnecessary libraries

---

## 🎨 UI Guidelines

- Minimalistic UI
- Focus on:
  - clarity
  - speed
  - usability
- Avoid complex animations
- Real-time feedback is more important than visuals

---

## 🚀 MVP Scope

Must include:

- Auth (signup/login)
- Create/join group
- Create bet
- Place bet
- Resolve bet
- Real-time updates of pools

Nice to have (later):

- Leaderboard
- User profiles
- Notifications

---

## ❌ Out of Scope (for now)

- Payments / real money
- Advanced analytics
- Complex permissions system
- Mobile app (web only first)

---

## 🧭 How to Assist

When helping:

- Be concise and practical
- Provide production-ready code
- Avoid unnecessary explanations
- Prioritize MVP delivery
- Suggest improvements only if they are simple and impactful

If unsure:

- Ask for clarification instead of guessing

---

## 🏁 Priority

Speed of execution > perfection

The goal is to get a working MVP as fast as possible.

## 🌿 Git Workflow & Version Control Rules

This project is maintained by a single developer but follows simplified professional Git practices.

### 🔀 Branching Strategy

- `main` → stable, production-ready code only
- `dev` → integration branch for ongoing work
- `feature/*` → all new features
- `fix/*` → bug fixes

Examples:

- feature/create-group
- feature/place-bet
- fix/bet-resolution

---

### 🧱 Workflow Rules

1. NEVER commit directly to `main`
2. ALWAYS create a feature branch from `dev`
3. After finishing a feature:
   - Merge into `dev`
4. Only merge `dev` → `main` when:
   - Feature is complete
   - No breaking bugs

---

### 🧾 Commit Message Style

Use clear, simple, and consistent commit messages:

Format:

- feat: add create group functionality
- fix: correct payout calculation bug
- refactor: simplify bet logic
- chore: update dependencies

Avoid:

- vague messages like "update", "fix stuff", "changes"

---

### 🚀 Release Strategy

- First release = MVP working end-to-end
- Tag releases manually (v0.1, v0.2, v1.0)
- No CI/CD required for now

---

### ⚠️ Important Constraints

- Keep commits small and focused
- Do not mix unrelated changes in one commit
- Prefer multiple small commits over one big commit

---

### 🤖 How to Assist with Git

When generating code or making changes:

- Suggest the correct branch name
- Suggest a commit message
- Assume work is happening in a feature branch

Example:
"Create a new branch: feature/create-group"
"Commit message: feat: implement group creation flow"

---

## 🏁 Priority

Clarity and learning good practices > strict enterprise complexity

Keep it simple but structured.
