# Map

- Mapbox GL, market-level pins only (no stall addresses exist). Positions: `shared/markets.ts`.
- Token and style come from env: `NUXT_PUBLIC_MAPBOX_TOKEN` and `NUXT_PUBLIC_MAPBOX_STYLE` (a Mapbox Studio style URL replaces the default; the `--sb-map-*` theme colours are re-applied on top).
- Without a token the page shows a plain SVG pin map, so the demo never shows a blank box.
- Vendors have no exact address: the location button opens a Google Maps text search (`googleMapsQueryUrl` in `shared/markets.ts`) built from stall name and market.
