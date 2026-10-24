<script setup lang="ts">
import { REGISTRATION_PLATFORMS, REGISTRATION_STEPS, REGISTRATION_TOTAL } from '~~/shared/readiness'

definePageMeta({ middleware: 'vendor-auth', needsVenue: true })
useHead({ title: '登記教學 · 安心標章' })

const to = useEmbedTo()
const { venueId, data, error, done, isDone, toggle } = await useVendorChecklist('registration')
const count = computed(() => done.value.length)
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <VendorStepBar :current="2" :venue-id="venueId" />

    <VendorLoadError v-if="error" />
    <template v-else-if="data">
      <header class="space-y-3">
        <h1 class="text-3xl font-black leading-tight sm:text-4xl">
          第 2 步:完成兩個登記
        </h1>
        <VendorVenueHeader :name="data.venue.name" :market="data.venue.market" />
        <p class="text-xl text-[var(--sb-ink-soft)]">
          很多攤商卡在這裡,一步一步來就不難。做完一步就點一下,會自動存起來。
        </p>
        <p class="text-lg text-[var(--sb-ink-soft)]">
          資料請只填在官方網站上,這個 app 不收登錄字號或任何真實資料。
        </p>
      </header>

      <section class="sb-card space-y-3 p-5" aria-live="polite">
        <p class="text-2xl font-black">
          <template v-if="count">
            已完成 {{ count }} / {{ REGISTRATION_TOTAL }} 步
          </template>
          <template v-else>
            共 {{ REGISTRATION_TOTAL }} 步
          </template>
        </p>
        <UProgress :model-value="count" :max="REGISTRATION_TOTAL" size="xl" />
      </section>

      <section v-for="p in REGISTRATION_PLATFORMS" :key="p.key" class="space-y-3">
        <div>
          <h2 class="text-2xl font-black">
            {{ p.title }}
          </h2>
          <p class="text-lg text-[var(--sb-ink-soft)]">
            {{ p.blurb }}
          </p>
        </div>
        <VendorCheckRow
          v-for="s in REGISTRATION_STEPS.filter(x => x.platform === p.key)"
          :key="s.key"
          :no="s.no"
          :title="s.title"
          :hint="s.hint"
          :checked="isDone(s.key)"
          @toggle="toggle(s.key)"
        >
          <UButton v-if="s.href" :to="s.href" target="_blank" rel="noopener" size="lg" color="neutral" variant="outline" trailing-icon="i-lucide-external-link">
            {{ s.linkLabel }}
          </UButton>
        </VendorCheckRow>
      </section>

      <div class="flex flex-wrap gap-3">
        <UButton :to="to('/vendor/check', { venue: venueId })" size="xl" color="neutral" variant="outline" icon="i-lucide-arrow-left">
          回到檢查
        </UButton>
        <UButton :to="to('/vendor/visit', { venue: venueId })" size="xl" trailing-icon="i-lucide-arrow-right">
          下一步:預約訪視
        </UButton>
      </div>
    </template>
  </div>
</template>
