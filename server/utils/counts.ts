import type { BadgeKey } from '../../shared/badges'
import type { BadgeCounts } from '../../shared/types'

export async function countsFor(db: D1Database, stallId: string) {
  const { results } = await db.prepare(
    'SELECT badge, COUNT(*) AS n, SUM(simulated) AS sim FROM awards WHERE stall_id = ? GROUP BY badge',
  ).bind(stallId).all<{ badge: BadgeKey, n: number, sim: number }>()
  const counts: BadgeCounts = {}
  let simulatedVotes = false
  for (const r of results) {
    counts[r.badge] = r.n
    if (r.sim > 0)
      simulatedVotes = true
  }
  return { counts, simulatedVotes }
}
