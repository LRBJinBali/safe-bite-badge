import type { Venue } from '../../../../shared/types'
import { listVenues } from '../../../utils/venues'

const MAX_RESULTS = 30

/** Find my stall: search the stalls by name or market. Open to everyone; never exposes certification level. */
export default defineEventHandler((event): Venue[] => {
  const q = String(getQuery(event).q ?? '').trim().toLowerCase().slice(0, 30)
  if (!q)
    return []
  return listVenues({ kind: 'stall', demo: event.context.demo })
    .filter(v => v.name.toLowerCase().includes(q) || v.group.includes(q) || (v.groupEn ?? '').toLowerCase().includes(q))
    .slice(0, MAX_RESULTS)
})
