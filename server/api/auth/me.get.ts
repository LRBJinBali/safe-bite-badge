import { getSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const s = await getSession(event)
  return s ? { role: s.role, email: s.email } : null
})
