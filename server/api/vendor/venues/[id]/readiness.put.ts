import type { ProgressResponse } from '../../../../../shared/readiness'
import { READINESS_KEYS, READINESS_TOTAL } from '../../../../../shared/readiness'
import { useDB } from '../../../../utils/db'
import { doneKeys, requireOwnedVenue, venueBrief } from '../../../../utils/vendor'

/** Autosave one tick: body { key, checked }. */
export default defineEventHandler(async (event): Promise<ProgressResponse> => {
  const { venue } = await requireOwnedVenue(event)
  const body = await readBody<{ key?: string, checked?: boolean }>(event)
  if (!body?.key || !READINESS_KEYS.includes(body.key) || typeof body.checked !== 'boolean')
    throw createError({ statusCode: 400, statusMessage: 'key and checked needed' })
  const db = useDB(event)
  await db.prepare('INSERT INTO readiness_items (venue_id, item_key, checked) VALUES (?, ?, ?) ON CONFLICT (venue_id, item_key) DO UPDATE SET checked = excluded.checked').bind(venue.id, body.key, body.checked ? 1 : 0).run()
  const done = (await doneKeys(db, 'readiness_items', venue.id)).filter(k => READINESS_KEYS.includes(k))
  return { venue: venueBrief(venue), done, total: READINESS_TOTAL, complete: done.length === READINESS_TOTAL }
})
