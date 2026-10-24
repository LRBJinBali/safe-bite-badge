# PRD

Oct 24, 2026 · Laurence

> Snapshot of the live PRD: https://claude.ai/artifact/3ZAHwjQXdJkwX9c1iGuasP (the doc is the source of truth; this file is a copy).

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
- Restaurants with premises use a separate 優/良 grading (1,686 venues on the team's compiled 114 list), which the Smile Label does not cover.
- Related schemes exist: the label's QR code links to the city's ingredient registration platform, and the market office runs star ratings for traditional markets.
- Open review platforms invite abuse: a well-known Raohe stall received unrelated negative Google reviews in Aug 2026 ([CNA](https://www.cna.com.tw/news/aloc/202608050132.aspx)). This supports the no-negatives design.

Public evidence on impact is thin. The only figures found are the department's own, such as a 2018 pilot satisfaction survey of 200 consumers averaging 82%.

## Objective and success metrics

Give Taipei food vendors who keep high hygiene standards visibility, and give the community a simple way to recognise and engage with the eateries they love.

Visibility is earned by being clean, so it is gated on official certification: only certified eateries appear on the map and can receive badges.

## Users

Three groups use the product. Diners and eatery owners are both first-class: the home screen has two doors and the demo shows both sides together.

| User | What they need | How the product serves them |
| --- | --- | --- |
| Diners (Taipei residents and visitors) | A simple way to find and recognise eateries worth supporting | Map and list of certified eateries; award colour badges |
| Eatery owners | Visibility for being clean and well run | Official mark plus community badges; a path to get ready and request an assessment (labelled mockup in the MVP) |
| City (Health Department) | Public awareness of certification and a low-cost way to keep residents engaged | Open lists, a monthly badge count, a 100-day adoption plan |

## Non-goals

The product celebrates good eateries; it never judges or ranks them.

- No negative reviews, star ratings or rankings, and no marking of absence. No free-text notes either, so badges carry no personal data or negative text.
- No "no rats" claims. Pest control is recognised only as actions taken.
- Not a certification body. The official mark is cited from the Health Department's lists, never issued or re-created here.
- Uncertified eateries do not appear on the map in the MVP (strict gate). A stall whose label has ended stays listed as lapsed, with its certified years, and receives no new badges until it renews.
- No money features (tips, vouchers). For now "support" means recognition and discovery; to confirm.

## Key flows

The diner flow must work live and the eatery owner flow is a labelled mockup. The demo shows them side by side from a home screen with two doors ("I'm a diner" and "I run a food stall"). The city flow is README only.

**Diner**

1. Open the map or list of certified stalls, grouped by night market, and optionally filter by badge colour.
2. Open a stall page and see its official mark (with tier and certified years) and badge counts by colour.
3. Award up to four badges. There is no free-text note.
4. See the stall's count and the city counter ("Taipei has received X badges this month") update.
5. Share the stall with friends and family through a link and a card.

**Eatery owner**

1. Run a readiness check that mirrors the 114 assessment form: 10 inspection items, plus 6 guidance items such as ingredient source documents and staff health check reports.
2. Follow step-by-step help for food business registration and ingredient registration.
3. Request a coaching visit, routed to the Health Department or the night-market association.
4. Optionally fill in the 3-item space check behind the "Easy to Get In" badge.
5. See a labelled preview of what diners will see once the stall is certified. The stall never appears in the diner list before it is certified.

**City (README only)**

1. The Health Department publishes its lists as open data.
2. It receives coaching-visit requests and a monthly badge report.

## MVP scope

The MVP covers all food venues on the two official lists: 516 night-market stalls (113 and 114 Smile Label lists) and 1,686 restaurants (114 hygiene grading list). Night-market stalls are grouped by market and restaurants by district, and the MVP runs one full flow end to end. Anything a voter might try must work; anything needing real vendors or the city can be a labelled mockup.

| Priority | Feature | Data |
| --- | --- | --- |
| Must | List of all 2,202 venues, grouped by market (stalls) or district (restaurants), with the single "Officially certified" mark | Real: 113 and 114 Smile Label lists, 114 restaurant grading list |
| Must | Award up to four coloured badges (no free-text note) | Simulated seed data plus live votes |
| Must | Venue page with badge counts per colour; one vote per person, venue and month | Simulated |
| Must | City counter: "Taipei has received X badges this month" | Simulated |
| Must | Share link for each venue with a link preview for LINE and Messenger, and a share button, so people can recommend places to friends and family | Real list data plus live badge counts |
| Must | Venue onboarding mockup (readiness check, registration steps, request a visit) | Fake venue |
| Should | Colour filters: show only venues that have received a chosen badge colour | Simulated |
| Should | Generated share card image: venue name, market or district, official mark with year and tier, and its badges by shape, icon and label | Real list data plus live badge counts |
| Should | "Easy to Get In" 3-item prompt shown when awarding (step-free entry or ramp, aisle width, accessible toilet); community experience, not an inspection | Citizen award with a 3-item prompt |
| If time | Map pins for individual venues (the lists have no coordinates, so addresses need geocoding) | Real: list addresses |

**Proposed technical notes**

- A public, mobile-first, Traditional Chinese-first page for a Taiwanese audience that stays online until the vote closes on 31 Oct.
- A minimal shared backend so counts are the same for every viewer.
- Anonymous, per-browser vote limits; no accounts and no real personal data.
- A list plus a market-level map. The lists have no coordinates, so do not geocode each stall.

**Post-MVP ideas (README only):** monthly missions, district passport, monthly district picks, shared city goal.

## Badge system and design principles

Two axes: official certification, cited and never re-created, and four experience badges that anyone can award and anyone can earn.

**Official axis (real data).** One shared "Officially certified" mark, with no tiers. Night-market stalls qualify through the Smile Label and storefront restaurants through the 優/良 grading; we show only that the venue is certified, never the gold/silver or 優/良 level, and the tier is never used to sort, rank or filter. Venues without an official mark simply show none, and absence is never labelled. Each venue records the years it was certified (for example 113 and 114), and multi-year streaks are celebrated. When a certification ends, the venue is shown as lapsed with its history and the official mark is no longer shown.

**Experience axis (citizens award)**

| Badge | Feeling | Colour | Shape and icon (proposed) | Awarded by |
| --- | --- | --- | --- | --- |
| Worth the Detour (值得繞路) | I would go out of my way for this bite | Terracotta #DB6A41 | Diamond with a bent arrow | Citizen recommendation |
| Sit Down Easy (放心坐下) | I can bring my kid and not feel on edge; staff look out for us | Steamer-basket yellow #E9B44C | Rounded square with a chair | Citizen recommendation |
| Take Your Time (慢慢吃) | Unhurried, light, gentle texture; a comfortable meal | Celadon green #6FA58A | Circle with a bowl | Citizen recommendation |
| Easy to Get In (進得來) | I can get in, sit down and use the toilet | Sky blue #4F86B8 | Arch with a door or step-free entry icon | Citizen award, guided by a 3-item prompt (step-free entry or ramp, aisle width, accessible toilet) |

Not every badge fits every stall, and that is fine: badges are optional and absence is never marked. Each badge carries a short hint on the award screen (for example "if there's somewhere to sit" under Sit Down Easy, and "a relaxed pace, not a rush" under Take Your Time). A stall page shows only the badges it has received, never zero counts. Seed votes are simulated to look like real awards, with no seating badges on stalls that have no seating. A seated/takeaway tag per stall is a post-MVP idea for the README.

**Principles**

- Only celebrate: community badges are given, never taken away. When an official label ends, the stall is shown as lapsed and its history stays.
- One vote per person, per venue, per badge, per month.
- "Easy to Get In" is an accessibility badge. It describes physical access, including cramped market layouts that are hard for wheelchair users or older people, so the award flow shows a 3-item prompt and the badge says it is community experience, not an inspection.
- The UI says plainly that the product is unofficial and built on public Health Department lists.
- Mood: cream #FBF3E8 and ink #1F2A33; warm, playful and friendly. #DB6A41 is the organiser site's theme colour; the other colours are proposals. Do not use the organiser's logo or characters.
- Colour is never the only signal. Every badge has its own shape, icon and text label, including in filters and counts, so the product works for colour-blind users. Use ink #1F2A33 for icons and labels on every fill. In a colour-blindness simulation, three pairs come out close: terracotta and yellow (deuteranopia), terracotta and celadon (protanopia), and celadon and sky blue (tritanopia). Ink text on terracotta (contrast 4.3) and sky blue (3.8) is below the usual 4.5 for small text, so darken those two fills or use large bold labels. The official mark uses a different shape from all four, such as a seal with a check.

## Data

The organiser requires the README and the demo to say which data is real and which is simulated, and no real personal data may be used.

| 113 and 114 Smile Label lists (night-market stalls) | Real | Team-compiled CSV, 516 rows including registration numbers; keep the list year (labels last 2 years). The official lists give market, stall name, registration number and gold/silver only, with no address; the gold/silver value is stored but never shown (see Official axis). The 113 list has 237 stalls and the 114 list has 279 stalls across six markets, counted from the official PDFs. Stall names repeat within a list, and on the 113 list two registration numbers repeat (237 rows, 235 distinct numbers), so key each stall by list year, market and list row number and keep the registration number as a field |
| 114 restaurant grading list (storefront restaurants) | Real | 1,686 venues. Fields: district, venue name, address, result (優/良) and registration number; the 優/良 value is stored but never shown, same as gold/silver. Grouped by district; addresses need geocoding before mapping. Names and registration numbers have not been checked for duplicates, so key each venue by list year and list row number and keep the registration number as a field. Restaurants and stalls share one venue model, with type (stall or restaurant) as a field |

The CSVs have no coordinates, so the map works at market level. The 114 list figures below were counted from the official PDF. The 113 list was also counted from its PDF: 237 stalls (187 gold, 50 silver) in Bangka 73, Linjiang 59, Gongguan 53, Wuzhou 26, Guangzhou 19 and Xichang 7. The 112 list (243 stalls: 238 gold, 5 silver; Ningxia 97, Nanjichang 70, Huaxi St 45, Liaoning 31) is also in hand, and all three lists are parsed into one dataset of 759 rows. The rounds covered different markets, so no stall is on all three lists and only one business (好吸, at Nanjichang in 112 and Jingmei in 114) appears in two rounds. Certified-year streaks are therefore mostly empty for now. The README also lists the open-source packages and AI tools used.

| Market | Stalls | Gold | Silver |
| --- | --- | --- | --- |
| 士林 Shilin | 80 | 80 | 0 |
| 景美 Jingmei | 53 | 53 | 0 |
| 饒河街 Raohe St | 53 | 53 | 0 |
| 延三 Yansan | 38 | 34 | 4 |
| 雙城 Shuangcheng | 36 | 36 | 0 |
| 大龍 Dalong | 19 | 19 | 0 |
| Total | 279 | 275 | 4 |

Sources: [Health Department 2018 pilot proposal](https://www-ws.gov.taipei/001/Upload/371/relfile/18928/8057750/8872aec1-ed27-42e2-9f99-6558efb30e14.pdf), [Foodnext on the 2024 round](https://www.foodnext.net/news/newssafe/paper/6231020504), [organiser's site](https://puma.taipei/hackathon).

More sources: [Health Department Smile Label page](https://health.gov.taipei/News.aspx?n=76B61C8754E47803&sms=84804F52CD70DFE4) (lists and annual assessment form), [2020 release with the 279 figure](https://health.gov.taipei/News_Content.aspx?n=BB5A41BA1E6CA260&sms=72544237BBE4C5F6&s=FE7BE1D9C8255655), [CNA on the 113 round](https://www.cna.com.tw/news/aloc/202410280289.aspx), [food business registration counts](https://data.gov.tw/dataset/133354) and [ingredient platform data](https://data.gov.tw/dataset/147004), both under the Government Open Data Licence.

## Risks and open questions

**Risks**

- **Weak link to the organiser's problem statements.** The closest is #3 (rats), which this design drops on purpose. The 2-minute pitch needs a one-line answer to how citizen badges help the city.
- **Limited live-demo slots.** Only 10 teams (maybe 15) demo live, with the list announced at 12:00. Ask in Discord how teams are chosen, and have a working link by noon.
- **Official versus unofficial blur.** An official-looking mark next to citizen badges could suggest the city runs this. Show an "unofficial" line in the UI.
- **Wording.** "Sit Down Easy" (放心坐下) could read as a safety endorsement, which the design says it will not claim.
- **Vote stuffing.** Per-browser limits are easy to bypass. Say so in the README.
- **Strict gate.** Hygienic eateries that are not on the lists are invisible.
- **Expiring labels.** The 113 round (237 stalls) was announced on 28 Oct 2024, so those labels reach the end of their 2-year term within days. Show the certification year, and check whether the department is re-assessing those six markets in 2026. Decision: a stall whose label has ended is listed as lapsed, with its history, and cannot receive new badges until it renews. The lists carry no expiry date, so the end date is estimated as two years after the announcement.
- **Outdated checklist.** The 2018 checklist was revised in 2023, and 2018 sources disagree on its length (10 items in the proposal, 20 in one news report). The 114 form is now in hand: 10 inspection items and 6 guidance items. Build the readiness check from it, and confirm with the department that it is still current.

**Open questions**

- Decided on 24 Oct: dual entry, diners and vendors side by side. Which side leads the first 30 seconds of the demo?
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
