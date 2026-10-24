import { useDB } from '../../../../utils/db'
import { requireOwnedVenue } from '../../../../utils/vendor'
import { visitStatus } from '../../../../utils/visitStatus'

/** This venue's requests, newest first. */
export default defineEventHandler(async (event) => {
  const { venue } = await requireOwnedVenue(event)
  const { results } = await useDB(event).prepare('SELECT ref, created_at AS createdAt FROM visit_requests WHERE venue_id = ? ORDER BY created_at DESC LIMIT 10').bind(venue.id).all<{ ref: string, createdAt: number }>()
  return results.map(r => ({ ...r, status: visitStatus(r.createdAt), simulated: true as const }))
})
