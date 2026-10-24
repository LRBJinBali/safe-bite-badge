# Setup

Put these in `.dev.vars` (local) or Worker secrets; none is required to run the demo.

| Variable | Effect when set |
| --- | --- |
| `NUXT_PUBLIC_MAPBOX_TOKEN` | Real map instead of the SVG fallback |
| `NUXT_PUBLIC_MAPBOX_STYLE` | Your custom Mapbox style |
| `NUXT_ADMIN_KEY` | `/admin` needs `?key=<value>` |
| `NUXT_PUBLIC_TURNSTILE_SITE_KEY`, `NUXT_TURNSTILE_SECRET` | Turnstile on awards and reactions (test keys locally) |

`pnpm db:migrate`, then `pnpm dev`. Pages: `/` home, `/diner`, `/vendor`, `/city`, `/admin`, `/demo`.
