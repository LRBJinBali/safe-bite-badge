<script setup lang="ts">
import type { VenueListItem } from '~~/shared/types'
import { badgeByKey } from '~~/shared/badges'

defineProps<{ venue: VenueListItem, showGroup?: boolean }>()
const to = useEmbedTo()
</script>

<template>
  <NuxtLink
    :to="to(`/stall/${venue.id}`)"
    class="sb-card-white flex items-center gap-3 p-4 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[var(--sb-moss)]"
  >
    <div class="min-w-0 flex-1 space-y-1">
      <p class="text-xl font-bold leading-snug">
        {{ venue.name }}
        <SimTag v-if="venue.simulated">
          虛構店家
        </SimTag>
      </p>
      <p class="flex flex-wrap items-center gap-x-3 text-base text-[var(--sb-ink-soft)]">
        <span v-if="showGroup">{{ venue.group }}{{ venue.kind === 'stall' ? '夜市' : '' }}</span>
        <span v-if="!venue.lapsed" class="inline-flex items-center gap-1 font-semibold text-[var(--sb-ink)]">
          <UIcon name="i-lucide-badge-check" class="size-5" /> 官方認證
        </span>
        <span v-else class="inline-flex items-center gap-1 font-semibold">
          <UIcon name="i-lucide-history" class="size-5" /> 標章已結束
        </span>
      </p>
    </div>
    <div v-if="venue.badges.length" class="flex shrink-0 flex-wrap justify-end gap-1.5">
      <span v-for="b in venue.badges" :key="b" :title="badgeByKey(b)?.zh">
        <BadgeMark :badge="b" size="sm" :label="false" />
      </span>
    </div>
    <UIcon name="i-lucide-chevron-right" class="size-6 shrink-0 text-[var(--sb-ink-soft)]" />
  </NuxtLink>
</template>
