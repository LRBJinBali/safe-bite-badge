/** Demo mode: the parent page can tell an embedded pane to reload its data with postMessage({ type: 'refresh' }). */
export default defineNuxtPlugin(() => {
  if (window.parent === window)
    return
  window.addEventListener('message', (e) => {
    if (e.origin === location.origin && e.data?.type === 'refresh')
      refreshNuxtData()
  })
  // Cmd/Ctrl with + - 0 pressed inside a pane zooms the demo stage, which the parent page owns.
  window.addEventListener('keydown', (e) => {
    if (!(e.metaKey || e.ctrlKey) || !['+', '=', '-', '_', '0'].includes(e.key))
      return
    e.preventDefault()
    window.parent.postMessage({ type: 'key', key: e.key, mod: true, alt: e.altKey }, location.origin)
  })
})
