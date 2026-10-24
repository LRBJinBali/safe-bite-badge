# Safe-Bite Badge (安心標章)

Unofficial community badges for night-market stalls and restaurants that already hold the Taipei Health Department's Smile Label (night-market stalls) or 優/良 hygiene grade (restaurants). Built for the Taipei 市政 debug松. Unofficial, built on public Health Department lists.

- **Live:** https://safebitebadge.com (stays up through the public vote, 31 Oct 18:00). Guided demo: https://safebitebadge.com/demo.
- **Run:** `pnpm install`, `pnpm db:migrate`, `pnpm dev`, open `/demo`. Setup and env: `docs/design/setup.md`; deploy: `docs/ARCHITECTURE.md` → Deployment.
- **Two doors:** diners browse certified venues grouped by Taipei district (each stall shows its night market) and award up to four badges; vendors find their stall or restaurant, see its badges and news, and run the readiness check. `/demo` shows both side by side on one screen, with its own zoom and full-screen buttons.
- **Real data:** the 113 and 114 Smile Label lists (516 stalls) and the 優/良 restaurant list (876 independent venues, treated as round 114), parsed from the official files in `Data/`. Night-market stalls and restaurants are shown as equals, with the single "Officially certified" mark; gold/silver and 優/良 are never shown.
- **Simulated:** seed badge votes and reactions (stalls and about 40% of restaurants), streak and seed-based milestone news items, made-up demo venues (including a demo restaurant and the only "label ended" example) and vendor practice venues, the vendor and city sign-in (`@example.test` only, no email is sent, anyone can sign in), visit-request routing and status. All tagged in the UI.
- **Limits:** per-browser vote limits are easy to bypass, even with Turnstile and the per-IP rate limit. Sign-in protects nothing, so real stalls stay read-only. Seated/takeaway seed badges are guessed from names.
- **Built with:** Nuxt 4, Nuxt UI, Cloudflare Workers and D1, Mapbox GL (SVG fallback without a token), Claude Code (AI-assisted build).
- **100-day idea:** the Health Department opens its certification lists as an API, routes coaching-visit requests, pilots one market, and turns on real sign-in. Costs to be confirmed (`docs/PRODUCT.md`).
