import { getSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const s = await getSession(event)
  return { role: s?.role ?? null, email: s?.email ?? null }
})
