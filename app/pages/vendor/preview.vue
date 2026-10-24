<script setup lang="ts">
import type { ProgressResponse } from '~~/shared/readiness'
import type { VenueDetail } from '~~/shared/types'

definePageMeta({ middleware: 'vendor-auth', needsVenue: true })
useHead({ title: '食客會看到的樣子 · 安心標章' })

const to = useEmbedTo()
const venueId = useVendorVenueId()
const { data, error } = await useFetch<ProgressResponse>(() => `/api/vendor/venues/${venueId.value}/readiness`, { key: 'preview-venue', watch: [venueId] })

/** Example numbers only: this venue is made up, is not in the diner list and cannot receive badges. */
const venue = computed<VenueDetail | null>(() => !data.value
  ? null
  : {
      id: data.value.venue.id,
      kind: 'stall',
      name: data.value.venue.name,
      group: data.value.venue.market,
      seq: 0,
      years: [],
      lapsed: false,
      simulated: true,
      counts: { detour: 3, sit: 2, access: 1 },
      simulatedVotes: true,
    })
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <VendorStepBar :current="4" :venue-id="venueId" />

    <VendorLoadError v-if="error" />
    <template v-else-if="venue && data">
      <header class="space-y-3">
        <h1 class="text-3xl font-black leading-tight sm:text-4xl">
          第 4 步:食客會看到的樣子
        </h1>
        <VendorVenueHeader :name="data.venue.name" :market="data.venue.market" />
      </header>

      <div class="space-y-2 rounded-3xl border-2 border-dashed border-[var(--sb-simulated)] bg-[var(--sb-simulated-bg)] p-5">
        <div class="flex flex-wrap items-center gap-3">
          <SimTag class="!px-4 !py-1 !text-lg">
            預覽 · 模擬 simulated
          </SimTag>
          <p class="text-xl font-black">
            這是示範畫面,不是真的
          </p>
        </div>
        <p class="text-lg">
          通過認證後,食客會用同樣的版面看到你的攤位。下面的徽章和數字都是示範用,你的攤位還不會出現在食客的清單裡,也不能收到徽章。
        </p>
      </div>

      <StallView :venue="venue" preview />

      <div class="flex flex-wrap gap-3">
        <UButton :to="to('/vendor/visit', { venue: venueId })" size="xl" color="neutral" variant="outline" icon="i-lucide-arrow-left">
          回到預約
        </UButton>
        <UButton :to="to('/vendor', { mode: 'prepare' })" size="xl" color="neutral" variant="outline">
          回到攤商首頁
        </UButton>
      </div>
    </template>
  </div>
</template>
