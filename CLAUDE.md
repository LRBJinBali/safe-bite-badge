# Safe-Bite Badge (安心標章)

Hackathon entry for the Taipei 市政 debug松: a mobile-first, Traditional Chinese-first web app where residents award four community badges to night-market stalls that already hold the Health Department's Smile Label. Two doors on one shared backend: diners ("I'm a diner") and vendors ("I run a food stall").

**Deadlines (24 Oct 2026):** working public link by 12:00, feature freeze about 15:00, submission closes 16:00, live demo 16:30 to 17:00 (operated live, about 2 minutes). The public vote runs until 31 Oct 18:00, so the app must stay online and work on phones until then.

## Read first

- `docs/PRODUCT.md`: principles, known gaps, roadmap, decisions log, then the full PRD (flows, scope, badges, design tokens, risks).
- `docs/ARCHITECTURE.md`: stack, data model, domain rules, API, codebase structure, development notes, deployment.
- `Data/index.md`: every data file with its status, schema, counts, and the data rules.

## References

- `Data/00n-<topic>.*`: data resources (pdf, md, csv, json). Numbered and listed in `Data/index.md`; never renumber.
- Live PRD: https://claude.ai/artifact/3ZAHwjQXdJkwX9c1iGuasP (read-only share copy; `docs/PRODUCT.md` is the source of truth and may be newer).
- Organiser: https://puma.taipei/hackathon

## Guardrails (never break these)

Full reasoning in `docs/PRODUCT.md` → Principles.

- Only celebrate: no negative reviews, ratings, rankings, "most/top", or comparisons between stalls. Never show zero counts or mark absence.
- Never issue or imitate the official mark. Always show the "unofficial, built on public Health Department lists" line.
- Strict gate: only stalls on the 113 and 114 lists and 優/良 restaurants (chains and institutional venues removed) appear or receive badges. Lapsed stalls: no mark, no new badges, wording "label ended", never "failed".
- Show only that a stall or restaurant is certified. Never display, sort, rank or filter by gold/silver (金質/銀質) or 優/良; the data keeps them, the UI ignores them.
- Voting: up to four badges per award, each badge once per person and stall ever, one award session per person and stall per month. Rules live in one place (`docs/ARCHITECTURE.md` → Domain rules).
- Diners have no accounts; vendors sign in with an emailed one-time code, for made-up venues only. No free text, no real personal data. New vendor venues are made up.
- Colour is never the only signal: every badge shows shape, icon and text label.
- Label everything simulated (seed votes, made-up venues, visit routing and status, streaks, seed-based milestones) in the UI and the README.
- Stall key is `id` (for example `114-士林-012`), never the registration number or name.
- Don't use the organiser's logo or characters.

## Commands

```sh
pnpm dev                 # local dev, login codes show as a toast
pnpm db:migrate          # local D1 migrations
pnpm lint                # antfu eslint
pnpm nuxi typecheck      # needs `pnpm cf-typegen` once
pnpm run deploy          # build + wrangler deploy to production
pnpm db:migrate:remote   # production D1 migrations
# Both need CLOUDFLARE_ACCOUNT_ID when wrangler sees several accounts (Architecture → Deployment)
```

## Conventions

- Commits are atomic, and the prefix must be `feat:`, `docs:` or `build:`.
- Keep context in the codebase, not in memory. A new team decision goes into `docs/PRODUCT.md` (decisions log, plus the section it changes) in the same commit as the code; a fixed gap comes off the known gaps list.
- When code makes a "proposed" part of `docs/ARCHITECTURE.md` real or different, update that section in the same commit.
- New data files take the next `00n-` number and get a row in `Data/index.md`.
