<script setup lang="ts">
import type { Venue } from '~~/shared/types'
import { googleMapsQueryUrl } from '~~/shared/markets'

const props = defineProps<{ venue: Pick<Venue, 'name' | 'group' | 'kind'> }>()
const url = computed(() => googleMapsQueryUrl(props.venue.name, props.venue.group, props.venue.kind))
</script>

<template>
  <UButton :to="url" target="_blank" rel="noopener" icon="i-lucide-map-pin" size="xl" color="neutral" variant="outline">
    在 Google 地圖搜尋
  </UButton>
</template>
