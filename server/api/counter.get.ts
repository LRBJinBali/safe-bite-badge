import { monthOf } from '../../shared/rules'
import { useDB } from '../utils/db'

/** "Taipei has received X badges this month". */
export default defineEventHandler(async (event) => {
  const month = monthOf()
  const row = await useDB(event).prepare('SELECT COUNT(*) AS total, COALESCE(SUM(simulated), 0) AS sim FROM awards WHERE month = ?').bind(month).first<{ total: number, sim: number }>()
  return { month, total: row?.total ?? 0, simulatedIncluded: (row?.sim ?? 0) > 0 }
})
