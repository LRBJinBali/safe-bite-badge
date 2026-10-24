<script setup lang="ts">
/** Web Share first; LINE and copy-link as the fallback. */
const props = defineProps<{ title: string, text?: string, path?: string }>()

const origin = useRequestURL().origin
const route = useRoute()
const url = computed(() => origin + (props.path ?? route.path))
const canShare = ref(false)
onMounted(() => {
  canShare.value = typeof navigator.share === 'function'
})

const { copy, copied } = useClipboard({ copiedDuring: 2000 })
const lineUrl = computed(() => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url.value)}`)

async function share() {
  try {
    await navigator.share({ title: props.title, text: props.text, url: url.value })
  }
  catch {
    // The person closed the share sheet: nothing to do.
  }
}
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <UButton v-if="canShare" icon="i-lucide-share-2" size="xl" @click="share">
      分享給朋友
    </UButton>
    <UButton v-else :to="lineUrl" target="_blank" rel="noopener" icon="i-lucide-message-circle" size="xl" color="neutral" variant="outline">
      用 LINE 分享
    </UButton>
    <UButton :icon="copied ? 'i-lucide-check' : 'i-lucide-link'" size="xl" color="neutral" variant="outline" @click="copy(url)">
      {{ copied ? '已複製連結' : '複製連結' }}
    </UButton>
  </div>
</template>
