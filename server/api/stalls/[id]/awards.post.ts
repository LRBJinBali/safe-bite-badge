import type { BadgeKey } from '../../../../shared/badges'
import { awardBlock, monthOf } from '../../../../shared/rules'
import { countsFor } from '../../../utils/counts'
import { logActivity, nowSec, rateLimit, useDB } from '../../../utils/db'
import { verifyTurnstile } from '../../../utils/turnstile'
import { getVenue, isDemoId } from '../../../utils/venues'

/** Award 1 to 4 badges. The rules live in shared/rules.ts; this only does the I/O. */
export default defineEventHandler(async (event) => {
  const v = getVenue(getRouterParam(event, 'id')!, event.context.demo)
  if (!v)
    throw createError({ statusCode: 404, statusMessage: 'Not on the list' })
  const body = await readBody<{ badges?: string[], turnstile?: string }>(event)
  const requested = Array.isArray(body?.badges) ? body.badges : []
  const db = useDB(event)
  const bid = event.context.browserId
  const exempt = isDemoId(v.id) && !v.lapsed

  if (!exempt) {
    if (!(await verifyTurnstile(event, body?.turnstile)))
      throw createError({ statusCode: 403, statusMessage: 'Spam check failed' })
    const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
    if (!(await rateLimit(db, `award:${ip}`, 20)))
      throw createError({ statusCode: 429, statusMessage: 'Slow down' })
  }

  const month = monthOf()
  const { results } = await db.prepare('SELECT badge FROM awards WHERE stall_id = ? AND browser_id = ?').bind(v.id, bid).all<{ badge: BadgeKey }>()
  const session = await db.prepare('SELECT 1 AS x FROM award_sessions WHERE stall_id = ? AND browser_id = ? AND month = ?').bind(v.id, bid, month).first()
  const block = awardBlock({ lapsed: v.lapsed, exempt, requested, alreadyGiven: results.map(r => r.badge), sessionThisMonth: !!session })
  if (block)
    throw createError({ statusCode: 409, statusMessage: block, data: { reason: block } })

  // The demo stall can be awarded again and again: each award counts as a new person.
  const who = exempt ? `${bid}:${Date.now()}` : bid
  const t = nowSec()
  await db.batch([
    ...requested.map(b => db.prepare('INSERT OR IGNORE INTO awards (stall_id, browser_id, badge, month, simulated, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(v.id, who, b, month, v.simulated ? 1 : 0, t)),
    db.prepare('INSERT OR IGNORE INTO award_sessions (stall_id, browser_id, month) VALUES (?, ?, ?)').bind(v.id, who, month),
  ])
  await logActivity(db, 'award', `${v.name}: ${requested.join(', ')}`, v.simulated ? 1 : 0)
  return { given: requested, ...(await countsFor(db, v.id)) }
})
