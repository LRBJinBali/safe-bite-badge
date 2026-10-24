import type { Venue, VenueKind } from '../../shared/types'
import stallsRaw from '../../Data/006-stalls.json'
import restaurantsRaw from '../../Data/007-restaurants.json'

interface RawStall { id: string, list_year: number, market: string, market_en: string, seq: number, name: string, reg_root: string }
interface RawRestaurant { id: string, district: string, name: string, is_chain: boolean }

/** Hand-confirmed multi-round matches (see Data/index.md). Never match automatically. */
const CONFIRMED_SAME_BUSINESS: Record<string, string[]> = {
  'A-200193596': ['好吸'],
}

/** Made-up venues, only visible in demo mode. Not real businesses. */
export const DEMO_MARKET = '示範夜市'
const DEMO_VENUES: Venue[] = [
  { id: 'DEMO-001', kind: 'stall', name: '示範小吃攤(虛構)', group: DEMO_MARKET, groupEn: 'Demo Market', seq: 1, years: [112, 113, 114], lapsed: false, simulated: true },
  { id: 'DEMO-002', kind: 'stall', name: '示範滷味攤(虛構)', group: DEMO_MARKET, groupEn: 'Demo Market', seq: 2, years: [114], lapsed: false, simulated: true },
  { id: 'DEMO-R-001', kind: 'restaurant', name: '示範小館(虛構)', group: '大安區', seq: 0, years: [], lapsed: false, simulated: true },
  { id: 'DEMO-LAPSED-001', kind: 'stall', name: '示範老攤(虛構・標章已結束)', group: DEMO_MARKET, groupEn: 'Demo Market', seq: 3, years: [112], lapsed: true, simulated: true },
]
export const DEMO_STALL_ID = 'DEMO-001'
export const isDemoId = (id: string) => id.startsWith('DEMO-')

const stallRows = stallsRaw as RawStall[]
const currentRows = stallRows.filter(s => s.list_year >= 113)

function yearsFor(s: RawStall) {
  const roots = CONFIRMED_SAME_BUSINESS[s.reg_root]
  if (!roots || !roots.includes(s.name))
    return [s.list_year]
  return [...new Set(stallRows.filter(o => o.reg_root === s.reg_root && roots.includes(o.name)).map(o => o.list_year))].sort()
}

const stalls: Venue[] = currentRows.map(s => ({
  id: s.id,
  kind: 'stall',
  name: s.name,
  group: s.market,
  groupEn: s.market_en,
  seq: s.seq,
  years: yearsFor(s),
  lapsed: false,
  simulated: false,
}))

const restaurants: Venue[] = (restaurantsRaw as RawRestaurant[])
  .filter(r => !r.is_chain)
  .map((r, i) => ({
    id: r.id,
    kind: 'restaurant' as VenueKind,
    name: r.name,
    group: r.district,
    seq: i + 1,
    years: [],
    lapsed: false,
    simulated: false,
  }))

const byId = new Map<string, Venue>([...stalls, ...restaurants, ...DEMO_VENUES].map(v => [v.id, v]))

export function getVenue(id: string, demo: boolean): Venue | undefined {
  const v = byId.get(id)
  if (v && v.simulated && !demo)
    return undefined
  return v
}

export function listVenues(opts: { kind?: VenueKind, group?: string, demo: boolean }): Venue[] {
  const base: Venue[] = []
  if (!opts.kind || opts.kind === 'stall')
    base.push(...stalls)
  if (!opts.kind || opts.kind === 'restaurant')
    base.push(...restaurants)
  if (opts.demo)
    base.unshift(...DEMO_VENUES.filter(v => !opts.kind || v.kind === opts.kind))
  return opts.group ? base.filter(v => v.group === opts.group) : base
}

export const allVenues = (demo: boolean) => listVenues({ demo })
export const demoVenues = () => DEMO_VENUES
