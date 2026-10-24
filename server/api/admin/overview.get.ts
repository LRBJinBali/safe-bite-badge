import { BADGE_KEYS } from '../../../shared/badges'
import { monthOf } from '../../../shared/rules'
import { useDB } from '../../utils/db'
import { monthTotals } from '../../utils/reports'
import { requireAdmin } from '../../utils/session'

const one = async (db: D1Database, sql: string) => (await db.prepare(sql).first<{ n: number }>())?.n ?? 0

/** Product-owner overview. Group totals only; secrets are never returned, only whether they are set. */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const db = useDB(event)
  const cfg = useRuntimeConfig(event)
  const month = monthOf()
  const totals = await monthTotals(db, month)

  const [awards, simAwards, reactions, simReactions, signins, venues, visits, activity] = await Promise.all([
    one(db, 'SELECT COUNT(*) AS n FROM awards'),
    one(db, 'SELECT COUNT(*) AS n FROM awards WHERE simulated = 1'),
    one(db, 'SELECT COUNT(*) AS n FROM reactions'),
    one(db, 'SELECT COUNT(*) AS n FROM reactions WHERE simulated = 1'),
    one(db, 'SELECT COUNT(*) AS n FROM activity WHERE kind = \'signin\''),
    one(db, 'SELECT COUNT(*) AS n FROM vendor_venues'),
    one(db, 'SELECT COUNT(*) AS n FROM visit_requests'),
    db.prepare('SELECT id, kind, detail, simulated, created_at FROM activity ORDER BY id DESC LIMIT 20').all<{ id: number, kind: string, detail: string, simulated: number, created_at: number }>(),
  ])

  return {
    month,
    now: Math.floor(Date.now() / 1000),
    kpi: {
      monthBadges: totals.total,
      awards,
      realAwards: awards - simAwards,
      simulatedAwards: simAwards,
      reactions,
      simulatedReactions: simReactions,
      signins,
      madeUpVenues: venues,
      visitRequests: visits,
    },
    groups: totals.groups.map(g => ({ group: g.group, kind: g.kind, total: g.total })),
    badges: BADGE_KEYS.map(key => ({ key, count: totals.perBadge[key] })),
    activity: activity.results.map(a => ({ id: a.id, kind: a.kind, detail: a.detail, simulated: !!a.simulated, at: a.created_at })),
    env: {
      mapboxToken: !!cfg.public.mapboxToken,
      turnstileSiteKey: !!cfg.public.turnstileSiteKey,
      turnstileSecret: !!cfg.turnstileSecret,
      adminKey: !!cfg.adminKey,
    },
  }
})
