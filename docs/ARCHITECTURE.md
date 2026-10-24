# Architecture

API, codebase structure and development notes. The app is built; where a section below still says "proposed", the list under **Built differently** wins. Update this file in the same change that makes any of it true (or changes it).

## Stack (decided)

The commands in `CLAUDE.md` and `.worktreeinclude` assume this stack.

| Layer | Choice | Why |
| --- | --- | --- |
| App | Nuxt 4 + Nuxt UI v4, VueUse, TypeScript | One codebase for pages, API routes and OG meta (SSR, so LINE and Messenger previews work) |
| Hosting | Cloudflare Workers | Public URL, stays up through the vote (31 Oct 18:00) |
| Database | Cloudflare D1 | Minimal shared backend: counts are the same for every viewer |
| Files | Cloudflare R2 (only if the share card image is cached) | Generated card images |
| Package manager | pnpm | |
| Lint | antfu eslint | |

## Data flow

- **Official lists are static.** `Data/006-stalls.json` and `Data/007-restaurants.json` (rows with `is_chain = false` only) are bundled at build time and read on the server. It never goes in D1 and is never edited by the app.
- **Everything people do goes in D1:** badge awards, reactions, vendor venues, checklists, visit requests. Seed votes go in D1 too, with `simulated = 1`.
- **Identity has three levels (proposed).**
  - **Diner:** a per-browser anonymous id, a random UUID in an httpOnly cookie set on first request. No accounts, no personal data. Award and reaction POSTs also need a Turnstile token (verified server-side with Siteverify) and pass a per-IP rate limit. The per-browser id is easy to bypass (clear cookies); the README says so.
  - **Eatery owner and city:** simulated email-code sign-in. The server rejects any address not ending in `@example.test`, sends nothing, and returns a 6-digit code (valid 10 minutes) that the form shows and prefills, in every environment. On success, an httpOnly session cookie with a role (`vendor` or `city`, picked on the sign-in screen). The made-up address is the account key. Made-up venues belong to the account; real stalls stay read-only.
  - **Dev:** Turnstile uses its test keys.

## Data model (D1, proposed)

```sql
-- One row per person, stall and badge, ever (badges are never taken away).
awards (
  stall_id   TEXT NOT NULL,      -- 006-stalls id, for example '114-士林-012'
  browser_id TEXT NOT NULL,
  badge      TEXT NOT NULL,      -- 'detour' | 'sit' | 'time' | 'access'
  month      TEXT NOT NULL,      -- 'YYYY-MM' (Asia/Taipei) of the award
  simulated  INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (stall_id, browser_id, badge)
)
-- One award session per person, stall and month.
award_sessions (stall_id, browser_id, month, PRIMARY KEY (stall_id, browser_id, month))

reactions (item_id, browser_id, kind, PRIMARY KEY (item_id, browser_id, kind))  -- kind: 'congrats' | 'want' | 'been'

accounts (id, email, role, created_at)                                  -- email: made-up '@example.test' only; UNIQUE (email, role)
login_codes (email, code, expires_at)                                   -- short-lived; deleted on success
sessions (id, account_id, expires_at)                                   -- id is the httpOnly cookie value

vendor_venues (id, account_id, name, market, created_at)                -- made-up venues only
readiness_items (venue_id, item_key, checked, PRIMARY KEY (venue_id, item_key))
registration_steps (venue_id, step_key, done, PRIMARY KEY (venue_id, step_key))
visit_requests (ref, venue_id, created_at)                              -- status is derived, see below
```

- **Stall page count** = `COUNT(*) FROM awards WHERE stall_id = ? GROUP BY badge` (people per badge). Show only badges with a count above zero.
- **City counter** = `COUNT(*) FROM awards WHERE month = current month` (badges newly given this month).
- **Vendor "this month"** = the same, filtered by `stall_id`.
- **Visit-request status** is derived from `created_at` (for example received, then scheduled after a few minutes, then assessed), so it moves on without a cron job. Always labelled simulated.

## Domain rules: keep in one place

Put these in `server/utils/rules.ts` (or `shared/`), with unit tests. Pages and endpoints call them; nothing re-implements them.

- `isLapsed(stall)`: not computed from dates (the lists carry no end date). True only for a short hand-picked list of demo stalls. A lapsed stall shows no mark and rejects new awards.
- `canAward(stall, browser, badges, today)`: stall listed and not lapsed; 1 to 4 badges; none already given by this browser; no award session by this browser for this stall this month. The labelled demo stall skips the last two checks and can be reset.
- `certifiedYears(stall)`: from a hand-confirmed match table, never automatic matching (see `Data/index.md` rules).
- Milestone thresholds: first, 10, 25 per badge per stall. No cross-stall comparison anywhere.

Badge definitions (key, zh and en label, colour, shape, icon, hint) live in one shared file, for example `shared/badges.ts`, used by the award screen, stall page, filters, vendor view and share card.

## API (proposed)

Diner:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/markets` | Markets with stall counts (map and list) |
| GET | `/api/stalls?market=&badge=` | Stalls in a market, optionally only those with a badge. Ordered by list row, never by certification level. |
| GET | `/api/stalls/:id` | One stall: list data, certified years, lapsed flag, people per badge |
| GET | `/api/stalls/:id/me` | What this browser has given, and whether it can award this month |
| POST | `/api/stalls/:id/awards` | Body `{ badges: string[] }`. Enforces `canAward`. Returns new counts. |
| GET | `/api/counter` | Badges given this month, city-wide |
| GET | `/api/feed?stall=` | News items (newly certified, streaks, milestones), each with a `simulated` flag and reaction counts |
| POST | `/api/feed/:itemId/reactions` | Body `{ kind }`. One of each kind per browser per item. |

Sign-in (eatery owner and city):

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/code` | Body `{ email, role }`. Rejects addresses not ending in `@example.test`. Sends nothing; returns the code for the form to show and prefill. |
| POST | `/api/auth/verify` | Body `{ email, code }`. Sets the session cookie. |
| POST | `/api/auth/logout` | Ends the session |
| GET | `/api/auth/me` | Role of the current session, if any |

City (city session required):

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/city/report?month=` | Badges given that month, city-wide and per market. No per-stall ranking. |
| GET | `/api/city/visit-requests` | Stored visit requests with their simulated status |

Vendor (venue routes need a vendor session; find-my-stall is open):

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/vendor/stalls?q=` | Find my stall: search the 516 stalls by name or market |
| GET | `/api/vendor/stalls/:id` | Read-only vendor view: this month's badges, certified years, share link, own news items, lapsed state |
| POST | `/api/vendor/venues` | Create a made-up venue for the readiness path |
| GET, PUT | `/api/vendor/venues/:id/readiness` | 16 readiness items (10 inspection, 6 guidance) |
| GET, PUT | `/api/vendor/venues/:id/registration` | Registration walkthrough steps |
| POST | `/api/vendor/venues/:id/visit-requests` | Create a request, returns a reference number |
| GET | `/api/vendor/visit-requests/:ref` | Status page data (simulated) |

## Pages (proposed)

| Route | Side | Notes |
| --- | --- | --- |
| `/` | Both | Two doors: 「我是食客」 and 「我是攤商」. Unofficial line. |
| `/diner` | Diner | News strip, city counter, markets and stalls, badge filter |
| `/stall/[id]` | Diner | Stable share URL. SSR Open Graph title, description and image. Award sheet. |
| `/feed` | Diner | Full news feed with reactions |
| `/vendor` | Vendor | Find my stall, or start the readiness path |
| `/vendor/stall/[id]` | Vendor | Read-only vendor view; lapsed stalls get "label ended, here's how to renew" |
| `/vendor/check`, `/vendor/register`, `/vendor/visit/[ref]`, `/vendor/preview` | Vendor | Readiness check, registration walkthrough, visit status, "what diners will see". Need a vendor session. |
| `/login` | Vendor, city | Made-up address, then the on-screen code (prefilled), labelled simulated. `?role=city` for "sign in as the city (demo)". |
| `/city` | City | Monthly badge report and visit requests, read-only, labelled demo |

The stall component is shared between `/stall/[id]`, `/vendor/stall/[id]` and `/vendor/preview`.

## Codebase structure (proposed, Nuxt 4 layout)

```
app/
  pages/           routes above
  components/      StallCard, BadgeMark, OfficialMark, AwardSheet, CityCounter, FeedItem, ShareButton
  composables/
server/
  api/             endpoints above
  utils/           rules.ts, stalls.ts (loads Data/006-stalls.json), db.ts
  database/migrations/
shared/            badges.ts, types shared by app and server
Data/              official lists and parsed data (see Data/index.md)
scripts/           data parsers and seed scripts
docs/              PRODUCT.md, ARCHITECTURE.md
```

## Built differently (24 Oct)

- `stall_id` holds any venue id (`114-士林-012`, `R-0001`, `DEMO-001`). Extra tables: `rate_limits`, `activity` (admin feed). D1 caps bound parameters at 100: never bind id lists.
- Diner list API is `/api/stalls?group=&kind=&badge=&q=`; `/api/markets?kind=` returns pins. `/api/auth/me` always returns `{ role, email }` (nulls when signed out).
- Extra pages: `/demo` (guided demo), `/admin` (owner overview, `x-admin-key` when `NUXT_ADMIN_KEY` is set). Extra API: `/api/demo/seed`, `/api/demo/reset`, `/api/demo-flag`, `/api/admin/overview`.
- Demo mode is a cookie (`sb_demo`) that reveals made-up venues (`DEMO-*`, see `server/utils/venues.ts`). The only lapsed stall is a made-up one.
- Seed votes: `server/utils/seed.ts`, deterministic, `simulated = 1`, seating badges only on names that suggest seating (`mayHaveSeating`).
- The `trustPolicy` in `pnpm-workspace.yaml` is pnpm's default; `pnpm lint`/`nuxi typecheck` may be blocked by it (`semver@6.3.1`), so run `node_modules/.bin/eslint .` and `node_modules/.bin/vue-tsc --noEmit -p .nuxt/tsconfig.app.json` (and `tsconfig.server.json`).
- Design notes for the owner: `docs/design/` (theme, map, demo, setup).

## Development notes

- **UI language:** Traditional Chinese first (zh-TW), mobile first. Test fonts on rare characters and bopomofo in stall names.
- **Time zone:** compute months and lapse dates in Asia/Taipei.
- **Never display, sort, rank or filter by gold/silver or 優/良.** Keep the field in the data but don't send it to the client. Order stalls by list row (`seq`) within a market.
- **Simulated data** carries a visible tag wherever it shows, and `simulated = 1` in D1.
- **Design tokens** (background, sage, moss, ink, badge fills) are in `docs/PRODUCT.md` → Design direction. Define them once as theme tokens.
- **Share links:** Web Share API first, then LINE (`https://social-plugins.line.me/lineit/share?url=`) and copy-link fallbacks. Check the preview with LINE and Messenger before submitting.
- **Before submitting:** test both sides on a phone, on the production URL.

## Commands

```sh
pnpm dev                 # local dev
pnpm db:migrate          # local D1 migrations
pnpm lint                # antfu eslint
pnpm nuxi typecheck      # needs `pnpm cf-typegen` once
pnpm run deploy          # build + wrangler deploy to production
pnpm db:migrate:remote   # production D1 migrations
python3 scripts/parse_restaurants.py   # regenerate Data/007-restaurants.*
python3 scripts/parse_stalls.py        # regenerate Data/006-stalls.* (pip install pdfplumber)
```

## Deployment

- `pnpm run deploy` and `pnpm db:migrate:remote` need `CLOUDFLARE_ACCOUNT_ID` set when wrangler sees several accounts: `CLOUDFLARE_ACCOUNT_ID=<id> pnpm run deploy`.
- Run remote migrations before deploying code that needs them.
- The app must stay up until 31 Oct 18:00. Do not deploy risky changes during the live demo (16:30 to 17:00).

## Worktrees

`.worktreeinclude` copies local secrets (`.env*`, `.dev.vars*`), `worker-configuration.d.ts` and local D1/R2 state (`.wrangler/state/`) into new worktrees. Then run `pnpm install` and `pnpm db:migrate` there.
