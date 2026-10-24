import type { H3Event } from 'h3'
import type { Role } from '../../shared/types'
import { nowSec, useDB } from './db'

export interface Session { accountId: string, email: string, role: Role }

declare module 'h3' {
  interface H3EventContext {
    browserId: string
    demo: boolean
  }
}

export async function getSession(event: H3Event): Promise<Session | null> {
  const id = getCookie(event, 'sb_session')
  if (!id)
    return null
  const row = await useDB(event).prepare(
    'SELECT a.id AS accountId, a.email, a.role FROM sessions s JOIN accounts a ON a.id = s.account_id WHERE s.id = ? AND s.expires_at > ?',
  ).bind(id, nowSec()).first<Session>()
  return row ?? null
}

export async function requireRole(event: H3Event, role: Role): Promise<Session> {
  const s = await getSession(event)
  if (!s || s.role !== role)
    throw createError({ statusCode: 401, statusMessage: 'Sign in first' })
  return s
}

/** Admin overview: open when NUXT_ADMIN_KEY is empty, otherwise needs x-admin-key. */
export function requireAdmin(event: H3Event) {
  const key = useRuntimeConfig(event).adminKey
  if (key && getHeader(event, 'x-admin-key') !== key)
    throw createError({ statusCode: 401, statusMessage: 'Admin key needed' })
}
