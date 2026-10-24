"""Parse the official Taipei 優/良 restaurant list and flag chains.

Input:  Data/臺北市通過餐飲衛生管理分級評核業者.csv (data.gov.tw/dataset/145738)
Output: Data/restaurants.csv and Data/restaurants.json, one row per venue.

A venue is flagged is_chain (the "not for the demo" flag) when:
  - its registration root (first 11 characters) covers 3 or more distinct addresses, or
  - its brand name appears at 4 or more distinct addresses (franchises where every
    outlet has its own registration root, for example Q Burger), or
  - its name matches the short KNOWN_CHAINS list (chains with one outlet on this list), or
  - its name matches INSTITUTIONAL (school kitchens, hospitals, hotels, airport counters,
    care homes): not chains, but not local eateries either.
Flagged rows are kept in the file with chain_reason so the rule can be reviewed;
the app lists only rows where is_chain is false.
"""
import collections
import csv
import json
import re
import sys
from pathlib import Path

DATA = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "Data"
SRC = DATA / "臺北市通過餐飲衛生管理分級評核業者.csv"

# Well-known chains that appear at only one address on this list, so the count rules miss them.
KNOWN_CHAINS = re.compile(
    r"麥當勞|星巴克|摩斯|肯德基|必勝客|達美樂|50嵐|迷客夏|八方雲集|路易莎|爭鮮|漢堡王|拉亞漢堡|弘爺|鼎泰豐|瓦城|王品|好市多|怡客|梁社漢|貳樓|(?i:mister donut)|遠百企業"
)

# Not chains, but not local eateries either: school kitchens, hospitals, hotels, airport counters, care homes.
INSTITUTIONAL = re.compile(
    r"國小|國中|國民小學|國民中學|高中|高工|高職|高級中等|學校|大學|醫院|酒店|飯店|旅館|機場|護理之家|教養院|養護|長照|安養|訓練所|熱食部|早餐部|午餐廚房|駐點廚房|供膳|合作社"
)

COMPANY = re.compile(r"^[^(（]*?(股份有限公司|有限公司|\(股\)公司|（股）公司|\(股\))[-\s]*")


def norm_addr(a):
    return re.sub(r"\s", "", a.replace("巿", "市").replace("台北", "臺北"))


def brand(name):
    n = COMPANY.sub("", name.strip().replace("　", " ")) or name.strip()
    latin = re.match(r"^[A-Za-z][A-Za-z0-9 '&.]*[A-Za-z]", n)
    if latin:
        return latin.group(0).lower()
    return re.split(r"[-_\s(（]", n)[0].lower()


def main():
    rows = list(csv.DictReader(open(SRC, encoding="utf-8-sig")))
    root_addrs, brand_addrs = collections.defaultdict(set), collections.defaultdict(set)
    for r in rows:
        a = norm_addr(r["地址"])
        root_addrs[r["食品業者登錄字號"].strip()[:11]].add(a)
        brand_addrs[brand(r["業者名稱店名"])].add(a)

    out = []
    for i, r in enumerate(rows, 1):
        root = r["食品業者登錄字號"].strip()[:11]
        b = brand(r["業者名稱店名"])
        reason = ""
        if len(root_addrs[root]) >= 3:
            reason = "registration root at 3+ addresses"
        elif KNOWN_CHAINS.search(r["業者名稱店名"]):
            reason = "known chain"
        elif INSTITUTIONAL.search(r["業者名稱店名"]):
            reason = "institutional venue"
        elif len(b) >= 2 and len(brand_addrs[b]) >= 4:
            reason = "brand at 4+ addresses"
        addr = norm_addr(r["地址"])
        out.append({
            "id": f"R-{i:04d}",
            "district_code": r["行政區域代碼"],
            "district": addr[3:6],
            "name": r["業者名稱店名"].strip(),
            "registration": r["食品業者登錄字號"].strip(),
            "reg_root": root,
            "address": addr,
            "grade": r["評核結果"],
            "is_chain": bool(reason),
            "chain_reason": reason,
        })

    fields = list(out[0])
    with open(DATA / "restaurants.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fields)
        w.writeheader()
        w.writerows(out)
    (DATA / "restaurants.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

    kept = [r for r in out if not r["is_chain"]]
    print("total", len(out), "| chains removed", len(out) - len(kept), "| kept", len(kept))
    print("kept by grade", dict(collections.Counter(r["grade"] for r in kept)))
    print("kept by district", collections.Counter(r["district"] for r in kept).most_common())


if __name__ == "__main__":
    main()
