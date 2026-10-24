# Data index

Every file in `Data/` is named `00n-<topic>.<ext>`. Numbers are stable: add new files at the next number, and never renumber, because code and docs point at these paths. Same number, different extension = same dataset in another format.

## Files (status matters, check before trusting)

| File | Type | Status | Short description |
| --- | --- | --- | --- |
| `001-smile-label-112.pdf` | Source, PDF | Real, official | 112 Smile Label list (原檔名 112年度夜市食安微笑標章獲頒名單.pdf, from health.gov.taipei). 243 stalls. Labels already ended: history only. Writes the tier as 金質獎/銀質獎. |
| `002-smile-label-113.pdf` | Source, PDF | Real, official | 113 Smile Label list (113年度夜市食安微笑標章獲頒名單.pdf). 237 stalls. Announced 28 Oct 2024, so labels end about 28 Oct 2026. |
| `003-smile-label-114.pdf` | Source, PDF | Real, official | 114 Smile Label list (114年度夜市食安微笑標章獲頒名單.pdf). 279 stalls. The newest round. |
| `004-assessment-form-114.pdf` | Source, PDF | Real, official | 114 coaching and assessment form (臺北市114年度觀光夜市推動食品安全微笑標章計畫輔導及評核紀錄表.pdf): 10 inspection and 6 guidance items. Basis of the vendor readiness check. Not yet confirmed as current with the department. |
| `005-restaurant-grading.csv` | Source, CSV | Real, official | Restaurant 優/良 grading list (臺北市通過餐飲衛生管理分級評核業者.csv), [data.gov.tw 145738](https://data.gov.tw/dataset/145738), Government Open Data Licence, updated yearly, last updated 13 Oct 2026, downloaded 24 Oct 2026. 1,686 venues. Columns: 行政區域代碼, 業者名稱店名, 食品業者登錄字號, 地址, 評核結果. |
| `006-stalls.csv`, `006-stalls.json` | Derived | Real, parsed | All three Smile Label lists (001 to 003) in one table, 759 rows. Counts match the PDFs per market and tier. Regenerate with `python3 scripts/parse_stalls.py` (needs `pip install pdfplumber`); it fails if per-market or per-tier counts differ from the PDFs. Names drop the redundant market prefix (for example 艋舺夜市-, 西昌街攤販集中場-). |
| `007-restaurants.csv`, `007-restaurants.json` | Derived | Real, parsed | `005` with ids, district, `reg_root` and an `is_chain` flag. Regenerate with `python3 scripts/parse_restaurants.py`. |

Nothing simulated lives here yet. When seed votes, made-up vendor venues or simulated news items are added, give them their own numbered files with "Simulated" in the Status column.

## Schemas

**`006-stalls`**: `id, list_year, list_year_ce, market, market_en, seq, name, registration, reg_root, tier`

- `id` = ROC list year + market + 3-digit row number, for example `114-士林-012`. **This is the stall key.**
- `list_year` is ROC (112, 113, 114); `list_year_ce` is 2023, 2024, 2025.
- `registration` is the full food business registration number; `reg_root` is its first 11 characters (for example `A-200193596`), which identifies a business.
- `tier` is `gold` or `silver` (金質/銀質).

**`007-restaurants`**: `id, district_code, district, name, registration, reg_root, address, grade, is_chain, chain_reason`

- `id` = `R-` + 4-digit row number in `005`, for example `R-0001`.
- `grade` is 優 or 良. `is_chain` is the "not for the demo" flag; `chain_reason` says why.

## Counts

| Round | Market | Stalls | Gold | Silver |
| --- | --- | --- | --- | --- |
| 114 | 士林 Shilin | 80 | 80 | 0 |
| 114 | 景美 Jingmei | 53 | 53 | 0 |
| 114 | 饒河街 Raohe St | 53 | 53 | 0 |
| 114 | 延三 Yansan | 38 | 34 | 4 |
| 114 | 雙城 Shuangcheng | 36 | 36 | 0 |
| 114 | 大龍 Dalong | 19 | 19 | 0 |
| **114** | **total** | **279** | **275** | **4** |
| 113 | 艋舺 Bangka | 73 | | |
| 113 | 臨江街 Linjiang | 59 | | |
| 113 | 公館 Gongguan | 53 | | |
| 113 | 梧州街 Wuzhou | 26 | | |
| 113 | 廣州街 Guangzhou | 19 | | |
| 113 | 西昌街 Xichang | 7 | | |
| **113** | **total** | **237** | **187** | **50** |
| 112 | 寧夏 Ningxia | 97 | | |
| 112 | 南機場 Nanjichang | 70 | | |
| 112 | 華西街 Huaxi St | 45 | | |
| 112 | 遼寧 Liaoning | 31 | | |
| **112** | **total** | **243** | **238** | **5** |

The MVP lists the 516 stalls on the 113 and 114 lists. The 112 list (labels ended) feeds certified years and lapsed history only.

Restaurants: 1,686 venues (1,609 優, 77 良). 810 flagged as chains or institutional, 876 kept (812 優, 64 良).

## Rules

- **The registration number is not a unique key.** It repeats within a list (112: 243 rows, 238 distinct numbers, for example 乾燒蛤 and 鹽烤鮮蝦 in Ningxia share `A-200063639-00000-6`; 113: 237 rows, 235 distinct) and across lists. Key stalls by `id`; keep the registration number as a field.
- **A business is a `reg_root`**, and it can own several stalls. Stall names repeat too (for example 大腸包小腸 three times in Shilin).
- **Certified years** come from matching `reg_root` plus name across lists. Confirm each match by hand before showing a streak. The three rounds cover different markets, so overlap is almost nil: no stall is on all three lists. 好吸 appears at Nanjichang (112) and Jingmei (114) with the same root `A-200193596` but different endings (one business, two stalls). `A-200241365-00000-0` is on two unrelated stalls (香腸炒米腸 in Ningxia 112, 烤黑輪片 in Raohe 114): not a streak.
- **Labels last 2 years.** The lists carry no expiry date; estimate the end as two years after the announcement. Show the certification year on the stall page.
- **No addresses or positions for stalls.** The map is market-level only. No per-stall geocoding in the MVP.
- **Restaurants are all round 114** (team-confirmed; the file has no year column, and labels last 2 years like stalls). No streaks or lapse logic until a second round exists. Registration numbers are unique within `005`.
- **Chain and institutional filter** (`scripts/parse_restaurants.py`). A venue is flagged when its `reg_root` covers 3 or more addresses (579), its brand is at 4 or more addresses, for example Q Burger (50), it matches a short known-chain list (16), or it is institutional: school kitchens, hospital and hotel outlets, airport counters, care homes, co-ops (165). Flagged rows stay in the file so the rule can be reviewed; the app lists only `is_chain = false`. A proper filter (a chain field, or the Health Department marking them) is post-MVP.
- **Rare characters and bopomofo** appear in stall names. Test fonts and search against them.
- **No real personal data.** The lists hold business names and registration numbers only. Anything we add (votes, vendor venues) is simulated and must say so.
