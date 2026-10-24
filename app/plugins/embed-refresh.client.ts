/** Demo mode: the parent page can tell an embedded pane to reload its data with postMessage({ type: 'refresh' }). */
export default defineNuxtPlugin(() => {
  if (window.parent === window)
    return
  window.addEventListener('message', (e) => {
    if (e.origin === location.origin && e.data?.type === 'refresh')
      refreshNuxtData()
  })
})
