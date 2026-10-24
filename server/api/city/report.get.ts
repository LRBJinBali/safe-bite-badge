import { monthOf } from '../../../shared/rules'
import { useDB } from '../../utils/db'
import { monthTotals } from '../../utils/reports'
import { requireRole } from '../../utils/session'

/** Monthly badge report for the city view: totals, per badge, per market/district. No per-stall ranking. */
export default defineEventHandler(async (event) => {
  await requireRole(event, 'city')
  const q = getQuery(event).month
  const month = typeof q === 'string' && /^\d{4}-(?:0[1-9]|1[0-2])$/.test(q) ? q : monthOf()
  const db = useDB(event)
  const totals = await monthTotals(db, month)
  const { results } = await db.prepare('SELECT DISTINCT month FROM awards ORDER BY month DESC').all<{ month: string }>()
  const months = [...new Set([monthOf(), month, ...results.map(r => r.month)])].sort().reverse()
  return { month, months, ...totals, simulatedIncluded: totals.simulated > 0 }
})
