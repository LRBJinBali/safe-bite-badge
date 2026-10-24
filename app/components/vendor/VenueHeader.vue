<script setup lang="ts">
/** Names the made-up practice venue the person is working on. */
defineProps<{ name: string, market: string }>()
const to = useEmbedTo()
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-lg text-[var(--sb-ink-soft)]">
    <UIcon name="i-lucide-store" class="size-5" />
    <span>練習攤位:<strong class="text-[var(--sb-ink)]">{{ name }}</strong>({{ market }})</span>
    <SimTag>虛構 made-up</SimTag>
    <NuxtLink :to="to('/vendor', { mode: 'prepare' })" class="underline">
      換一個
    </NuxtLink>
  </div>
</template>
