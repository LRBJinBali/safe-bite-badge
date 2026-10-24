import { useDB } from '../../utils/db'
import { hasSeed, runSeed, seedCounts, wipeSeed } from '../../utils/seed'

/**
 * Simulated seed votes. Safe to call any time: does nothing when the seed is already in.
 * ?force=1 wipes the simulated rows first and writes them again (needs the admin key when one is set).
 */
export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const force = getQuery(event).force === '1'
  if (force) {
    requireAdmin(event)
    await wipeSeed(db)
  }
  else if (await hasSeed(db)) {
    return { ...(await seedCounts(db)), seeded: false }
  }
  await runSeed(db)
  return { ...(await seedCounts(db)), seeded: true }
})
