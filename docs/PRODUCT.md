# Product: Safe-Bite Badge (安心標章)

Principles, known gaps and roadmap first; the full PRD follows.

> This file is the source of truth. It started from the live PRD (https://claude.ai/artifact/3ZAHwjQXdJkwX9c1iGuasP, rev 109, 24 Oct 2026) plus the team decisions recorded in CLAUDE.md; the live doc is now a read-only share copy and may lag.

## Principles

The rules every screen, endpoint and seed script must keep. Each one traces to a decision or a non-goal below.

1. **Only celebrate.** No negative reviews, star ratings, rankings, "most/top" or comparisons between stalls. Badges are given, never taken away. Absence is never marked: no zero counts, no "not yet".
2. **Cite, never certify.** The "Officially certified" mark comes only from the Health Department's lists. We never issue, re-create or imply it. The UI says plainly that the product is unofficial and built on public Health Department lists.
3. **Strict gate.** Only stalls on the 113 and 114 lists and restaurants on the 優/良 list (chains removed) appear and can receive badges. A lapsed stall stays listed with its history, loses the mark, and cannot receive new badges until it renews. Wording is "label ended", never "failed".
4. **Certified or not, nothing finer.** Show only that a stall or restaurant is officially certified. The gold/silver (金質/銀質) and 優/良 levels are never shown, sorted, ranked or filtered by; the data keeps them but the UI ignores them.
5. **One person, one count per badge.** Up to four badges in one award; each badge once per person and stall, ever; one award session per person and stall per month. Stall counts are people per badge; the city counter counts badges newly given this month.
6. **No personal data, no free text.** Diners have no accounts: anonymous per-browser limits, no notes. Vendors sign in with a one-time code sent by email through Cloudflare Email Service (prototype only), only to save progress on a made-up venue (decided 24 Oct; shown as a toast in dev). New vendor venues are made up.
7. **Colour is never the only signal.** Every badge shows shape, icon and text label, including in filters, counts and the share card.
8. **Label what is simulated.** Seed votes, made-up venues, visit-request routing and status, streaks and seed-vote milestones carry a "simulated" tag in the UI and the README.
9. **Anything a voter might try must work**, on both the diner and vendor sides. Only steps that need the city itself (issuing the mark, receiving visit requests) are simulated.

## Known gaps

What is missing or unverified today. Remove an item when it is fixed.

- **No app code yet.** `docs/ARCHITECTURE.md` describes the proposed stack and API; nothing is scaffolded.
- **Vendor sign-in and personal data.** The one-time code goes to an email address, which is personal data and the organiser forbids real personal data. Decide: store only a hash (or nothing) of the address, say so in the UI and README, and tell testers to use a throwaway address. Also open: what a signed-in vendor can do beyond saving a made-up venue's progress.
- **Certified-year matching not done.** Years must come from `reg_root` plus name across lists, confirmed by hand. Only 好吸 (Nanjichang 112, Jingmei 114) is a candidate; `A-200241365-00000-0` is a false match (two unrelated stalls).
- **Lapse date is an estimate.** The lists carry no expiry date. 113 labels were announced 28 Oct 2024, so they end about 28 Oct 2026, during the public vote. Decide the rule (announcement + 2 years) in code, in one place.
- **Seed votes not generated.** They must look real: no seating badges on stalls without seating, and we have no seated/takeaway data.
- **Readiness form currency unconfirmed.** The check mirrors the 114 form (`Data/004-assessment-form-114.pdf`); confirm with the department that it is current.
- **Vote stuffing.** Per-browser limits are easy to bypass. Say so in the README.
- **Restaurants have no certification year**, so no streaks or lapse logic for them.

## Roadmap

### Hackathon timeline (24 Oct 2026)

| When | What |
| --- | --- |
| 12:00 | Working public link up. Live-demo team list announced. |
| ~15:00 | Feature freeze. Test on a phone. |
| 16:00 | Submission closes. |
| 16:30 to 17:00 | Live demo, about 2 minutes per team, operated live (slides and mockups do not count). |
| 24 Oct 16:30 to 31 Oct 18:00 | Public vote (Google or LINE login, 3 votes per account). The app must stay online and work on phones throughout. |

### MVP, in priority order

Must (live, working):

1. List or market-level map of all 516 stalls (113 and 114 lists), grouped by market, plus the 876 independent 優/良 restaurants (chains and institutional venues removed), grouped by district, all with the single "Officially certified" mark. The 112 list is history only: it feeds certified years and lapsed stalls. Restaurants have no certification year, so no streaks or lapse logic for them; a district list needs no geocoding, a map would (run a 20-address test first).
2. Award up to four badges to a stall in one go (no note).
3. Stall page with people-per-badge counts; voting rule as in Principles 5.
4. City counter: "Taipei has received X badges this month".
5. Share link per stall with Open Graph title, description and image for LINE and Messenger, plus a share button (Web Share API, LINE and copy-link fallbacks).
6. Vendor side: find my stall, readiness check, registration walkthrough, visit request with status, all saved to the backend.

Should:

7. Badge filters (show only stalls with a chosen badge, by shape, icon and label).
8. Generated share card image.
9. News feed with fixed positive reactions. If trimmed, keep "newly certified" with reactions (all real data).

**Build order.** The vendor side runs alongside Must 1 to 4, not after. If short of time, build vendor part 4 (find my stall) first, since it reuses diner data and components, then parts 1 to 3.

### Submission checklist (README must include)

- Which data is real and which is simulated.
- Open-source packages and AI tools used.
- The "100-day" note: which department, which data, what cost (see "100-day plan for the city" below).
- That per-browser vote limits are easy to bypass.
- Post-MVP ideas: monthly missions, district passport, monthly district picks, shared city goal, a seated/takeaway tag per stall, a proper chain/franchise filter for restaurants.

## Decisions log (24 Oct 2026)

Team decisions that shape the build. The PRD below already reflects them; this list keeps the detail.

- **Certification history.** Record each stall's certified years (for example 112, 113, 114) and celebrate multi-year streaks. A recently lapsed stall loses its badge display, stays listed as "lapsed" with its history, and cannot receive new badges until it renews.
- **Voting rule** (replaces "one vote per person, stall, badge and month"). A person can give up to four badges to a stall in one award, but each badge only once per stall, so nobody can pile up counts. After a revisit they can come back once a month (one award session per person and stall per month) and add badges they haven't given yet. Badges are never taken away. Counts on the stall page are people per badge; the city counter and the vendor "this month" figures count badges newly given that month.
- **No free-text notes.**
- **"Easy to Get In" works like the other badges.** Diners award it, never the vendor, with a short hint like the others. It recognises physical access (for example a cramped market layout that still works for wheelchair users or older people). Community experience, not an inspection.
- **Certified or not, nothing finer** (replaces "tier is shown, never sorted"). Gold/silver for stalls and 優/良 for restaurants are consolidated into one "Officially certified" mark; levels are never displayed.
- **Vendor sign-in.** Vendors sign in with a one-time code sent to an email address (a toast in dev). It applies to made-up venues only: the find-my-stall view of real stalls stays read-only and needs no sign-in, so nobody can claim a real stall. Diners stay anonymous. Open points are under Known gaps.
- **Share card.** Step 1 (build first): a stable link per stall with Open Graph title, description and image, plus a share button (Web Share API, LINE and copy-link fallbacks). Step 2 (if time): a generated card image with stall name, market, the official mark with certification year, and the community badges with shape, icon and label. It carries the "unofficial, built on public Health Department lists" line and no personal data, rankings or ranking-like counts.
- **Dual entry.** The home screen has two doors: "I'm a diner" and "I run a food stall". Both are working apps on a shared backend; the demo shows them side by side (two panes on desktop, or two phones), for example a badge awarded in the diner pane appearing in that stall's vendor view.
- **Vendor side is functional, not a mockup.** Five parts:
  1. Readiness check (114 form: 10 inspection and 6 guidance items), progress saved to the backend, ending in a "ready to request a visit" result.
  2. Registration walkthrough (food business and ingredient registration), each step ticked off and saved, linking to the real government platforms.
  3. Visit request: stored, gets a reference number and a status page (received, scheduled, assessed). The status moves on in a simulated way and says so.
  4. Find my stall: search the 516 stalls and open a read-only vendor view (badges received this month, certified years, share link, the stall's news items). Lapsed stalls see "label ended, here's how to renew", leading into parts 1 to 3. No claiming or editing, so no one can impersonate a real stall.
  5. "What diners will see" preview built from the vendor's answers with the same stall component as the diner side, clearly labelled.
- **Hard limits on the vendor side.** It cannot issue the mark. A stall in coaching never appears in the diner list and cannot receive badges. New venues are made up (no real personal data or registration numbers). Visit requests reach no one; the UI labels the routing as simulated.
- **Badge fit.** Badges are optional and absence is never marked. Each badge shows a short hint on the award screen. A stall page shows only badges it has received. Seed votes must look like real awards.
- **News feed.** Generated from data we already hold. A short strip on the diner home above the market list, the full feed one tap away, and a stall's own items in the vendor view. Three kinds: newly certified (real), streaks (mostly simulated, tagged), badge milestones (self-comparison at fixed thresholds: first, 10, 25; seed-based ones tagged). Reactions 恭喜, 我想去, 去過了, one of each per browser per item; 我想去 opens the stall page and its share link.
- **Restaurants: chains and institutional venues removed** (see `Data/index.md`).
- **Design direction: clean and organic**, replacing "warm, playful" (see "Design direction" below).

## Vendor readiness check content

Mirror the 114 assessment form (`Data/004-assessment-form-114.pdf`). Stalls are coached, assessed, then re-assessed once. A stall is not assessed online: the app only helps a vendor get ready and request a visit.

- **10 inspection items:** staff hygiene (clothing, hands, gloves); clean stall and surfaces; separate raw and cooked utensils; running water; nothing on the floor; cold storage; covered storage and waste; registration on both the food business and the ingredient platforms.
- **6 guidance items:** pork or beef use and origin labelling; ingredient source documents; closed shoes; staff health-check report; pest-control product marking.

Read the PDF for the exact wording before building the form.

## Overview

This is a platform that helps Taipei residents come together to celebrate and support their local eateries, starting with night-market stalls that already hold official hygiene certification.

It has two layers. The official layer is a single "Officially certified" mark taken from the Health Department's lists. The community layer is four badges, each with its own colour, shape and icon, that residents award to the eateries they love.

## Problem and background

Good eateries have no ongoing way to be seen for being clean and well run, and residents have no simple way to recognise them.

- The Smile Label certifies night-market stalls, but only a few markets per round: the [2024 round](https://www.foodnext.net/news/newssafe/paper/6231020504) covered six markets and 237 stalls, and every tourist night market has now been assessed at least once. The gap is visibility between assessments, not first-time coverage.
- A label lasts 2 years and shows nothing in between.
- It is built to coach stalls until they pass. In the [2018 pilot](https://www-ws.gov.taipei/001/Upload/371/relfile/18928/8057750/8872aec1-ed27-42e2-9f99-6558efb30e14.pdf), 169 of 178 stalls passed (94%). The mark shows a clean baseline; it does not separate adequate from excellent.
- Assessment covers hygiene only: staff hygiene, production environment, ingredient traceability and pest control.
- Joining is not an online application. Contracted assessors coach and assess stalls on site, and stalls struggled most with food business registration and ingredient registration.
- Restaurants with premises use a separate 優/良 grading (1,686 venues on the official list), which the Smile Label does not cover.
- Related schemes exist: the label's QR code links to the city's ingredient registration platform, and the market office runs star ratings for traditional markets.
- Open review platforms invite abuse: a well-known Raohe stall received unrelated negative Google reviews in Aug 2026 ([CNA](https://www.cna.com.tw/news/aloc/202608050132.aspx)). This supports the no-negatives design.

Public evidence on impact is thin. The only figures found are the department's own, such as a 2018 pilot satisfaction survey of 200 consumers averaging 82%.

## Objective and success metrics

Give Taipei food vendors who keep high hygiene standards visibility, and give the community a simple way to recognise and engage with the eateries they love.

Visibility is earned by being clean, so it is gated on official certification: only certified eateries appear on the map and can receive badges.

**Hackathon success**

- A working live demo, operated on the day.
- Votes in the public vote (24 Oct 16:30 to 31 Oct 18:00; top three win; 3 votes per account).
- Badges awarded during and after the demo, shown on the city counter.

**Post-hackathon metrics to validate**

- Share of listed eateries with at least one badge.
- Repeat badge givers per month.
- Certified stalls reached per market.

## Users

Three groups use the product. Diners and eatery owners are both first-class: the home screen has two doors and the demo shows both sides together.

| User | What they need | How the product serves them |
| --- | --- | --- |
| Diners (Taipei residents and visitors) | A simple way to find and recognise eateries worth supporting | Map and list of certified eateries; award colour badges |
| Eatery owners | Visibility for being clean and well run | Official mark plus community badges; a read-only view of their own stall's badges and certified years; a working path to get ready and request an assessment |
| City (Health Department) | Public awareness of certification and a low-cost way to keep residents engaged | Open lists, a monthly badge count, a 100-day adoption plan |

## Non-goals

The product celebrates good eateries; it never judges or ranks them.

- No negative reviews, star ratings or rankings, and no marking of absence. No free-text notes either, so badges carry no personal data or negative text.
- No "no rats" claims. Pest control is recognised only as actions taken.
- Not a certification body. The official mark is cited from the Health Department's lists, never issued or re-created here.
- Uncertified eateries do not appear on the map in the MVP (strict gate). A stall whose label has ended stays listed as lapsed, with its certified years, and receives no new badges until it renews.
- No money features (tips, vouchers). For now "support" means recognition and discovery; to confirm.
- No per-stall geocoding in the MVP.

## Key flows

The diner flow and the eatery owner flow both work live on one shared backend; only steps that need the city itself (issuing the mark, receiving visit requests) are simulated and labelled. The demo shows them side by side from a home screen with two doors ("I'm a diner" and "I run a food stall"). The city flow is README only.

**Diner**

1. Open the map or list of certified stalls, grouped by night market, and optionally filter by badge.
2. Open a stall page and see its official mark (with certified years) and counts for the badges it has received (each shown with shape, icon and label; no zero counts).
3. Award up to four badges in one go, each badge once per stall. There is no free-text note. After a revisit, come back once a month to add badges not yet given.
4. See the stall's count and the city counter ("Taipei has received X badges this month") update.
5. Share the stall with friends and family through a link and a card.
6. Browse the news feed (newly certified stalls, streaks, badge milestones) and react with 恭喜, 我想去 or 去過了; 我想去 opens the stall page.

**Eatery owner**

1. Find my stall (already certified): search the 516 listed stalls and open a read-only vendor view with badges received this month, certified years and the share link. No claiming or editing, so no one can pose as a real stall. A lapsed stall sees "label ended, here's how to renew", which leads into the steps below.
2. Run a readiness check that mirrors the 114 assessment form: 10 inspection items, plus 6 guidance items such as ingredient source documents and staff health check reports. Progress is saved and ends in a "ready to request a visit" result.
3. Follow step-by-step help for food business registration and ingredient registration, ticking off each step (saved), with links to the real government platforms.
4. Request a coaching visit. The request is stored, gets a reference number and a status page (received, scheduled, assessed). It does not reach the Health Department or any association; the routing and status changes are simulated and say so.
5. See a labelled preview of what diners will see once the stall is certified, built with the same stall component as the diner side. The stall never appears in the diner list and cannot receive badges before it is certified.

**City (README only)**

1. The Health Department publishes its lists as open data.
2. It receives coaching-visit requests and a monthly badge report.

## MVP scope

The MVP covers all 516 stalls on the 113 and 114 lists, shown at market level, and the 876 independent 優/良 restaurants, shown by district (decided 24 Oct: all venues minus chains and institutional venues such as McDonald's or school cafeterias), and runs both flows, diner and eatery owner, end to end. Anything a voter might try must work, on both sides; only steps that need the city itself are simulated and labelled.

| Priority | Feature | Data |
| --- | --- | --- |
| Must | List or market-level map of all 516 stalls (grouped by market) and 876 independent restaurants (grouped by district), with the single "Officially certified" mark | Real: 113 and 114 lists, 優/良 list with chains and institutional venues removed |
| Must | Award up to four badges in one go (no free-text note) | Simulated seed data plus live votes |
| Must | Stall page with counts for the badges it has received; one award per person, stall and badge, and one award session per person and stall per month | Simulated |
| Must | City counter: "Taipei has received X badges this month" | Simulated |
| Must | Share link for each stall with a link preview for LINE and Messenger, and a share button, so people can recommend places to friends and family | Real list data plus live badge counts |
| Must | Eatery owner side: find-my-stall vendor view, readiness check, registration walkthrough, visit request with status, all saved to the backend. If short of time, find-my-stall first | Real list data for certified stalls; made-up venues and simulated visit routing for new stalls |
| Should | Badge filters: show only stalls that have received a chosen badge | Simulated |
| Should | Generated share card image: stall name, market, official mark with year, and its badges by shape, icon and label | Real list data plus live badge counts |
| Should | News feed: newly certified stalls, certification streaks and per-stall badge milestones, with fixed positive reactions. If trimmed, keep newly certified with reactions | Real list data for newly certified; streaks and seed-vote milestones simulated and tagged |

**Post-MVP ideas (README only):** monthly missions, district passport, monthly district picks, shared city goal, a seated/takeaway tag per stall, a proper chain/franchise filter for restaurants (for example a field the Health Department maintains).

## Badge system and design principles

Two axes: official certification, cited and never re-created, and four experience badges that anyone can award and anyone can earn.

**Official axis (real data).** One shared "Officially certified" mark. Night-market stalls qualify through the Smile Label and storefront restaurants through the 優/良 grading, but we show only that the venue is certified: the gold/silver and 優/良 levels are consolidated away and never displayed, sorted, ranked or filtered by (decided 24 Oct; the data files keep them). Eateries with neither show nothing, and absence is never labelled. Each stall records the years it was certified (for example 113 and 114) and multi-year streaks are celebrated. When a label ends, the stall is shown as lapsed with its history, the official mark is no longer shown, and it can receive no new badges until it renews. The official mark is a different shape from all four badges (for example a seal with a check) and uses ink only.

**Experience axis (citizens award)**

| Badge | Feeling | Colour | Shape and icon (proposed) | Hint on the award screen |
| --- | --- | --- | --- | --- |
| Worth the Detour (值得繞路) | I would go out of my way for this bite | Terracotta #DB6A41 | Diamond with a bent arrow | (to write) |
| Sit Down Easy (放心坐下) | I can bring my kid and not feel on edge; staff look out for us | Steamer-basket yellow #E9B44C | Rounded square with a chair | "if there's somewhere to sit" |
| Take Your Time (慢慢吃) | Unhurried, light, gentle texture; a comfortable meal | Celadon green #6FA58A | Circle with a bowl | "a relaxed pace, not a rush" |
| Easy to Get In (進得來) | I can get in, sit down and use the toilet | Sky blue #4F86B8 | Arch with a door or step-free entry icon | "step-free way in, room to move, a toilet you can use" |

All four are awarded by diners. Not every badge fits every stall, and that is fine: badges are optional and absence is never marked. A stall page shows only the badges it has received, never zero counts. Seed votes are simulated to look like real awards, with no seating badges on stalls that have no seating.

**News feed (announcements)**

A celebration feed, generated automatically from data the product already holds: the lists, certified years and badge counts. A short strip sits on the diner home screen above the market list, with the full feed one tap away. A stall's own items also appear in the eatery owner's "find my stall" view, for example "your stall was announced, 37 people said 我想去".

- **Newly certified.** Stalls on the newest (114) list, per stall or per market, plus lapsed stalls that renew. Real data. A label ending is never announced.
- **Streaks.** Multi-year certification. Almost none exist yet (only 好吸 spans two rounds), so streak items are mostly simulated for the demo and tagged as simulated; they become real as new rounds are published.
- **Badge milestones.** A stall compared only with itself, at a few fixed thresholds per badge (first badge, 10, 25), for example "received its first Worth the Detour". Never "most", "top" or any comparison between stalls, and no live count racing upward. Milestones built on seed votes are tagged as simulated.
- **Reactions.** Fixed and positive only: 恭喜 (congrats), 我想去 (I want to go), 去過了 (been there). No free text. One of each per browser per item. 我想去 opens the stall page and its share link, so encouragement turns into a visit or a recommendation.

**Principles**

- Only celebrate: community badges are given, never taken away. When an official label ends, the stall is shown as lapsed and its history stays.
- Several badges at once, but each badge only once per person and venue; after a revisit, one award session per month to add badges not yet given. Stall counts are people per badge; the city counter counts badges newly given that month.
- "Easy to Get In" works like the other three badges: diners award it, never the vendor, and it has a short hint like the others. It recognises physical access, such as a cramped market layout that still works for wheelchair users or older people. It is community experience, not an inspection.
- The UI says plainly that the product is unofficial and built on public Health Department lists.
- Mood: clean and organic, led by natural greens, with curves that recall plants and leaves (see Design direction below). #DB6A41 is the organiser site's theme colour; the other colours are proposals. Do not use the organiser's logo or characters.
- Colour is never the only signal. Every badge has its own shape, icon and text label, including in filters and counts, so the product works for colour-blind users. Use ink #1E2A24 for the icon inside every fill, and put the text label beside the shape on the background, not inside the fill. Ink on each fill: terracotta 4.4, sky blue 3.9, celadon 5.3, yellow 7.9; all pass the 3:1 icons need, but terracotta and sky blue are below 4.5 for small text, which is why labels sit outside the fill. In a colour-blindness simulation, three pairs come out close: terracotta and yellow (deuteranopia), terracotta and celadon (protanopia), and celadon and sky blue (tritanopia, the closest pair). Lightening terracotta or sky blue would push celadon and sky blue closer for tritanopia, so the fills stay as they are.

**Design direction (24 Oct)**

Clean and organic: natural tones led by green, and curves that recall plants and leaves. "Health" should feel like fresh produce and market greenery, not a clinic or a government office, because a medical or official look would blur the line with the Health Department and make "Sit Down Easy" read as a safety endorsement. This replaces the earlier "warm, playful" mood. The four badge colours stay: clay, bamboo, celadon and sky already read as natural tones.

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| Background | #F6F3EA | Warm off-white page | Ink 13.4 |
| Sage | #E4ECDF | Cards, sections, city counter | Ink 12.3, moss 6.5 |
| Moss | #2F5A43 | Brand: headers, buttons, the two home-screen doors, links | White on moss 7.9; moss on background 7.1 |
| Ink | #1E2A24 | Text and badge icons; green-black, softer than navy |  |

- Shapes: soft, slightly uneven rounded cards; wavy or leaf-edge section dividers; leaf-shaped market pins on the map; gentle organic blobs behind the city counter. Generous white space, few lines and borders.
- Type: a rounded, friendly Chinese-first font pair in light weights, tested on rare characters and bopomofo in stall names.
- Avoid medical crosses, clinic white and blue, and official-looking crests or government green.
- Moss is never used on badge-like shapes, so the celadon "Take Your Time" badge stays distinct; celadon is clearly lighter than moss.
- Contrast is WCAG 2; colour-blind pairs come from a Machado simulation. Redo both if any colour changes.

## Data

The organiser requires the README and the demo to say which data is real and which is simulated, and no real personal data may be used. Files, counts and data rules are in [`Data/index.md`](../Data/index.md).

| Data | Status | Notes |
| --- | --- | --- |
| 112, 113 and 114 Smile Label lists | Real | Parsed from the official PDFs: 759 rows (516 on the 113 and 114 lists). Market, stall name, registration number and gold/silver only; no address or position. |
| Restaurant grading list (優/良) | Real | Official open dataset: 1,686 venues; 876 kept after removing chains and institutional venues. No certification year. |
| Citizen badge votes | Simulated seed plus live votes | Label simulated data in the UI as well as the README |
| Made-up venues and visit-request status | Simulated | New venues on the eatery owner side only; certified stalls use real list data |
| Streak items and seed-vote milestones in the news feed | Simulated | Tagged "simulated" in the feed |

Sources: [Health Department 2018 pilot proposal](https://www-ws.gov.taipei/001/Upload/371/relfile/18928/8057750/8872aec1-ed27-42e2-9f99-6558efb30e14.pdf), [Foodnext on the 2024 round](https://www.foodnext.net/news/newssafe/paper/6231020504), [organiser's site](https://puma.taipei/hackathon), [Health Department Smile Label page](https://health.gov.taipei/News.aspx?n=76B61C8754E47803&sms=84804F52CD70DFE4) (lists and annual assessment form), [2020 release with the 279 figure](https://health.gov.taipei/News_Content.aspx?n=BB5A41BA1E6CA260&sms=72544237BBE4C5F6&s=FE7BE1D9C8255655), [CNA on the 113 round](https://www.cna.com.tw/news/aloc/202410280289.aspx), [food business registration counts](https://data.gov.tw/dataset/133354) and [ingredient platform data](https://data.gov.tw/dataset/147004), both under the Government Open Data Licence.

## Risks and open questions

**Risks**

- **Weak link to the organiser's problem statements.** The closest is #3 (rats), which this design drops on purpose. The 2-minute pitch needs a one-line answer: transparency, and recognising good actors.
- **Limited live-demo slots.** Only 10 teams (maybe 15) demo live, with the list announced at 12:00. Ask in Discord how teams are chosen, and have a working link by noon.
- **Official versus unofficial blur.** An official-looking mark next to citizen badges could suggest the city runs this. Show an "unofficial" line in the UI.
- **Eatery owner flow mistaken for a real application.** Because it works end to end, a vendor could think a visit request reaches the city. Label the routing and status as simulated on the request and status pages.
- **Wording.** "Sit Down Easy" (放心坐下) could read as a safety endorsement, which the design says it will not claim.
- **Vote stuffing.** Per-browser limits are easy to bypass. Say so in the README. Badge milestones in the news feed raise the incentive, so use a few fixed thresholds and never show a live race.
- **Strict gate.** Hygienic eateries that are not on the lists are invisible.
- **Expiring labels.** The 113 round (237 stalls) was announced on 28 Oct 2024, so those labels reach the end of their 2-year term within days. Show the certification year, and check whether the department is re-assessing those six markets in 2026. The lists carry no expiry date, so the end date is estimated as two years after the announcement.
- **Outdated checklist.** The 2018 checklist was revised in 2023, and 2018 sources disagree on its length (10 items in the proposal, 20 in one news report). The 114 form is in hand: 10 inspection items and 6 guidance items. Build the readiness check from it, and confirm with the department that it is still current.

**Open questions**

- Which side, diner or vendor, leads the first 30 seconds of the demo?
- Does "support" mean recognition and discovery only, or money later?
- Should hygienic but uncertified eateries be able to join some other way?
- Health Department: are invoices spot-checked for ingredient registration? Has a label ever been revoked? (The 2018 rules allowed it after a food-poisoning incident; no actual case found.) Can the lists be opened as an API? Can stalls join the 優/良 grading?

## 100-day plan for the city

If the city adopts this, the first step is for the Health Department to open its certification lists, because everything else builds on that data. Costs below are to be confirmed.

| Action | Who | Data | Cost |
| --- | --- | --- | --- |
| Publish the Smile Label and 優/良 lists as an open dataset or API, with certification year and a notes field | Health Department | Certified stall and venue lists | To confirm |
| Route coaching-visit requests from vendors who want to get assessed | Health Department, Market Office, night-market associations | Stall lists, request form | To confirm |
| Pilot one market with the community badges and a monthly badge report | Health Department with one market association | Badge counts | To confirm |

One cost anchor: the 2018 pilot paid contracted assessors NT$1,371,600 to coach and assess 178 stalls, roughly NT$7,700 per stall ([pilot proposal](https://www-ws.gov.taipei/001/Upload/371/relfile/18928/8057750/8872aec1-ed27-42e2-9f99-6558efb30e14.pdf)). This is a rough reference, not a savings estimate.
