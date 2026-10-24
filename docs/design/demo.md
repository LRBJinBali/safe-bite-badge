# Demo mode

- Open `/demo`. It turns on a per-browser cookie (`sb_demo`) that reveals made-up venues (`DEMO-001`, `DEMO-002`, `DEMO-LAPSED-001`), all labelled simulated. Real stalls never lapse.
- `DEMO-001` ignores the per-person limits, so awards can be repeated on stage. Reset: button on `/demo` or `/admin`.
- The script is the `steps` array at the top of `app/pages/demo.vue`: left pane diner, right pane vendor, one automated award. Edit URLs and captions there.
- Seed votes (simulated, tagged) are created automatically on first visit, or `POST /api/demo/seed?force=1`.
- Panes opened with `?embed=1` hide the page chrome and poll every 3 s so both sides move together.
- Sign-in is simulated on every environment: `@example.test` only, the code is shown on screen.
- Layout: on windows 900 px or wider the page is a fixed 1360 x 760 stage scaled to fit (`DESIGN_W`, `DESIGN_H` in `demo.vue`), so everything shows without scrolling. In-page zoom: buttons in the header, or `+` `-` `0` (Cmd or Ctrl too, even after clicking inside a phone); the level is kept in `localStorage` (`sb_demo_zoom`). Below 900 px the page is a normal scrolling column with Diner and Vendor tabs.
