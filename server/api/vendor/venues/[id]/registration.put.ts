import type { ProgressResponse } from '../../../../../shared/readiness'
import { REGISTRATION_KEYS, REGISTRATION_TOTAL } from '../../../../../shared/readiness'
import { useDB } from '../../../../utils/db'
import { doneKeys, requireOwnedVenue, venueBrief } from '../../../../utils/vendor'

/** Autosave one step: body { key, done }. */
export default defineEventHandler(async (event): Promise<ProgressResponse> => {
  const { venue } = await requireOwnedVenue(event)
  const body = await readBody<{ key?: string, done?: boolean }>(event)
  if (!body?.key || !REGISTRATION_KEYS.includes(body.key) || typeof body.done !== 'boolean')
    throw createError({ statusCode: 400, statusMessage: 'key and done needed' })
  const db = useDB(event)
  await db.prepare('INSERT INTO registration_steps (venue_id, step_key, done) VALUES (?, ?, ?) ON CONFLICT (venue_id, step_key) DO UPDATE SET done = excluded.done').bind(venue.id, body.key, body.done ? 1 : 0).run()
  const done = (await doneKeys(db, 'registration_steps', venue.id)).filter(k => REGISTRATION_KEYS.includes(k))
  return { venue: venueBrief(venue), done, total: REGISTRATION_TOTAL, complete: done.length === REGISTRATION_TOTAL }
})
