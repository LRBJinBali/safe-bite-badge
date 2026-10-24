import type { BadgeKey } from '../../../shared/badges'
import type { VenueKind, VenueListItem } from '../../../shared/types'
import { BADGE_KEYS } from '../../../shared/badges'
import { useDB } from '../../utils/db'
import { listVenues } from '../../utils/venues'

/** Venues of one market or district, in list order (never by certification level). */
export default defineEventHandler(async (event): Promise<VenueListItem[]> => {
  const q = getQuery(event)
  const badge = BADGE_KEYS.includes(q.badge as BadgeKey) ? (q.badge as BadgeKey) : undefined
  const text = typeof q.q === 'string' ? q.q.trim() : ''
  const kind = q.kind as VenueKind | undefined
  const group = typeof q.group === 'string' ? q.group : (typeof q.market === 'string' ? q.market : undefined)
  if (!group && !text)
    throw createError({ statusCode: 400, statusMessage: 'group or q needed' })

  let venues = listVenues({ kind, group, demo: event.context.demo })
  if (text)
    venues = venues.filter(v => v.name.includes(text) || v.group.includes(text))
  venues = venues.slice(0, text ? 60 : 1000)

  // One query for every (stall, badge) pair: D1 caps bound parameters at 100, so no id lists.
  const wanted = new Set(venues.map(v => v.id))
  const { results } = await useDB(event).prepare('SELECT DISTINCT stall_id, badge FROM awards').all<{ stall_id: string, badge: BadgeKey }>()
  const badgesById = new Map<string, BadgeKey[]>()
  for (const r of results) {
    if (wanted.has(r.stall_id))
      badgesById.set(r.stall_id, [...(badgesById.get(r.stall_id) ?? []), r.badge])
  }
  const items = venues.map(v => ({ ...v, badges: BADGE_KEYS.filter(b => badgesById.get(v.id)?.includes(b)) }))
  return badge ? items.filter(v => v.badges.includes(badge)) : items
})
