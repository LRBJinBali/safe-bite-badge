import { useDB } from '../../utils/db'
import { applyDemoSeed } from '../../utils/seed'

/** Back to the starting state for the made-up demo stalls. Touches nothing else. Open on purpose. */
export default defineEventHandler(async (event) => {
  const db = useDB(event)
  await db.batch([
    db.prepare('DELETE FROM awards WHERE stall_id LIKE \'DEMO-%\' AND browser_id NOT LIKE \'seed-%\''),
    db.prepare('DELETE FROM award_sessions WHERE stall_id LIKE \'DEMO-%\''),
    db.prepare('DELETE FROM reactions WHERE item_id LIKE \'%DEMO-%\' AND browser_id NOT LIKE \'seed-%\''),
    db.prepare('DELETE FROM activity WHERE detail LIKE \'%示範%\''),
  ])
  await applyDemoSeed(db)
  return { ok: true }
})
