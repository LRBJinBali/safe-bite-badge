import type { BadgeKey } from '../../shared/badges'
import { BADGE_KEYS } from '../../shared/badges'
import { DISTRICT_POS, MARKET_POS } from '../../shared/markets'
import { getVenue } from './venues'

export interface GroupTotal {
  group: string
  kind: 'stall' | 'restaurant'
  total: number
  simulated: boolean
}

export interface MonthTotals {
  total: number
  simulated: number
  perBadge: Record<BadgeKey, number>
  groups: GroupTotal[]
}

const ORDER = [...Object.keys(MARKET_POS), ...Object.keys(DISTRICT_POS)]

/**
 * Badges given in a month, per badge and per market/district.
 * Group totals only (no per-stall figure leaves this function), in fixed list order, never sorted by value.
 */
export async function monthTotals(db: D1Database, month: string): Promise<MonthTotals> {
  const { results } = await db.prepare(
    'SELECT stall_id, badge, COUNT(*) AS n, COALESCE(SUM(simulated), 0) AS sim FROM awards WHERE month = ? GROUP BY stall_id, badge',
  ).bind(month).all<{ stall_id: string, badge: BadgeKey, n: number, sim: number }>()

  const perBadge = Object.fromEntries(BADGE_KEYS.map(k => [k, 0])) as Record<BadgeKey, number>
  const groups = new Map<string, GroupTotal>()
  let total = 0
  let simulated = 0
  for (const r of results) {
    total += r.n
    simulated += r.sim
    if (r.badge in perBadge)
      perBadge[r.badge] += r.n
    const v = getVenue(r.stall_id, true)
    if (!v)
      continue
    const key = `${v.kind}:${v.group}`
    const g = groups.get(key) ?? { group: v.group, kind: v.kind, total: 0, simulated: false }
    g.total += r.n
    if (r.sim > 0 || v.simulated)
      g.simulated = true
    groups.set(key, g)
  }
  const idx = (g: GroupTotal) => {
    const i = ORDER.indexOf(g.group)
    return i === -1 ? ORDER.length : i
  }
  return {
    total,
    simulated,
    perBadge,
    groups: [...groups.values()].sort((a, b) => (a.kind === b.kind ? idx(a) - idx(b) : a.kind === 'stall' ? -1 : 1)),
  }
}
