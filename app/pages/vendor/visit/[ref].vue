<script setup lang="ts">
import type { VisitRequestStatus } from '~~/shared/readiness'
import { VISIT_STAGES } from '~/utils/vendor'

definePageMeta({ middleware: 'vendor-auth' })
useHead({ title: '訪視申請狀態 · 安心標章' })

const route = useRoute()
const to = useEmbedTo()
const reqRef = computed(() => String(route.params.ref))
const { data, error, refresh } = await useFetch<VisitRequestStatus>(() => `/api/vendor/visit-requests/${reqRef.value}`, { key: 'visit-status', watch: [reqRef] })

// The status moves on by itself (simulated), so look again every 2 seconds until it is done.
const { pause } = useIntervalFn(() => {
  if (data.value?.status === 'assessed')
    pause()
  else refresh()
}, 2000)

const stageIndex = computed(() => VISIT_STAGES.findIndex(s => s.key === data.value?.status))
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <VendorStepBar :current="3" :venue-id="data?.venue.id" />

    <div v-if="error" class="sb-card space-y-3 p-6">
      <p class="text-2xl font-black">
        找不到這個申請編號
      </p>
      <UButton :to="to('/vendor', { mode: 'prepare' })" size="xl">
        回到攤商首頁
      </UButton>
    </div>
    <template v-else-if="data">
      <header class="space-y-3">
        <h1 class="text-3xl font-black leading-tight sm:text-4xl">
          訪視申請狀態
        </h1>
        <VendorVenueHeader :name="data.venue.name" :market="data.venue.market" />
        <p class="text-xl">
          申請編號
          <strong class="ml-2 rounded-xl bg-white px-4 py-1 text-4xl font-black tracking-widest">{{ data.ref }}</strong>
        </p>
      </header>

      <div class="flex flex-wrap items-center gap-3 rounded-3xl border-2 border-dashed border-[var(--sb-simulated)] bg-[var(--sb-simulated-bg)] p-5">
        <SimTag class="!px-4 !py-1 !text-lg">
          模擬 simulated
        </SimTag>
        <p class="text-xl font-black">
          模擬:申請不會送到衛生局
        </p>
      </div>

      <ol class="space-y-3" aria-live="polite">
        <li
          v-for="(s, i) in VISIT_STAGES"
          :key="s.key"
          class="flex items-start gap-4 rounded-2xl border-2 p-4"
          :class="i === stageIndex ? 'border-[var(--sb-moss)] bg-white' : i < stageIndex ? 'border-[var(--sb-sage)] bg-white' : 'border-dashed border-[var(--sb-sage)] opacity-70'"
        >
          <span
            class="grid size-12 shrink-0 place-items-center rounded-full border-2"
            :class="i <= stageIndex ? 'border-[var(--sb-moss)] bg-[var(--sb-moss)] text-white' : 'border-[var(--sb-ink-soft)]'"
          >
            <UIcon :name="i < stageIndex ? 'i-lucide-check' : s.icon" class="size-6" />
          </span>
          <div>
            <p class="text-2xl font-black">
              {{ s.title }}
              <span v-if="i === stageIndex" class="ml-2 text-base font-bold text-[var(--sb-moss)]">目前在這裡</span>
              <span v-else-if="i > stageIndex" class="ml-2 text-base font-normal text-[var(--sb-ink-soft)]">等一下</span>
            </p>
            <p v-if="i <= stageIndex" class="text-lg text-[var(--sb-ink-soft)]">
              {{ s.text }}
            </p>
          </div>
        </li>
      </ol>

      <div class="flex flex-wrap gap-3">
        <UButton :to="to('/vendor/preview', { venue: data.venue.id })" size="xl" trailing-icon="i-lucide-arrow-right">
          下一步:看食客會看到的樣子
        </UButton>
        <UButton :to="to('/vendor/visit', { venue: data.venue.id })" size="xl" color="neutral" variant="outline">
          回到預約
        </UButton>
      </div>
    </template>
  </div>
</template>
