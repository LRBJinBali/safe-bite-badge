import { useDB } from '../../utils/db'
import { requireRole } from '../../utils/session'
import { getVenue } from '../../utils/venues'
import { VISIT_STATUS_ZH, visitStatus } from '../../utils/visitStatus'

interface Row { ref: string, venue_id: string, created_at: number, vname: string | null, vmarket: string | null }

/** Stored visit requests with their derived, simulated status. Read-only. */
export default defineEventHandler(async (event) => {
  await requireRole(event, 'city')
  const { results } = await useDB(event).prepare(
    `SELECT r.ref, r.venue_id, r.created_at, v.name AS vname, v.market AS vmarket
     FROM visit_requests r LEFT JOIN vendor_venues v ON v.id = r.venue_id
     ORDER BY r.created_at DESC LIMIT 100`,
  ).all<Row>()
  return {
    simulated: true,
    items: results.map((r) => {
      const known = r.vname ? undefined : getVenue(r.venue_id, true)
      const status = visitStatus(r.created_at)
      return {
        ref: r.ref,
        venueName: r.vname ?? known?.name ?? r.venue_id,
        group: r.vmarket ?? known?.group ?? '',
        madeUp: !!r.vname || !!known?.simulated,
        createdAt: r.created_at,
        status,
        statusZh: VISIT_STATUS_ZH[status],
      }
    }),
  }
})
