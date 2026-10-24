import type { H3Event } from 'h3'

export function useDB(event: H3Event): D1Database {
  const db = (event.context.cloudflare?.env as { DB?: D1Database } | undefined)?.DB
  if (!db)
    throw createError({ statusCode: 500, statusMessage: 'D1 binding DB missing (run pnpm db:migrate, use pnpm dev)' })
  return db
}

export const nowSec = () => Math.floor(Date.now() / 1000)

export async function logActivity(db: D1Database, kind: string, detail: string, simulated = 0) {
  await db.prepare('INSERT INTO activity (kind, detail, simulated, created_at) VALUES (?, ?, ?, ?)')
    .bind(kind, detail, simulated, nowSec())
    .run()
}

/** Fixed-window per-key counter. Returns true when the call is allowed. */
export async function rateLimit(db: D1Database, key: string, max: number, windowSec = 60) {
  const window = Math.floor(nowSec() / windowSec)
  await db.prepare('INSERT INTO rate_limits (key, window, n) VALUES (?, ?, 1) ON CONFLICT (key, window) DO UPDATE SET n = n + 1').bind(key, window).run()
  const row = await db.prepare('SELECT n FROM rate_limits WHERE key = ? AND window = ?').bind(key, window).first<{ n: number }>()
  return (row?.n ?? 1) <= max
}
