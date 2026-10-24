import { useDB } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getCookie(event, 'sb_session')
  if (id) await useDB(event).prepare('DELETE FROM sessions WHERE id = ?').bind(id).run()
  deleteCookie(event, 'sb_session', { path: '/' })
  return { ok: true }
})
