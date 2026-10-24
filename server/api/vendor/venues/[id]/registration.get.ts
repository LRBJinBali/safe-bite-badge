import type { ProgressResponse } from '../../../../../shared/readiness'
import { REGISTRATION_KEYS, REGISTRATION_TOTAL } from '../../../../../shared/readiness'
import { useDB } from '../../../../utils/db'
import { doneKeys, requireOwnedVenue, venueBrief } from '../../../../utils/vendor'

export default defineEventHandler(async (event): Promise<ProgressResponse> => {
  const { venue } = await requireOwnedVenue(event)
  const done = (await doneKeys(useDB(event), 'registration_steps', venue.id)).filter(k => REGISTRATION_KEYS.includes(k))
  return { venue: venueBrief(venue), done, total: REGISTRATION_TOTAL, complete: done.length === REGISTRATION_TOTAL }
})
