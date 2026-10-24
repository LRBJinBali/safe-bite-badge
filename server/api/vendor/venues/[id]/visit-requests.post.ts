import { logActivity, nowSec, rateLimit, useDB } from '../../../../utils/db'
import { randomCode, requireOwnedVenue } from '../../../../utils/vendor'

/** SIMULATED: stores a request with a reference number. It reaches no one. */
export default defineEventHandler(async (event) => {
  const { venue } = await requireOwnedVenue(event)
  const db = useDB(event)
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!(await rateLimit(db, `visit:${ip}`, 20)))
    throw createError({ statusCode: 429, statusMessage: 'Slow down' })
  const createdAt = nowSec()
  for (let i = 0; i < 5; i++) {
    const ref = `SB-${randomCode(4)}`
    try {
      await db.prepare('INSERT INTO visit_requests (ref, venue_id, created_at) VALUES (?, ?, ?)').bind(ref, venue.id, createdAt).run()
      await logActivity(db, 'visit-request', `${ref} ${venue.name}`, 1)
      return { ref, createdAt, simulated: true as const }
    }
    catch {
      // reference collision: try another
    }
  }
  throw createError({ statusCode: 500, statusMessage: 'Could not create a reference' })
})
