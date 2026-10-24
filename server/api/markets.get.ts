import type { GroupInfo, VenueKind } from '../../shared/types'
import { DISTRICT_POS, MARKET_POS, stallArea } from '../../shared/markets'
import { listVenues } from '../utils/venues'

/** Map pins: districts (stalls are grouped by their market's district), with venue counts. */
export default defineEventHandler((event): GroupInfo[] => {
  const kind = getQuery(event).kind as VenueKind | undefined
  const groups = new Map<string, GroupInfo>()
  for (const v of listVenues({ kind, demo: event.context.demo })) {
    const area = v.kind === 'stall' ? stallArea(v.group) : v.group
    const key = `${v.kind}:${area}`
    const g = groups.get(key)
    if (g) {
      g.count++
      continue
    }
    const pos = DISTRICT_POS[area] ?? MARKET_POS[area]
    if (pos)
      groups.set(key, { key: area, en: area === v.group ? v.groupEn : undefined, kind: v.kind, lat: pos.lat, lng: pos.lng, count: 1 })
  }
  return [...groups.values()]
})
