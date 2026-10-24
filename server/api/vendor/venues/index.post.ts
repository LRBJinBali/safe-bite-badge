import type { VendorVenue } from '../../../../shared/readiness'
import { logActivity, nowSec, rateLimit, useDB } from '../../../utils/db'
import { requireRole } from '../../../utils/session'
import { assertVenueQuota, parseVenueInput, randomCode } from '../../../utils/vendor'

/** Create a made-up practice venue. It never enters the diner list and cannot receive badges. */
export default defineEventHandler(async (event): Promise<VendorVenue> => {
  const session = await requireRole(event, 'vendor')
  const { name, market } = parseVenueInput(await readBody(event))
  const db = useDB(event)
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!(await rateLimit(db, `venue:${ip}`, 20)))
    throw createError({ statusCode: 429, statusMessage: 'Slow down' })
  await assertVenueQuota(db, session.accountId)
  const id = `V-${randomCode(6)}`
  await db.prepare('INSERT INTO vendor_venues (id, account_id, name, market, created_at) VALUES (?, ?, ?, ?, ?)').bind(id, session.accountId, name, market, nowSec()).run()
  await logActivity(db, 'venue', `Made-up venue ${name} (${market})`, 1)
  return { id, name, market, simulated: true, readinessDone: 0, registrationDone: 0 }
})
