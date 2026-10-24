# Safe-Bite Badge (安心標章): project brief

Hackathon entry for the Taipei 市政 debug松. Submission closes **24 Oct 2026, 16:00**. The demo is live (16:30 to 17:00, about 2 minutes per team) and must be operated live; slides and mockups do not count. Public vote runs 24 Oct 16:30 to 31 Oct 18:00 (Google or LINE login, 3 votes per account), so the app must stay online and work on phones until then.

Full PRD: https://claude.ai/artifact/3ZAHwjQXdJkwX9c1iGuasP (the doc is the source of truth; this file is a summary).

## What we are building

A platform that helps Taipei residents come together to celebrate and support their local eateries.

Objective: give Taipei food vendors who keep high hygiene standards visibility, and give the community a simple way to recognise and engage with the eateries they love.

Two layers:
1. Official layer: one "Officially certified" mark, taken from the Health Department's lists. Never issued or re-created by us.
2. Community layer: four badges residents award. Each has its own colour, shape, icon and text label.

Strict gate for the MVP: only officially certified eateries appear and can receive badges.

## Decisions (24 Oct, from the team)

- **Certification history.** Record each stall's certified years in its profile (for example 112, 113, 114) and celebrate multi-year streaks. A recently lapsed stall loses its badge display, stays listed as "lapsed" with its history, and cannot receive new badges until it renews. Wording is "label ended", never "failed".
- **Voting rule (24 Oct, replaces "one vote per person, stall, badge and month").** A person can give several badges (up to four) to a stall in one award, but each badge only once per stall: a person counts once per badge per stall, so nobody can pile up counts. After a revisit they can come back once a month (one award session per person and stall per month) and add badges they haven't given yet; they cannot repeat a badge, and badges are never taken away ("only celebrate"). Counts on the stall page are people per badge; the city counter and the vendor "this month" figures count badges newly given that month. Anonymous per-browser limits, so the README still says this is easy to bypass.
- **No free-text notes.** Badges are awarded without a note field (no personal data, no negative text).
- **"Easy to Get In" works like the other badges.** Diners award it, never the vendor, and it has a short hint like the others. It recognises physical access, such as a cramped market layout that still works for wheelchair users or older people. It is community experience, not an inspection.
- **Tier is shown, never sorted.** Show 金質/銀質 as the official fact on each stall. Never sort, rank or filter by it.

- **Share card.** Every stall page has a "recommend to friends and family" share. Step 1 (build first): a stable link per stall with Open Graph title, description and image so it previews well in LINE and Messenger, plus a share button (Web Share API, LINE and copy-link fallbacks). Step 2 (if time): a generated card image. The card shows stall name, market, the official mark with certification year and tier, and the community badges with shape, icon and text label (never colour alone). It carries the "unofficial, built on public Health Department lists" line and no personal data, rankings or counts that imply a ranking.

- **Dual entry (diners and vendors).** The home screen has two doors: "I'm a diner" and "I run a food stall". Both sides are working apps with a shared backend; the demo shows them side by side (two panes on desktop, or two phones), for example a badge awarded in the diner pane appearing on that stall's vendor view.
- **Vendor side is functional, not a mockup** (24 Oct, later). It has five parts:
  1. Readiness check (114 form: 10 inspection and 6 guidance items) with progress saved to the backend and a "ready to request a visit" result.
  2. Registration walkthrough (food business and ingredient registration), each step ticked off and saved, linking to the real government platforms.
  3. Visit request that is stored, gets a reference number and a status page (received, scheduled, assessed). The status moves on in a simulated way and says so.
  4. "Find my stall" for certified vendors: search the 516 stalls and open a read-only vendor view (badges received this month, certified years, share link). Lapsed stalls see "label ended, here's how to renew", which leads into parts 1 to 3. No claiming or editing, so no one can impersonate a real stall.
  5. "What diners will see" preview built from the vendor's answers with the same stall component as the diner side, clearly labelled.
- **Hard limits on the vendor side.** It cannot issue the mark; a stall in coaching never appears in the diner list and cannot receive badges (strict gate). New venues are made up (no real personal data or registration numbers). Visit requests do not reach the Health Department or any association; the UI labels that routing as simulated.
- **Build order.** Vendor side runs alongside Must 1 to 4, not after. If short of time, build part 4 first (it reuses diner data and components), then 1 to 3.

- **Badge fit.** Not every badge fits every stall, and that is fine: badges are optional and absence is never marked. Each badge shows a short hint on the award screen (for example "if there's somewhere to sit" under Sit Down Easy, "a relaxed pace, not a rush" under Take Your Time, "step-free way in, room to move, a toilet you can use" under Easy to Get In). A stall page shows only badges it has received, never zero counts. Seed votes must look like real awards (no seating badges on stalls without seating). A seated/takeaway tag per stall is a post-MVP idea for the README.

- **News feed (announcements).** A celebration feed, generated automatically from data we already hold (lists, certified years, badge counts). A short strip sits on the diner home above the market list, with the full feed one tap away; a stall's own items also show in the vendor "find my stall" view (for example "your stall was announced, 37 people said 我想去"). Three kinds:
  1. Newly certified: the 114 round stalls (newest list; real data), per stall or per market. Renewals of lapsed stalls count too. A label ending is never announced.
  2. Streaks: multi-year certification. Almost none exist yet (only 好吸 spans two rounds), so streak items are mostly simulated for the demo and tagged "simulated".
  3. Badge milestones: a stall compared only with itself, at a few fixed thresholds per badge (first badge, 10, 25), for example "received its first Worth the Detour". Never "most", "top" or any comparison between stalls, and no live count racing up (it rewards vote stuffing). Milestones built on seed votes are tagged "simulated".
  - Reactions are fixed and positive only: 恭喜 (congrats), 我想去 (I want to go), 去過了 (been there). No free text. One of each per browser per item. 我想去 opens the stall page and its share link.
  - Priority: Should, after the Musts. If trimmed, keep "newly certified" with reactions (all real data).

## Non-goals

- No negative reviews, star ratings, rankings, or marking of absence.
- No "no rats" claims. Pest control is recognised only as actions taken.
- Not a certification body.
- No money features (tips, vouchers).
- No per-stall geocoding in the MVP.

## MVP scope (priority order)

Must (live, working):
1. List or market-level map of all 516 stalls from the 113 and 114 lists, grouped by market, with the single "Officially certified" mark. The 112 list (243 stalls, labels already ended) is history only: it feeds certified years and lapsed stalls.
2. Award up to four badges to a stall in one go (no free-text note).
3. Stall page with badge counts per badge; one award per person, stall and badge, ever, and one award session per person and stall per month (see Decisions).
4. City counter: "Taipei has received X badges this month".
5. Share link per stall with Open Graph preview for LINE and Messenger, plus a share button (share card step 1).
6. Vendor side: "find my stall" vendor view, readiness check, registration walkthrough and visit request with status, all saved to the backend (see Decisions). Made-up venues for new stalls; visit routing simulated.

Should:
7. Colour filters (show only stalls with a chosen badge).
8. Generated share card image (share card step 2).
9. News feed: newly certified, streaks and badge milestones, with fixed positive reactions (see Decisions). If trimmed, keep newly certified.

If time: independent restaurants with the 優/良 mark (876 after removing chains and institutional venues; official list in hand; district-level listing needs no geocoding, a map needs address geocoding, run a 20-address test first).

Anything a voter might try must work, on both the diner and vendor sides. Only steps that need the city itself (issuing the mark, receiving visit requests) are simulated, and labelled so.

## Technical notes (proposed, not yet decided)

- Public URL, mobile-first, Traditional Chinese-first UI for a Taiwanese audience. Get a working link up by noon; freeze features about 15:00; test on a phone before submitting.
- Minimal shared backend so counts are the same for every viewer.
- Anonymous per-browser vote limits; no accounts; **no real personal data** (organiser rule).
- Market-level map only. The lists have no coordinates.
- Label simulated data in the UI as well as the README.
- UI must say it is unofficial and built on public Health Department lists.

## Design direction (24 Oct)

Clean and organic: natural tones led by green, curves that recall plants and leaves. "Health" should feel like fresh produce and market greenery, not a clinic or a government office (that would deepen the official-versus-unofficial blur and make "Sit Down Easy" read as a safety endorsement). Replaces the earlier "warm, playful" mood.

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| Background | #F6F3EA | Warm off-white page | Ink 13.4 |
| Sage | #E4ECDF | Cards, sections, counter | Ink 12.3, moss 6.5 |
| Moss | #2F5A43 | Brand: headers, buttons, the two home doors, links | White on moss 7.9; moss on background 7.1 |
| Ink | #1E2A24 | Text and badge icons (green-black, softer than navy) | |

- Shapes: soft, slightly uneven rounded cards; wavy or leaf-edge section dividers; leaf-shaped market pins on the map; gentle organic blobs behind the city counter. Generous white space, few lines and borders.
- Type: a rounded, friendly Chinese-first font pair, light weights; check rare characters and bopomofo in stall names.
- Avoid: medical crosses, clinic white and blue, official-looking crests or government green.
- Moss is never used on badge-like shapes, so the celadon "Take Your Time" badge stays distinct (it is clearly lighter than moss).
- Contrast and colour-blind checks: computed with WCAG 2 contrast and a Machado simulation; redo them if any colour changes.

## Badges

| Badge | Feeling | Colour | Shape and icon (proposed) |
| --- | --- | --- | --- |
| Worth the Detour 值得繞路 | I would go out of my way for this bite | #DB6A41 | Diamond, bent arrow |
| Sit Down Easy 放心坐下 | I can bring my kid and not feel on edge | #E9B44C | Rounded square, chair |
| Take Your Time 慢慢吃 | Unhurried, light, a comfortable meal | #6FA58A | Circle, bowl |
| Easy to Get In 進得來 | I can get in, sit down and use the toilet | #4F86B8 | Arch, door or step-free entry |

- Badge fills are unchanged under the new direction (clay, bamboo, celadon and sky already read as natural tones). Official mark is a different shape (for example a seal with a check) in ink only.
- Colour is never the only signal: always show shape, icon and text label, including in filters and counts.
- Simulation showed close pairs: terracotta/yellow (deuteranopia), terracotta/celadon (protanopia), celadon/sky blue (tritanopia, the closest pair).
- Put each badge's text label beside the shape, on the background, not inside the fill. Inside the fill keep only the ink icon: icons need 3:1, and ink on every fill passes (terracotta 4.4, sky blue 3.9, celadon 5.3, yellow 7.9). Lightening terracotta or sky blue to fit small text inside would push celadon and sky blue closer for tritanopia, so don't.
- Do not use the organiser's logo or characters. #DB6A41 is the organiser site's theme colour; the others are our proposals.

## Data

Real data:
- 114 Smile Label list (official PDF, checked): **279 stalls (275 gold, 4 silver)**. Shilin 80, Jingmei 53, Raohe St 53, Yansan 38 (all 4 silver), Shuangcheng 36, Dalong 19.
- 113 Smile Label list (official PDF, counted): **237 stalls (187 gold, 50 silver)**. Bangka 73, Linjiang 59, Gongguan 53, Wuzhou 26, Guangzhou 19, Xichang 7.
- 112 Smile Label list (official PDF from health.gov.taipei, counted): **243 stalls (238 gold, 5 silver)**. Ningxia 97, Nanjichang 70, Huaxi St 45, Liaoning 31. The 112 PDF writes the tier as 金質獎/銀質獎.
- **Parsed dataset:** `Data/stalls.csv` and `Data/stalls.json`, 759 rows (243 + 237 + 279) parsed from the three official PDFs. Columns: id, list_year (ROC), list_year_ce, market, market_en, seq, name, registration, reg_root, tier. Counts match the PDFs per market and tier. The older team-compiled CSV is not in the folder.
- The three rounds cover different markets, so there is almost no overlap: no stall is on all three lists. 好吸 appears at Nanjichang (112) and Jingmei (114) with the same root `A-200193596` but different endings (one business, two stalls). `A-200241365-00000-0` is on two different stalls (香腸炒米腸 in Ningxia 112, 烤黑輪片 in Raohe 114).
- Official 114 list columns: number, market, stall name, food business registration number, result. No address, no stall position.
- **Restaurant 優/良 grading list (official, downloaded 24 Oct):** `Data/臺北市通過餐飲衛生管理分級評核業者.csv`, from the Taipei Health Department's open dataset (https://data.gov.tw/dataset/145738, Government Open Data Licence, updated yearly, last updated 13 Oct 2026). 1,686 venues (1,609 優, 77 良), columns: district code, name, registration number, address, result. No certification year, so no streaks for restaurants. Registration numbers are unique here.
- **Chains and institutional venues are removed from the demo (decision 24 Oct).** `scripts/parse_restaurants.py` writes `Data/restaurants.csv` and `restaurants.json` with an `is_chain` flag and a `chain_reason`; the app lists only `is_chain = false`. Flagged: a registration root covering 3 or more addresses (579), a brand at 4 or more addresses such as Q Burger (50), a short known-chain list (16), and institutional venues, meaning school kitchens, hospital and hotel outlets, airport counters, care homes and co-ops (165). Result: 810 flagged, 876 kept (812 優, 64 良). Flagged rows stay in the file so the rule can be reviewed. A proper filtering system (for example a chain or franchise field, or letting the Health Department mark them) is post-MVP, README only.

Data rules:
- **The registration number is NOT a unique key.** It repeats within a list (112: 243 rows, 238 distinct numbers, for example 乾燒蛤 and 鹽烤鮮蝦 in Ningxia share `A-200063639-00000-6`; 113: 237 rows, 235 distinct) and across lists. Use `id` = list year + market + row number (for example `114-士林-012`) as the stall key, and keep the registration number as a field. A business is the registration root (`reg_root`), which can own several stalls. Stall names also repeat (for example "大腸包小腸" three times in Shilin).
- Certified years for a stall come from matching `reg_root` plus name across lists; confirm each match by hand before showing a streak.
- Labels last 2 years. The 113 round was announced 28 Oct 2024, so those 237 labels expire about now. Show the certification year on the stall page.
- Some names use rare characters or bopomofo; test fonts and search.
- Simulated: citizen badge votes (seed plus live), made-up new venues, visit-request status changes, streak items and milestones built on seed votes in the news feed.

## README must include

- Which data is real and which is simulated.
- Open-source packages and AI tools used.
- A "100-day" note: which department, which data, what cost. Our version: the Health Department opens its lists as an open dataset or API with certification year and a notes field; vendor coaching requests route through night-market associations and the Market Office; pilot one market with a monthly badge report. Cost is to be confirmed. Reference: the 2018 pilot paid assessors NT$1,371,600 for 178 stalls, roughly NT$7,700 per stall.

## Vendor readiness check content

Mirror the 114 assessment form (stalls are coached, assessed, then re-assessed once).
- 10 inspection items: staff hygiene (clothing, hands, gloves), clean stall and surfaces, separate raw and cooked utensils, running water, nothing on the floor, cold storage, covered storage and waste, and registration on both the food business and ingredient platforms.
- 6 guidance items: pork or beef use and origin labelling, ingredient source documents, closed shoes, staff health-check report, pest-control product marking.
- A stall is not assessed online. The app only helps a vendor get ready and request a visit; it cannot issue the mark.
- Confirm with the department that the 114 form is current.

## Risks and open questions

- Weak link to the organiser's problem statements (closest is #3, rats, which we drop on purpose). Prepare a one-line answer: transparency, and recognising good actors.
- Only 10 to 15 teams demo live; the list is announced at 12:00. Ask in Discord how teams are chosen.
- Official versus unofficial confusion; "Sit Down Easy" could read as a safety endorsement.
- Vote stuffing; per-browser limits are easy to bypass. Say so in the README.
- Who comes first, diners or vendors? Does "support" mean recognition only, or money later?
- Health Department questions: invoice spot checks, label revocation (the 2018 rules allowed it after food poisoning; no case found), open API, whether stalls can join the 優/良 grading.

## Sources

- Organiser: https://puma.taipei/hackathon
- Smile Label page: https://health.gov.taipei/News.aspx?n=76B61C8754E47803&sms=84804F52CD70DFE4
- 2018 pilot proposal: https://www-ws.gov.taipei/001/Upload/371/relfile/18928/8057750/8872aec1-ed27-42e2-9f99-6558efb30e14.pdf
- Foodnext on the 113 round: https://www.foodnext.net/news/newssafe/paper/6231020504
- Open data (Government Open Data Licence): https://data.gov.tw/dataset/133354 and https://data.gov.tw/dataset/147004


## Read first:
- `docs/PRODUCT.md`: principles, known gaps, roadmap
- `docs/ARCHITECTURE.md`: API, codebase structure, development notes.
- `Data/index.md`: data's index and rules.

## References:
- `Data/00n-xx-xx.*`: data resources - pdf, md, csv, json files.


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
- Prefer keeping context in the codebase but not memory.
