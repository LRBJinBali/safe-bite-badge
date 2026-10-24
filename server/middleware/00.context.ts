import { randomUUID } from 'node:crypto'

/** Per-browser anonymous id (no accounts for diners) and the demo-mode flag. */
export default defineEventHandler((event) => {
  let bid = getCookie(event, 'sb_bid')
  if (!bid) {
    bid = randomUUID()
    setCookie(event, 'sb_bid', bid, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 400, path: '/' })
  }
  event.context.browserId = bid
  event.context.demo = getCookie(event, 'sb_demo') === '1'
})
