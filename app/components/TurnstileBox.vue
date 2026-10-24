<script setup lang="ts">
/** Invisible spam check. Renders nothing and emits '' when no site key is configured. */
const emit = defineEmits<{ token: [value: string] }>()
const siteKey = useRuntimeConfig().public.turnstileSiteKey
const el = ref<HTMLElement>()

onMounted(() => {
  if (!siteKey)
    return emit('token', '')
  const w = window as unknown as { turnstile?: { render: (el: HTMLElement, o: object) => void } }
  const render = () => w.turnstile?.render(el.value!, { sitekey: siteKey, appearance: 'interaction-only', callback: (t: string) => emit('token', t) })
  if (w.turnstile)
    return render()
  const s = document.createElement('script')
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
  s.async = true
  s.onload = render
  document.head.appendChild(s)
})
</script>

<template>
  <div v-if="siteKey" ref="el" />
</template>
