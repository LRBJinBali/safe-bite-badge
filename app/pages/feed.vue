<script setup lang="ts">
const to = useEmbedTo()
useSeoMeta({ title: '好消息｜安心標章', description: '新獲認證、連續獲證、徽章里程碑,一起為好店鼓掌。' })
const { data: items } = await useFetch('/api/feed', { key: 'feed-full' })
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <UButton :to="to('/diner')" icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="lg" class="-ml-3">
        回找好店
      </UButton>
      <h1 class="text-4xl font-black leading-tight">
        好消息
      </h1>
      <p class="text-xl text-[var(--sb-ink-soft)]">
        為好店鼓掌,也記下想去的店。
      </p>
    </div>
    <div v-if="items?.length" class="grid gap-4 md:grid-cols-2">
      <FeedItem v-for="i in items" :key="i.id" :item="i" />
    </div>
    <p v-else class="sb-card p-6 text-xl">
      好消息正在路上,晚點再來看看。
    </p>
  </div>
</template>
