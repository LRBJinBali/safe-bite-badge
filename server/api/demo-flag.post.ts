/** Turns demo mode on or off for this browser (shows the made-up demo venues). */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ on?: boolean }>(event)
  if (body?.on) setCookie(event, 'sb_demo', '1', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 14, path: '/' })
  else deleteCookie(event, 'sb_demo', { path: '/' })
  return { demo: !!body?.on }
})
