<script setup lang="ts">
import type { VendorStallView } from '~~/shared/readiness'
import { BADGES } from '~~/shared/badges'

useHead({ title: '攤位檢視 · 安心標章' })

const route = useRoute()
const to = useEmbedTo()
const embed = useEmbed()
const id = computed(() => String(route.params.id))
const { data, error, refresh } = await useFetch<VendorStallView>(() => `/api/vendor/stalls/${id.value}`, { key: 'vendor-stall', watch: [id] })

// In a demo pane, a badge awarded in the diner pane shows up here by itself.
useIntervalFn(() => {
  if (embed.value)
    refresh()
}, 3000)

const monthBadges = computed(() => BADGES.filter(b => data.value?.monthCounts[b.key]))
const years = computed(() => data.value?.venue.years.map(y => `${y} 年`).join('、') ?? '')
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <UButton :to="to('/vendor', { mode: 'find' })" variant="link" color="neutral" size="xl" icon="i-lucide-arrow-left">
      找別的攤位
    </UButton>

    <div v-if="error || !data" class="sb-card space-y-3 p-6">
      <p class="text-2xl font-black">
        找不到這個攤位
      </p>
      <UButton :to="to('/vendor', { mode: 'find' })" size="xl">
        回去搜尋
      </UButton>
    </div>

    <template v-else>
      <!-- Label ended: how to renew -->
      <section v-if="data.venue.lapsed" class="space-y-4 rounded-3xl bg-[var(--sb-sage)] p-6">
        <h2 class="flex items-center gap-3 text-3xl font-black">
          <UIcon name="i-lucide-history" class="size-8" /> 標章已結束,這裡是重新申請的方法
        </h2>
        <ol class="space-y-2 text-xl">
          <li class="flex items-center gap-3">
            <span class="grid size-9 place-items-center rounded-full bg-[var(--sb-moss)] font-bold text-white">1</span> 檢查:看看哪些項目已準備好
          </li>
          <li class="flex items-center gap-3">
            <span class="grid size-9 place-items-center rounded-full bg-[var(--sb-moss)] font-bold text-white">2</span> 登記:完成食品業者和食材兩個登錄
          </li>
          <li class="flex items-center gap-3">
            <span class="grid size-9 place-items-center rounded-full bg-[var(--sb-moss)] font-bold text-white">3</span> 預約訪視:請輔導人員來看看
          </li>
        </ol>
        <p class="text-lg text-[var(--sb-ink-soft)]">
          用一個練習攤位把三步走一遍。重新取得標章後,才會再收到新的徽章。
        </p>
        <UButton :to="to('/vendor', { mode: 'prepare' })" size="xl" trailing-icon="i-lucide-arrow-right">
          開始準備
        </UButton>
      </section>

      <!-- This month: shown only when there is something to celebrate -->
      <section v-else-if="data.monthTotal > 0" class="space-y-4 rounded-3xl bg-[var(--sb-moss)] p-6 text-white">
        <p class="text-2xl font-bold">
          本月新收到
        </p>
        <p class="text-6xl font-black leading-none sm:text-7xl" aria-live="polite">
          {{ data.monthTotal }} <span class="text-3xl sm:text-4xl">個徽章</span>
        </p>
        <div class="flex flex-wrap gap-3">
          <span v-for="b in monthBadges" :key="b.key" class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-lg font-bold text-[var(--sb-ink)]">
            <BadgeMark :badge="b.key" size="sm" :label="false" /> {{ b.zh }} {{ data.monthCounts[b.key] }}
          </span>
        </div>
        <p v-if="data.venue.simulatedVotes" class="flex items-center gap-2 text-base">
          <SimTag>含模擬票</SimTag> 其中有些是種子資料
        </p>
      </section>

      <StallView :venue="data.venue">
        <template #actions>
          <ShareButton :title="data.venue.name" text="一起來看這個攤位" :path="data.sharePath" />
        </template>
        <section v-if="data.venue.years.length" class="text-xl">
          <p>
            <span class="font-bold">認證年度:</span>{{ years }}
            <span v-if="data.venue.years.length > 1" class="ml-1 text-[var(--sb-ink-soft)]">(已連續 {{ data.venue.years.length }} 輪)</span>
          </p>
        </section>
        <section v-if="data.feed.length" class="space-y-2">
          <h2 class="text-lg font-bold">
            攤位新鮮事
          </h2>
          <ul class="space-y-2">
            <li v-for="f in data.feed" :key="f.id" class="flex items-start gap-2 rounded-xl bg-[var(--sb-sage)] p-3 text-lg">
              <UIcon :name="f.kind === 'milestone' ? 'i-lucide-trophy' : f.kind === 'streak' ? 'i-lucide-flame' : 'i-lucide-sparkles'" class="mt-1 size-5 shrink-0" />
              <span>{{ f.text }} <SimTag v-if="f.simulated">模擬</SimTag></span>
            </li>
          </ul>
        </section>
      </StallView>

      <p class="text-lg text-[var(--sb-ink-soft)]">
        這是唯讀頁面:不能修改,也不能認領攤位。
      </p>
    </template>
  </div>
</template>
