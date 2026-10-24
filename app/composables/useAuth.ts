import type { Role } from '~~/shared/types'

export interface AuthMe { role: Role, email: string }

/** Simulated sign-in state. `me` is null when nobody is signed in. */
export function useAuth() {
  const { data, refresh, pending } = useFetch('/api/auth/me', { key: 'auth-me' })
  const me = computed<AuthMe | null>(() => {
    const d = data.value as { role: Role | null, email: string | null } | null | undefined
    return d?.role && d.email ? { role: d.role, email: d.email } : null
  })
  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await refresh()
  }
  return { me, refresh, pending, logout }
}
