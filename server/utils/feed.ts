import type { FeedItem, ReactionKind } from '../../shared/types'
import { badgeByKey } from '../../shared/badges'
import { markName } from '../../shared/mark'
import { MILESTONES } from '../../shared/rules'
import { getVenue, listVenues } from './venues'

const PER_MARKET_STALLS = 2

/** Generated from data we already hold. Nothing is stored except reactions. */
export async function buildFeed(db: D1Database, opts: { demo: boolean, browserId: string, venueId?: string, limit?: number }): Promise<FeedItem[]> {
  const items: Omit<FeedItem, 'reactions' | 'mine'>[] = []

  const { results: ms } = await db.prepare(
    'SELECT stall_id, badge, COUNT(*) AS n, SUM(simulated) AS sim, MAX(created_at) AS at FROM awards GROUP BY stall_id, badge ORDER BY at DESC LIMIT 60',
  ).all<{ stall_id: string, badge: string, n: number, sim: number, at: number }>()
  for (const r of ms) {
    const v = getVenue(r.stall_id, opts.demo)
    const def = badgeByKey(r.badge)
    const reached = [...MILESTONES].reverse().find(t => r.n >= t)
    if (!v || !def || !reached)
      continue
    items.push({
      id: `milestone:${v.id}:${r.badge}:${reached}`,
      kind: 'milestone',
      venueId: v.id,
      venueName: v.name,
      group: v.group,
      text: reached === 1 ? `${v.name} 收到第一個「${def.zh}」` : `${v.name} 的「${def.zh}」已有 ${reached} 位朋友送出`,
      simulated: r.sim > 0,
    })
  }

  for (const v of listVenues({ kind: 'stall', demo: opts.demo }).filter(s => s.years.length > 1)) {
    items.push({
      id: `streak:${v.id}`,
      kind: 'streak',
      venueId: v.id,
      venueName: v.name,
      group: v.group,
      text: `${v.name} 連續 ${v.years.length} 輪獲得${markName(v.kind)}(${v.years.join('、')} 年)`,
      simulated: v.simulated,
    })
  }

  // Newly certified (real data): stalls by market and restaurants by district, interleaved so both show.
  const newItems = (kind: 'stall' | 'restaurant') => {
    const out: Omit<FeedItem, 'reactions' | 'mine'>[] = []
    const list114 = listVenues({ kind, demo: false }).filter(s => s.years.includes(114))
    for (const g of [...new Set(list114.map(s => s.group))]) {
      const list = list114.filter(s => s.group === g)
      const unit = kind === 'stall' ? `${g}夜市 ${list.length} 攤` : `${g} ${list.length} 家餐廳`
      out.push({ id: `new:${kind}:${g}`, kind: 'new', group: g, text: `${unit}獲得 114 年${markName(kind)}`, simulated: false })
      for (const s of list.slice(0, PER_MARKET_STALLS))
        out.push({ id: `new:${s.id}`, kind: 'new', venueId: s.id, venueName: s.name, group: g, text: `${s.name} 新獲 114 年${markName(kind)}`, simulated: false })
    }
    return out
  }
  const [ns, nr] = [newItems('stall'), newItems('restaurant')]
  for (let i = 0; i < Math.max(ns.length, nr.length); i++)
    items.push(...[ns[i], nr[i]].filter((x): x is NonNullable<typeof x> => !!x))

  // Interleave the kinds so the first few items are a mix, not all milestones.
  const byKind = (['new', 'milestone', 'streak'] as const).map(k => items.filter(i => i.kind === k))
  const mixed: typeof items = []
  for (let i = 0; i < Math.max(...byKind.map(l => l.length)); i++)
    mixed.push(...byKind.flatMap(l => (l[i] ? [l[i]!] : [])))
  const filtered = opts.venueId ? mixed.filter(i => i.venueId === opts.venueId) : mixed
  const sliced = filtered.slice(0, opts.limit ?? 40)
  if (!sliced.length)
    return []

  // D1 caps bound parameters, so read all reactions and keep the ones we show.
  const { results: rs } = await db.prepare('SELECT item_id, kind, COUNT(*) AS n, SUM(CASE WHEN browser_id = ? THEN 1 ELSE 0 END) AS mine FROM reactions GROUP BY item_id, kind').bind(opts.browserId).all<{ item_id: string, kind: ReactionKind, n: number, mine: number }>()
  return sliced.map((i) => {
    const mine = rs.filter(r => r.item_id === i.id && r.mine > 0).map(r => r.kind)
    const reactions: FeedItem['reactions'] = {}
    for (const r of rs.filter(r => r.item_id === i.id)) reactions[r.kind] = r.n
    return { ...i, reactions, mine }
  })
}
