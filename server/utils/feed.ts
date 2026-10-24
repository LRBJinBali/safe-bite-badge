import type { FeedItem, ReactionKind } from '../../shared/types'
import { badgeByKey } from '../../shared/badges'
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
      text: `${v.name} 連續 ${v.years.length} 輪獲得食安微笑標章(${v.years.join('、')} 年)`,
      simulated: v.simulated,
    })
  }

  const stalls114 = listVenues({ kind: 'stall', demo: false }).filter(s => s.years.includes(114))
  const markets = [...new Set(stalls114.map(s => s.group))]
  for (const m of markets) {
    const list = stalls114.filter(s => s.group === m)
    items.push({ id: `new:market:${m}`, kind: 'new', group: m, text: `${m}夜市 ${list.length} 攤獲得 114 年食安微笑標章`, simulated: false })
    for (const s of list.slice(0, PER_MARKET_STALLS)) {
      items.push({ id: `new:${s.id}`, kind: 'new', venueId: s.id, venueName: s.name, group: m, text: `${s.name} 新獲 114 年食安微笑標章`, simulated: false })
    }
  }

  const filtered = opts.venueId ? items.filter(i => i.venueId === opts.venueId) : items
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
