import type { BadgeKey } from '../../../../shared/badges'
import { canStartAward, monthOf } from '../../../../shared/rules'
import type { MeResponse } from '../../../../shared/types'
import { useDB } from '../../../utils/db'
import { getVenue, isDemoId } from '../../../utils/venues'

export default defineEventHandler(async (event): Promise<MeResponse> => {
  const v = getVenue(getRouterParam(event, 'id')!, event.context.demo)
  if (!v) throw createError({ statusCode: 404, statusMessage: 'Not on the list' })
  const db = useDB(event)
  const bid = event.context.browserId
  const exempt = isDemoId(v.id) && !v.lapsed
  const { results } = await db.prepare('SELECT badge FROM awards WHERE stall_id = ? AND browser_id = ?').bind(v.id, bid).all<{ badge: BadgeKey }>()
  const session = await db.prepare('SELECT 1 AS x FROM award_sessions WHERE stall_id = ? AND browser_id = ? AND month = ?').bind(v.id, bid, monthOf()).first()
  const given = results.map(r => r.badge)
  const reason = canStartAward({ lapsed: v.lapsed, exempt, alreadyGiven: given, sessionThisMonth: !!session })
  return { given, canAward: !reason, reason: reason ?? undefined, exempt }
})
