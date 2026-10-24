import type { Venue } from '../../../../shared/types'
import { listVenues } from '../../../utils/venues'

const MAX_RESULTS = 30

/** Find my stall or restaurant: search by name, market or district. Open to everyone; never exposes certification level. */
export default defineEventHandler((event): Venue[] => {
  const q = String(getQuery(event).q ?? '').trim().toLowerCase().slice(0, 30)
  if (!q)
    return []
  const matches = (v: Venue) => v.name.toLowerCase().includes(q) || v.group.includes(q) || (v.groupEn ?? '').toLowerCase().includes(q)
  // Half of the slots for each kind, so a broad query like "士林" shows both stalls and restaurants.
  const stalls = listVenues({ kind: 'stall', demo: event.context.demo }).filter(matches)
  const restaurants = listVenues({ kind: 'restaurant', demo: event.context.demo }).filter(matches)
  const half = MAX_RESULTS / 2
  const takeStalls = Math.max(half, MAX_RESULTS - restaurants.length)
  const stallPart = stalls.slice(0, takeStalls)
  return [...stallPart, ...restaurants.slice(0, MAX_RESULTS - stallPart.length)]
})
