"""Parse the three official Smile Label PDFs into one stall table.

Input:  Data/001-smile-label-112.pdf, 002-smile-label-113.pdf, 003-smile-label-114.pdf
Output: Data/006-stalls.csv and Data/006-stalls.json, one row per stall.

Needs pdfplumber (pip install pdfplumber). Run with: python3 scripts/parse_stalls.py

Each page is one ruled table with five columns (seq, market, stall name, registration, result).
Cells wrap, so words are assigned to a row by the nearest sequence number, not by cell.
Counts per market and tier are checked against the PDFs at the end (EXPECTED).
"""
import collections
import csv
import json
import re
import sys
from pathlib import Path

import pdfplumber

DATA = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "Data"
OUT = DATA / "006-stalls"

LISTS = {112: "001-smile-label-112.pdf", 113: "002-smile-label-113.pdf", 114: "003-smile-label-114.pdf"}

# Market name as printed minus 夜市, to the English name used in the app.
MARKET_EN = {
    "南機場": "Nanjichang", "寧夏": "Ningxia", "華西街": "Huaxi", "遼寧": "Liaoning",
    "艋舺": "Bangka", "臨江街": "Linjiang", "公館": "Gongguan", "梧州街": "Wuzhou",
    "廣州街": "Guangzhou", "西昌街": "Xichang",
    "士林": "Shilin", "景美": "Jingmei", "饒河街": "Raohe St", "延三": "Yansan",
    "雙城": "Shuangcheng", "大龍": "Dalong",
}

# (list year, market) -> (stalls, gold, silver), counted by hand from the PDFs.
EXPECTED = {
    (112, "寧夏"): 97, (112, "南機場"): 70, (112, "華西街"): 45, (112, "遼寧"): 31,
    (113, "艋舺"): 73, (113, "臨江街"): 59, (113, "公館"): 53, (113, "梧州街"): 26,
    (113, "廣州街"): 19, (113, "西昌街"): 7,
    (114, "士林"): 80, (114, "景美"): 53, (114, "饒河街"): 53, (114, "延三"): 38,
    (114, "雙城"): 36, (114, "大龍"): 19,
}
EXPECTED_TIERS = {112: (238, 5), 113: (187, 50), 114: (275, 4)}

REG = re.compile(r"[A-Z]-\d{9}-\d{5}-\d")


def clean_name(name):
    """Drop the redundant market prefix some 113 names carry (艋舺夜市-xxx, 西昌街攤販集中場-xxx)."""
    return re.sub(r"^[^\W\d_]{2,4}(?:夜市|攤販集中場)-", "", name.strip())


def page_rows(page, one_cell_per_row=False):
    """Yield (seq, market, name, registration, tier_text) for each stall on a page.

    A leading ("cont", text, ...) item carries the tail of the previous page's last name."""
    tables = page.find_tables()
    xs = sorted({round(c[0]) for t in tables for c in t.cells} | {round(c[2]) for t in tables for c in t.cells})
    if len(xs) != 6:
        return
    def in_table(w):
        cx, cy = (w["x0"] + w["x1"]) / 2, (w["top"] + w["bottom"]) / 2
        return any(t.bbox[0] <= cx <= t.bbox[2] and t.bbox[1] <= cy <= t.bbox[3] for t in tables)

    header = {"編號", "夜市名稱", "攤位名稱", "食品業者登錄字號", "評核", "結果", "評核結果"}
    words = [w for w in page.extract_words() if in_table(w) and w["text"] not in header]

    def col(w):
        cx = (w["x0"] + w["x1"]) / 2
        return next(i for i in range(5) if cx < xs[i + 1])

    anchors = sorted((w for w in words if col(w) == 0 and w["text"].isdigit()), key=lambda w: w["top"])
    centre = lambda w: (w["top"] + w["bottom"]) / 2
    # Row boundaries: the one ruling line between two sequence numbers if there is exactly one
    # (so a name wrapped onto the next line stays with its own row), else the midpoint.
    rules = sorted({round(y) for t in tables for c in t.cells for y in (c[1], c[3])})
    bounds = []
    for a, b in zip(anchors, anchors[1:]):
        between = [y for y in rules if centre(a) < y < centre(b)]
        bounds.append(between[0] if len(between) == 1 else (centre(a) + centre(b)) / 2)
    rows = [collections.defaultdict(list) for _ in anchors]
    # In the 112 PDF every stall is one ruled cell row, so words above the first sequence number are the
    # tail of a name that wrapped across the page break (Ningxia #82); hand them back for the previous row.
    # (The 113 and 114 tables split each stall into sub-rows, where this would misfire.)
    # A wrapped name is centred on its row, so only words separated from the first number by a ruling line count.
    lead = [w for w in words if anchors and any(centre(w) < y < centre(anchors[0]) for y in rules)]
    if one_cell_per_row and lead:
        tail = sorted((w for w in lead if col(w) == 2), key=lambda w: (round(centre(w) / 5), w["x0"]))
        yield "cont", "".join(w["text"] for w in tail), "", "", ""
        words = [w for w in words if w not in lead]
    for w in words:
        c = col(w)
        if not anchors or (c == 0 and w in anchors):
            continue
        rows[sum(centre(w) > b for b in bounds)][c].append(w)
    rows = {id(a): r for a, r in zip(anchors, rows)}

    for a in anchors:
        cells = rows[id(a)]

        def text(c, sep):
            # Group words into visual lines by vertical centre (mixed fonts have different tops).
            lines = []
            for w in sorted(cells[c], key=lambda w: (w["top"] + w["bottom"]) / 2):
                yc = (w["top"] + w["bottom"]) / 2
                if lines and abs(yc - lines[-1][0]) < 5:
                    lines[-1][1].append(w)
                else:
                    lines.append((yc, [w]))
            return "".join(sep.join(w["text"] for w in sorted(ws, key=lambda w: w["x0"])) for _, ws in lines)

        yield int(a["text"]), text(1, ""), text(2, " "), text(3, ""), text(4, "")


def main():
    out = []
    for year, fname in LISTS.items():
        market = ""
        with pdfplumber.open(DATA / fname) as pdf:
            counters = collections.Counter()
            for page in pdf.pages:
                for seq, m, name, reg, tier_text in page_rows(page, year == 112):
                    if seq == "cont":
                        out[-1]["name"] += m
                        continue
                    if m.endswith("夜市"):
                        market = m[:-2]
                    if not reg or not REG.fullmatch(reg):
                        sys.exit(f"{year} {market} #{seq}: bad registration {reg!r}")
                    if "金" in tier_text:
                        tier = "gold"
                    elif "銀" in tier_text:
                        tier = "silver"
                    else:
                        sys.exit(f"{year} {market} #{seq}: bad tier {tier_text!r}")
                    counters[market] += 1
                    out.append({
                        "id": f"{year}-{market}-{seq:03d}",
                        "list_year": year,
                        "list_year_ce": year + 1911,
                        "market": market,
                        "market_en": MARKET_EN[market],
                        "seq": seq,
                        "name": clean_name(name),
                        "registration": reg,
                        "reg_root": reg[:11],
                        "tier": tier,
                    })

    # Check against the hand counts.
    got = collections.Counter((r["list_year"], r["market"]) for r in out)
    bad = {k: (got.get(k, 0), v) for k, v in EXPECTED.items() if got.get(k, 0) != v}
    for year, (gold, silver) in EXPECTED_TIERS.items():
        t = collections.Counter(r["tier"] for r in out if r["list_year"] == year)
        if (t["gold"], t["silver"]) != (gold, silver):
            bad[f"{year} tiers"] = ((t["gold"], t["silver"]), (gold, silver))
    ids = collections.Counter(r["id"] for r in out)
    dup = [i for i, n in ids.items() if n > 1]
    if bad or dup or set(got) - set(EXPECTED):
        sys.exit(f"count check failed: {bad} duplicates={dup} extra={set(got) - set(EXPECTED)}")

    fields = list(out[0])
    with open(OUT.with_suffix(".csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fields)
        w.writeheader()
        w.writerows(out)
    OUT.with_suffix(".json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("rows", len(out), dict(collections.Counter(r["list_year"] for r in out)))


if __name__ == "__main__":
    main()
