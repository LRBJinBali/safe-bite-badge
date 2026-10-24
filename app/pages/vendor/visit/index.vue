<script setup lang="ts">
import type { ProgressResponse } from '~~/shared/readiness'
import { READINESS_TOTAL, REGISTRATION_TOTAL } from '~~/shared/readiness'
import { visitStatusZh } from '~/utils/vendor'

definePageMeta({ middleware: 'vendor-auth', needsVenue: true })
useHead({ title: '預約輔導訪視 · 安心標章' })

const to = useEmbedTo()
const venueId = useVendorVenueId()
const toast = useToast()

const { data: ready, error } = await useFetch<ProgressResponse>(() => `/api/vendor/venues/${venueId.value}/readiness`, { key: 'visit-readiness', watch: [venueId] })
const { data: reg } = await useFetch<ProgressResponse>(() => `/api/vendor/venues/${venueId.value}/registration`, { key: 'visit-registration', watch: [venueId] })
const { data: requests } = await useFetch<{ ref: string, createdAt: number, status: 'received' | 'scheduled' | 'assessed' }[]>(() => `/api/vendor/venues/${venueId.value}/visit-requests`, { key: 'visit-requests', watch: [venueId], default: () => [] })

const busy = ref(false)
async function send() {
  busy.value = true
  try {
    const r = await $fetch<{ ref: string }>(`/api/vendor/venues/${venueId.value}/visit-requests`, { method: 'POST' })
    await navigateTo(to(`/vendor/visit/${r.ref}`))
  }
  catch (e) {
    toast.add({ title: vendorError(e), color: 'error' })
  }
  finally { busy.value = false }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <VendorStepBar :current="3" :venue-id="venueId" />

    <VendorLoadError v-if="error" />
    <template v-else-if="ready">
      <header class="space-y-3">
        <h1 class="text-3xl font-black leading-tight sm:text-4xl">
          第 3 步:預約輔導訪視
        </h1>
        <VendorVenueHeader :name="ready.venue.name" :market="ready.venue.market" />
        <p class="text-xl text-[var(--sb-ink-soft)]">
          輔導人員會到攤位陪你檢查、給建議。按下按鈕就會留下申請,並拿到一組編號。
        </p>
      </header>

      <section class="sb-card space-y-2 p-5 text-xl">
        <p class="font-black">
          你目前的準備狀況
        </p>
        <p v-if="ready.done.length" class="flex items-center gap-2">
          <UIcon name="i-lucide-list-checks" class="size-6" /> 檢查清單:{{ ready.done.length }} / {{ READINESS_TOTAL }} 項
        </p>
        <p v-if="reg?.done.length" class="flex items-center gap-2">
          <UIcon name="i-lucide-file-pen-line" class="size-6" /> 登記步驟:{{ reg.done.length }} / {{ REGISTRATION_TOTAL }} 步
        </p>
        <p v-if="!ready.done.length && !reg?.done.length" class="text-[var(--sb-ink-soft)]">
          還沒開始也可以先預約,輔導人員會帶你一項一項做。
        </p>
      </section>

      <section class="space-y-4 rounded-3xl border-2 border-dashed border-[var(--sb-simulated)] bg-[var(--sb-simulated-bg)] p-6">
        <div class="flex flex-wrap items-center gap-3">
          <SimTag class="!px-4 !py-1 !text-lg">
            模擬 simulated
          </SimTag>
          <p class="text-xl font-black">
            模擬:申請不會送到衛生局
          </p>
        </div>
        <p class="text-lg">
          這是示範。申請只會存在這個 app 裡,沒有人會收到,狀態變化也是模擬的。
        </p>
        <UButton size="xl" :loading="busy" icon="i-lucide-send" @click="send">
          送出訪視申請(模擬)
        </UButton>
      </section>

      <section v-if="requests.length" class="space-y-3">
        <h2 class="text-2xl font-black">
          已送出的申請
        </h2>
        <NuxtLink
          v-for="r in requests"
          :key="r.ref"
          :to="to(`/vendor/visit/${r.ref}`)"
          class="flex items-center justify-between gap-3 rounded-2xl border-2 border-[var(--sb-sage)] bg-white p-4 text-xl font-bold hover:border-[var(--sb-moss)]"
        >
          <span>{{ r.ref }}</span>
          <span class="flex items-center gap-2">{{ visitStatusZh(r.status) }}<SimTag>模擬</SimTag><UIcon name="i-lucide-chevron-right" class="size-5" /></span>
        </NuxtLink>
      </section>

      <div class="flex flex-wrap gap-3">
        <UButton :to="to('/vendor/register', { venue: venueId })" size="xl" color="neutral" variant="outline" icon="i-lucide-arrow-left">
          回到登記
        </UButton>
        <UButton :to="to('/vendor/preview', { venue: venueId })" size="xl" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-right">
          下一步:預覽
        </UButton>
      </div>
    </template>
  </div>
</template>
