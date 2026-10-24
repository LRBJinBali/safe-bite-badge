import { DISTRICT_POS, MARKET_POS } from '../../shared/markets'
import type { GroupInfo, VenueKind } from '../../shared/types'
import { listVenues } from '../utils/venues'

/** Map pins: night markets (stalls) and districts (restaurants), with venue counts. */
export default defineEventHandler((event): GroupInfo[] => {
  const kind = getQuery(event).kind as VenueKind | undefined
  const groups = new Map<string, GroupInfo>()
  for (const v of listVenues({ kind, demo: event.context.demo })) {
    const key = `${v.kind}:${v.group}`
    const g = groups.get(key)
    if (g) { g.count++; continue }
    const pos = (v.kind === 'stall' ? MARKET_POS : DISTRICT_POS)[v.group]
    if (pos) groups.set(key, { key: v.group, en: v.groupEn, kind: v.kind, lat: pos.lat, lng: pos.lng, count: 1 })
  }
  return [...groups.values()]
})
