import { useDB } from '../../utils/db'
import { buildFeed } from '../../utils/feed'

export default defineEventHandler((event) => {
  const q = getQuery(event)
  return buildFeed(useDB(event), {
    demo: event.context.demo,
    browserId: event.context.browserId,
    venueId: typeof q.stall === 'string' ? q.stall : undefined,
    limit: q.limit ? Number(q.limit) : undefined,
  })
})
