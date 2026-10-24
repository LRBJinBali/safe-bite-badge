import type { H3Event } from 'h3'

/** Verifies a Turnstile token. With no secret configured (local, hackathon demo) it passes. */
export async function verifyTurnstile(event: H3Event, token?: string) {
  const secret = useRuntimeConfig(event).turnstileSecret
  if (!secret) return true
  if (!token) return false
  const res = await $fetch<{ success: boolean }>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: { secret, response: token, remoteip: getRequestIP(event, { xForwardedFor: true }) },
  }).catch(() => ({ success: false }))
  return res.success
}
