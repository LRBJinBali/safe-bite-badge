import type { BadgeKey } from '../../../../shared/badges'
import type { VendorStallView } from '../../../../shared/readiness'
import type { BadgeCounts } from '../../../../shared/types'
import { monthOf } from '../../../../shared/rules'
import { countsFor } from '../../../utils/counts'
import { useDB } from '../../../utils/db'
import { buildFeed } from '../../../utils/feed'
import { getVenue } from '../../../utils/venues'

/** Read-only vendor view of a real (or demo) stall. No sign-in: nobody can edit or claim anything. */
export default defineEventHandler(async (event): Promise<VendorStallView> => {
  const v = getVenue(getRouterParam(event, 'id')!, event.context.demo)
  if (!v)
    throw createError({ statusCode: 404, statusMessage: 'Not on the list' })
  const db = useDB(event)
  const { results } = await db.prepare('SELECT badge, COUNT(*) AS n FROM awards WHERE stall_id = ? AND month = ? GROUP BY badge').bind(v.id, monthOf()).all<{ badge: BadgeKey, n: number }>()
  const monthCounts: BadgeCounts = {}
  let monthTotal = 0
  for (const r of results) {
    monthCounts[r.badge] = r.n
    monthTotal += r.n
  }
  return {
    venue: { ...v, ...(await countsFor(db, v.id)) },
    monthCounts,
    monthTotal,
    sharePath: `/stall/${v.id}`,
    feed: await buildFeed(db, { demo: event.context.demo, browserId: event.context.browserId, venueId: v.id, limit: 10 }),
  }
})
