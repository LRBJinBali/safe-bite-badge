import type { H3Event } from 'h3'
import { MAX_VENUES_PER_ACCOUNT, VENUE_MARKETS, VENUE_NAME_MAX } from '../../shared/readiness'
import { useDB } from './db'
import { requireRole } from './session'

export interface OwnedVenue { id: string, name: string, market: string, account_id: string, created_at: number }

const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function randomCode(n: number) {
  return Array.from({ length: n }, () => ID_CHARS[crypto.getRandomValues(new Uint32Array(1))[0]! % ID_CHARS.length]).join('')
}

/** A vendor session may only touch its own made-up venues. 404 hides other people's ids. */
export async function requireOwnedVenue(event: H3Event) {
  const session = await requireRole(event, 'vendor')
  const id = getRouterParam(event, 'id')!
  const venue = await useDB(event).prepare('SELECT id, name, market, account_id, created_at FROM vendor_venues WHERE id = ?').bind(id).first<OwnedVenue>()
  if (!venue || venue.account_id !== session.accountId)
    throw createError({ statusCode: 404, statusMessage: 'Venue not found' })
  return { session, venue }
}

export const venueBrief = (v: OwnedVenue) => ({ id: v.id, name: v.name, market: v.market })

/** Validates a made-up venue. Throws a 400 with a short reason. */
export function parseVenueInput(body: { name?: unknown, market?: unknown } | null | undefined) {
  const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : ''
  const market = typeof body?.market === 'string' ? body.market : ''
  if (!name || name.length > VENUE_NAME_MAX)
    throw createError({ statusCode: 400, statusMessage: `name must be 1 to ${VENUE_NAME_MAX} characters` })
  // Letters, digits, spaces and a few marks only; no way to type an email, phone number or address.
  if (!/^[\p{L}\p{N} ()（）·・-]+$/u.test(name) || /\d{5,}/.test(name))
    throw createError({ statusCode: 400, statusMessage: 'name has characters that are not allowed' })
  if (!(VENUE_MARKETS as readonly string[]).includes(market))
    throw createError({ statusCode: 400, statusMessage: 'pick a market from the list' })
  return { name, market }
}

export async function assertVenueQuota(db: D1Database, accountId: string) {
  const row = await db.prepare('SELECT COUNT(*) AS n FROM vendor_venues WHERE account_id = ?').bind(accountId).first<{ n: number }>()
  if ((row?.n ?? 0) >= MAX_VENUES_PER_ACCOUNT)
    throw createError({ statusCode: 409, statusMessage: 'venue-limit' })
}

/** Reads the whole checklist for a venue as the keys that are done. */
export async function doneKeys(db: D1Database, table: 'readiness_items' | 'registration_steps', venueId: string) {
  const [keyCol, flag] = table === 'readiness_items' ? ['item_key', 'checked'] : ['step_key', 'done']
  const { results } = await db.prepare(`SELECT ${keyCol} AS k FROM ${table} WHERE venue_id = ? AND ${flag} = 1`).bind(venueId).all<{ k: string }>()
  return results.map(r => r.k)
}
