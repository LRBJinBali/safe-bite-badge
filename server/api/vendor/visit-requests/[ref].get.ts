import type { VisitRequestStatus } from '../../../../shared/readiness'
import { useDB } from '../../../utils/db'
import { requireRole } from '../../../utils/session'
import { venueBrief } from '../../../utils/vendor'
import { visitStatus } from '../../../utils/visitStatus'

/** SIMULATED status, derived from the request's age (see utils/visitStatus.ts). Only the owner can read it. */
export default defineEventHandler(async (event): Promise<VisitRequestStatus> => {
  const session = await requireRole(event, 'vendor')
  const ref = getRouterParam(event, 'ref')!.toUpperCase()
  const row = await useDB(event).prepare(
    'SELECT q.ref, q.created_at AS createdAt, v.id, v.name, v.market, v.account_id AS accountId FROM visit_requests q JOIN vendor_venues v ON v.id = q.venue_id WHERE q.ref = ?',
  ).bind(ref).first<{ ref: string, createdAt: number, id: string, name: string, market: string, accountId: string }>()
  if (!row || row.accountId !== session.accountId)
    throw createError({ statusCode: 404, statusMessage: 'Request not found' })
  return { ref: row.ref, venue: venueBrief({ ...row, account_id: row.accountId, created_at: row.createdAt }), createdAt: row.createdAt, status: visitStatus(row.createdAt), simulated: true }
})
