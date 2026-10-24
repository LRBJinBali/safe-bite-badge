<script setup lang="ts">
import { BADGES } from '~~/shared/badges'
import type { VenueDetail } from '~~/shared/types'

/** The one stall component: diner page, vendor view and vendor preview all render this. */
const props = defineProps<{ venue: VenueDetail }>()
const received = computed(() => BADGES.filter(b => props.venue.counts[b.key]))
</script>

<template>
  <article class="sb-card-white space-y-5 p-6">
    <header class="space-y-2">
      <p class="flex items-center gap-2 text-lg text-[var(--sb-ink-soft)]">
        <UIcon :name="venue.kind === 'stall' ? 'i-lucide-store' : 'i-lucide-utensils'" class="size-5" />
        {{ venue.group }}{{ venue.kind === 'stall' ? '夜市' : '' }}
        <SimTag v-if="venue.simulated">虛構店家 made-up</SimTag>
      </p>
      <h1 class="text-3xl font-black leading-tight">
        {{ venue.name }}
      </h1>
      <OfficialMark :years="venue.years" :lapsed="venue.lapsed" :simulated="venue.simulated" />
    </header>

    <section v-if="received.length" class="space-y-3">
      <h2 class="flex items-center gap-2 text-lg font-bold">
        朋友送出的徽章
        <SimTag v-if="venue.simulatedVotes">含模擬票</SimTag>
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <BadgeMark v-for="b in received" :key="b.key" :badge="b.key" :count="venue.counts[b.key]" />
      </div>
      <p class="text-sm text-[var(--sb-ink-soft)]">
        數字是送出這個徽章的人數。
      </p>
    </section>

    <div class="flex flex-wrap gap-3">
      <LocationButton :venue="venue" />
      <slot name="actions" />
    </div>
    <slot />
  </article>
</template>
