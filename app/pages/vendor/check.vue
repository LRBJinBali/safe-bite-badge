<script setup lang="ts">
import { READINESS_GROUPS, READINESS_ITEMS, READINESS_TOTAL } from '~~/shared/readiness'

definePageMeta({ middleware: 'vendor-auth', needsVenue: true })
useHead({ title: '檢查準備好了嗎 · 安心標章' })

const to = useEmbedTo()
const { venueId, data, error, done, isDone, toggle } = await useVendorChecklist('readiness')
const count = computed(() => done.value.length)
const complete = computed(() => count.value === READINESS_TOTAL)
const missing = computed(() => READINESS_TOTAL - count.value)
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <VendorStepBar :current="1" :venue-id="venueId" />

    <VendorLoadError v-if="error" />
    <template v-else-if="data">
      <header class="space-y-3">
        <h1 class="text-3xl font-black leading-tight sm:text-4xl">
          第 1 步:檢查準備好了嗎
        </h1>
        <VendorVenueHeader :name="data.venue.name" :market="data.venue.market" />
        <p class="text-xl text-[var(--sb-ink-soft)]">
          這份清單照衛生局「輔導及評核紀錄表」整理。做到的就點一下,會自動存起來。這裡不評分,只是幫你準備。
        </p>
      </header>

      <section class="sb-card space-y-3 p-5" aria-live="polite">
        <p class="text-2xl font-black">
          <template v-if="count">
            已完成 {{ count }} / {{ READINESS_TOTAL }} 項
          </template>
          <template v-else>
            共 {{ READINESS_TOTAL }} 項,一項一項來
          </template>
        </p>
        <UProgress :model-value="count" :max="READINESS_TOTAL" size="xl" />
      </section>

      <section v-for="g in READINESS_GROUPS" :key="g.key" class="space-y-3">
        <div>
          <h2 class="text-2xl font-black">
            {{ g.title }}
          </h2>
          <p class="text-lg text-[var(--sb-ink-soft)]">
            {{ g.blurb }}
          </p>
        </div>
        <VendorCheckRow
          v-for="it in READINESS_ITEMS.filter(i => i.group === g.key)"
          :key="it.key"
          :no="it.no"
          :title="it.title"
          :hint="it.hint"
          :checked="isDone(it.key)"
          @toggle="toggle(it.key)"
        >
          <UButton v-if="it.key === 'i10-platforms'" :to="to('/vendor/register', { venue: venueId })" variant="link" size="lg" icon="i-lucide-arrow-right" trailing>
            看登記教學
          </UButton>
        </VendorCheckRow>
      </section>

      <section
        class="space-y-4 rounded-3xl p-6"
        :class="complete ? 'bg-[var(--sb-moss)] text-white' : 'sb-card'"
      >
        <template v-if="complete">
          <h2 class="flex items-center gap-3 text-3xl font-black">
            <UIcon name="i-lucide-party-popper" class="size-9" /> 可以申請輔導訪視了
          </h2>
          <p class="text-xl">
            16 項都準備好了。下一步:先把兩個登錄平台完成,再預約訪視。
          </p>
        </template>
        <template v-else>
          <h2 class="text-2xl font-black">
            還有 {{ missing }} 項,慢慢來
          </h2>
          <p class="text-xl text-[var(--sb-ink-soft)]">
            沒做完也可以先看下一步。輔導人員到場時,會陪你把剩下的補齊。
          </p>
        </template>
        <UButton :to="to('/vendor/register', { venue: venueId })" size="xl" :color="complete ? 'neutral' : 'primary'" trailing-icon="i-lucide-arrow-right">
          下一步:登記
        </UButton>
      </section>
    </template>
  </div>
</template>
