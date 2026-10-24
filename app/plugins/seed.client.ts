/** Once per browser session: make sure the simulated seed votes exist (the call is idempotent). */
export default defineNuxtPlugin(() => {
  try {
    if (sessionStorage.getItem('sb_seeded'))
      return
    sessionStorage.setItem('sb_seeded', '1')
  }
  catch {}
  $fetch('/api/demo/seed', { method: 'POST' }).catch(() => {
    try {
      sessionStorage.removeItem('sb_seeded')
    }
    catch {}
  })
})
