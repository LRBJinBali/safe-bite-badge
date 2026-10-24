/** Demo mode shows made-up venues and the demo controls. It is a per-browser cookie. */
export function useDemo() {
  const demo = useCookie<string | null>('sb_demo', { maxAge: 60 * 60 * 24 * 14, sameSite: 'lax', path: '/' })
  return {
    isDemo: computed(() => demo.value === '1'),
    async setDemo(on: boolean) {
      await $fetch('/api/demo-flag', { method: 'POST', body: { on } })
      demo.value = on ? '1' : null
    },
  }
}

/** Embedded panes (demo mode) hide the page chrome: ?embed=1 */
export const useEmbed = () => computed(() => useRoute().query.embed === '1')
