<script setup lang="ts">
/** "Taipei has received X badges this month". Polls every 3s inside demo panes. */
defineProps<{ compact?: boolean }>()

const embed = useEmbed()
const { data: counter, refresh } = await useFetch('/api/counter', { key: 'counter' })

const { pause, resume } = useIntervalFn(() => refresh(), 3000, { immediate: false })
onMounted(() => {
  if (embed.value)
    resume()
})
onBeforeUnmount(pause)
</script>

<template>
  <p v-if="compact" class="text-xl font-bold">
    <template v-if="counter && counter.total > 0">
      台北本月已收到 <span class="text-3xl font-black text-[var(--sb-moss)]">{{ counter.total }}</span> 個徽章,有你一份
      <SimTag v-if="counter.simulatedIncluded">
        含模擬資料
      </SimTag>
    </template>
  </p>
  <div v-else class="sb-card relative overflow-hidden px-6 py-8 text-center">
    <span class="pointer-events-none absolute -left-10 -top-12 size-40 rounded-full bg-[var(--sb-moss)]/10" aria-hidden="true" />
    <span class="pointer-events-none absolute -bottom-14 -right-8 size-44 rounded-[60%_40%_55%_45%] bg-[var(--sb-badge-sit)]/25" aria-hidden="true" />
    <div v-if="counter && counter.total > 0" class="relative">
      <p class="text-xl font-bold text-[var(--sb-ink-soft)]">
        台北本月已收到
      </p>
      <p class="my-1 flex items-baseline justify-center gap-2">
        <span class="text-6xl font-black leading-none text-[var(--sb-moss)] sm:text-7xl">{{ counter.total }}</span>
        <span class="text-3xl font-black">個徽章</span>
      </p>
      <SimTag v-if="counter.simulatedIncluded">
        含模擬資料
      </SimTag>
    </div>
    <div v-else class="relative">
      <p class="text-2xl font-black">
        送出本月第一個徽章
      </p>
      <p class="text-lg text-[var(--sb-ink-soft)]">
        幫喜歡的店加油吧
      </p>
    </div>
  </div>
</template>
