import type { VendorVenue } from '~~/shared/readiness'

/**
 * Vendor pages that need a made-up sign-in. Redirects to /login?role=vendor&next=<this page>.
 * Pages with `needsVenue: true` also need ?venue=<id>: with exactly one practice venue it is filled in, otherwise /vendor picks one.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const requestFetch = useRequestFetch()
  const me = await requestFetch<{ role: string } | null>('/api/auth/me').catch(() => null)
  if (me?.role !== 'vendor')
    return navigateTo({ path: '/login', query: { role: 'vendor', next: to.fullPath } })
  if (to.meta.needsVenue && typeof to.query.venue !== 'string') {
    const venues = await requestFetch<VendorVenue[]>('/api/vendor/venues').catch(() => [])
    if (venues.length === 1)
      return navigateTo({ path: to.path, query: { ...to.query, venue: venues[0]!.id } }, { replace: true })
    return navigateTo({ path: '/vendor', query: { mode: 'prepare', ...(to.query.embed ? { embed: to.query.embed } : {}) } })
  }
})
