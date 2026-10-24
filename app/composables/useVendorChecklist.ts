import type { ProgressResponse } from '~~/shared/readiness'

/** Readiness check or registration walkthrough: loads ticks, saves each tick as it happens. */
export async function useVendorChecklist(kind: 'readiness' | 'registration') {
  const venueId = useVendorVenueId()
  const toast = useToast()
  const url = computed(() => `/api/vendor/venues/${venueId.value}/${kind}`)
  const { data, error } = await useFetch<ProgressResponse>(url, { key: `vendor-${kind}`, watch: [venueId] })
  const done = ref<string[]>([])
  watch(data, (d) => {
    if (d)
      done.value = [...d.done]
  }, { immediate: true })
  const saving = ref(false)

  const isDone = (key: string) => done.value.includes(key)
  async function toggle(key: string) {
    const was = isDone(key)
    done.value = was ? done.value.filter(k => k !== key) : [...done.value, key]
    try {
      const body = kind === 'readiness' ? { key, checked: !was } : { key, done: !was }
      saving.value = true
      await $fetch(url.value, { method: 'PUT', body })
    }
    catch (e) {
      done.value = was ? [...done.value, key] : done.value.filter(k => k !== key)
      toast.add({ title: vendorError(e), color: 'error' })
    }
    finally { saving.value = false }
  }
  return { venueId, data, error, done, isDone, toggle, saving }
}
