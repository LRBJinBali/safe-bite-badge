import type { ReactionKind } from '../../../../shared/types'
import { rateLimit, useDB } from '../../../utils/db'
import { verifyTurnstile } from '../../../utils/turnstile'

const KINDS: ReactionKind[] = ['congrats', 'want', 'been']

/** One of each kind per browser per item. Posting again is a no-op. */
export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id')!)
  const body = await readBody<{ kind?: ReactionKind, turnstile?: string }>(event)
  if (!body?.kind || !KINDS.includes(body.kind)) throw createError({ statusCode: 400, statusMessage: 'Unknown reaction' })
  if (!(await verifyTurnstile(event, body.turnstile))) throw createError({ statusCode: 403, statusMessage: 'Spam check failed' })
  const db = useDB(event)
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!(await rateLimit(db, `react:${ip}`, 60))) throw createError({ statusCode: 429, statusMessage: 'Slow down' })
  await db.prepare('INSERT OR IGNORE INTO reactions (item_id, browser_id, kind) VALUES (?, ?, ?)').bind(id, event.context.browserId, body.kind).run()
  const row = await db.prepare('SELECT COUNT(*) AS n FROM reactions WHERE item_id = ? AND kind = ?').bind(id, body.kind).first<{ n: number }>()
  return { kind: body.kind, count: row?.n ?? 1 }
})
