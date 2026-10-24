import { randomInt } from 'node:crypto'
import type { Role } from '../../../shared/types'
import { nowSec, rateLimit, useDB } from '../../utils/db'

/** Simulated sign-in: no email is sent. The code is returned for the form to show and prefill. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string, role?: Role }>(event)
  const email = body?.email?.trim().toLowerCase() ?? ''
  const role = body?.role
  if (role !== 'vendor' && role !== 'city') throw createError({ statusCode: 400, statusMessage: 'role must be vendor or city' })
  if (!/^[a-z0-9._-]{1,40}@example\.test$/.test(email)) throw createError({ statusCode: 400, statusMessage: 'Only made-up @example.test addresses' })
  const db = useDB(event)
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!(await rateLimit(db, `code:${ip}`, 20))) throw createError({ statusCode: 429, statusMessage: 'Slow down' })
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  await db.prepare('INSERT OR REPLACE INTO login_codes (email, role, code, expires_at) VALUES (?, ?, ?, ?)').bind(email, role, code, nowSec() + 600).run()
  return { code, simulated: true }
})
