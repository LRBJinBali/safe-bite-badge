import type { ProgressResponse } from '../../../../../shared/readiness'
import { READINESS_KEYS, READINESS_TOTAL } from '../../../../../shared/readiness'
import { useDB } from '../../../../utils/db'
import { doneKeys, requireOwnedVenue, venueBrief } from '../../../../utils/vendor'

export default defineEventHandler(async (event): Promise<ProgressResponse> => {
  const { venue } = await requireOwnedVenue(event)
  const done = (await doneKeys(useDB(event), 'readiness_items', venue.id)).filter(k => READINESS_KEYS.includes(k))
  return { venue: venueBrief(venue), done, total: READINESS_TOTAL, complete: done.length === READINESS_TOTAL }
})
