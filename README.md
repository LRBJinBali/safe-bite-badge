# Safe-Bite Badge (安心標章)

Unofficial community badges for night-market stalls that already hold the Taipei Health Department's Smile Label. Built for the Taipei 市政 debug松.

- **Run:** `pnpm install`, `pnpm db:migrate`, `pnpm dev`, open `/demo`. Setup and env: `docs/design/setup.md`.
- **Real data:** the 113 and 114 Smile Label lists (516 stalls) and the 優/良 restaurant list (876 independent venues), parsed from the official files in `Data/`.
- **Simulated:** seed badge votes and reactions, made-up demo venues and vendor practice venues, the vendor and city sign-in (`@example.test` only, no email is sent, anyone can sign in), visit-request routing and status.
- **Limits:** per-browser vote limits are easy to bypass, even with Turnstile and the per-IP rate limit.
- **Built with:** Nuxt 4, Nuxt UI, Cloudflare Workers and D1, Mapbox GL, Claude Code (AI-assisted build).
- **100-day idea:** the Health Department opens its certification lists as an API, routes coaching-visit requests, pilots one market, and turns on real sign-in. Costs to be confirmed (`docs/PRODUCT.md`).
