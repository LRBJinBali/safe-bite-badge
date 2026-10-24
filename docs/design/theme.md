# Theme

All tweakable style lives in `app/assets/css/theme.css`; edit values there, nothing else.

- `--sb-font-size`: global text size (19px; raise it for a projector).
- `--color-moss-*`: brand palette; Nuxt UI `primary` points at it (`app/app.config.ts`).
- `--sb-bg`, `--sb-sage`, `--sb-ink`: surfaces and text. `--sb-radius-card`: card shape.
- `--sb-badge-*`: the four badge fills. Shapes and icons live in `shared/badges.ts` and `BadgeMark.vue`. Changing a fill means redoing the contrast and colour-blind checks in `docs/PRODUCT.md`.
- `--sb-map-*`: map land, water, park, road, label and pin colours, applied on top of the Mapbox style at runtime.
