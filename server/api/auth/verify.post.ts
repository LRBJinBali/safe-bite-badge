import type { Role } from '../../../shared/types'
import { logActivity, nowSec, useDB } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string, role?: Role, code?: string }>(event)
  const email = body?.email?.trim().toLowerCase() ?? ''
  const role = body?.role
  if ((role !== 'vendor' && role !== 'city') || !email || !body?.code)
    throw createError({ statusCode: 400, statusMessage: 'email, role and code needed' })
  const db = useDB(event)
  const row = await db.prepare('SELECT code FROM login_codes WHERE email = ? AND role = ? AND expires_at > ?').bind(email, role, nowSec()).first<{ code: string }>()
  if (!row || row.code !== body.code.trim())
    throw createError({ statusCode: 401, statusMessage: 'Wrong or expired code' })

  let account = await db.prepare('SELECT id FROM accounts WHERE email = ? AND role = ?').bind(email, role).first<{ id: string }>()
  if (!account) {
    account = { id: crypto.randomUUID() }
    await db.prepare('INSERT INTO accounts (id, email, role, created_at) VALUES (?, ?, ?, ?)').bind(account.id, email, role, nowSec()).run()
  }
  const sid = crypto.randomUUID()
  await db.batch([
    db.prepare('INSERT INTO sessions (id, account_id, expires_at) VALUES (?, ?, ?)').bind(sid, account.id, nowSec() + 60 * 60 * 24 * 7),
    db.prepare('DELETE FROM login_codes WHERE email = ? AND role = ?').bind(email, role),
  ])
  setCookie(event, 'sb_session', sid, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
  await logActivity(db, 'signin', `${role} ${email}`, 1)
  return { role, email }
})
