import type { VenueDetail } from '../../../../shared/types'
import { countsFor } from '../../../utils/counts'
import { useDB } from '../../../utils/db'
import { getVenue } from '../../../utils/venues'

export default defineEventHandler(async (event): Promise<VenueDetail> => {
  const v = getVenue(getRouterParam(event, 'id')!, event.context.demo)
  if (!v) throw createError({ statusCode: 404, statusMessage: 'Not on the list' })
  return { ...v, ...(await countsFor(useDB(event), v.id)) }
})
