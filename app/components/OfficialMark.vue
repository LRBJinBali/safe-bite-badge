<script setup lang="ts">
const props = defineProps<{ years: number[], lapsed?: boolean, simulated?: boolean }>()
const yearText = computed(() => props.years.map(y => `${y}年`).join('、'))
</script>

<template>
  <div v-if="!lapsed" class="inline-flex items-center gap-2 rounded-full border-2 border-[var(--sb-ink)] px-3 py-1 font-bold">
    <UIcon name="i-lucide-badge-check" class="size-6" />
    <span>官方認證<span v-if="years.length" class="ml-1 font-normal text-sm">({{ yearText }})</span></span>
    <SimTag v-if="simulated" />
  </div>
  <div v-else class="inline-flex items-center gap-2 rounded-full bg-stone-200 px-3 py-1 font-semibold">
    <UIcon name="i-lucide-history" class="size-5" />
    <span>標章已結束<span v-if="years.length" class="ml-1 font-normal text-sm">(曾於 {{ yearText }} 獲認證)</span></span>
    <SimTag v-if="simulated" />
  </div>
</template>
