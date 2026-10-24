import type { VendorVenue } from '../../../../shared/readiness'
import { READINESS_KEYS, REGISTRATION_KEYS } from '../../../../shared/readiness'
import { useDB } from '../../../utils/db'
import { requireRole } from '../../../utils/session'

/** My made-up practice venues, with progress. */
export default defineEventHandler(async (event): Promise<VendorVenue[]> => {
  const session = await requireRole(event, 'vendor')
  const db = useDB(event)
  const { results: venues } = await db.prepare('SELECT id, name, market FROM vendor_venues WHERE account_id = ? ORDER BY created_at DESC').bind(session.accountId).all<{ id: string, name: string, market: string }>()
  if (!venues.length)
    return []
  const [ready, reg, visits] = await Promise.all([
    db.prepare('SELECT r.venue_id AS v, r.item_key AS k FROM readiness_items r JOIN vendor_venues w ON w.id = r.venue_id WHERE w.account_id = ? AND r.checked = 1').bind(session.accountId).all<{ v: string, k: string }>(),
    db.prepare('SELECT r.venue_id AS v, r.step_key AS k FROM registration_steps r JOIN vendor_venues w ON w.id = r.venue_id WHERE w.account_id = ? AND r.done = 1').bind(session.accountId).all<{ v: string, k: string }>(),
    db.prepare('SELECT q.venue_id AS v, q.ref AS ref FROM visit_requests q JOIN vendor_venues w ON w.id = q.venue_id WHERE w.account_id = ? ORDER BY q.created_at DESC').bind(session.accountId).all<{ v: string, ref: string }>(),
  ])
  return venues.map(v => ({
    ...v,
    simulated: true as const,
    readinessDone: ready.results.filter(r => r.v === v.id && READINESS_KEYS.includes(r.k)).length,
    registrationDone: reg.results.filter(r => r.v === v.id && REGISTRATION_KEYS.includes(r.k)).length,
    latestVisitRef: visits.results.find(r => r.v === v.id)?.ref,
  }))
})
