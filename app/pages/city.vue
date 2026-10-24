<script setup lang="ts">
import type { BadgeKey } from '~~/shared/badges'
import { BADGE_KEYS } from '~~/shared/badges'
import { monthOf } from '~~/shared/rules'

interface Report {
  month: string
  months: string[]
  total: number
  simulatedIncluded: boolean
  perBadge: Record<BadgeKey, number>
  groups: { group: string, kind: 'stall' | 'restaurant', total: number, simulated: boolean }[]
}
interface VisitItem { ref: string, venueName: string, group: string, madeUp: boolean, createdAt: number, status: 'received' | 'scheduled' | 'assessed', statusZh: string }

const { me, logout } = useAuth()
const month = ref(monthOf())
const loginUrl = '/login?role=city&next=/city'

const { data: report, error } = await useFetch<Report>('/api/city/report', { query: { month }, watch: [month] })
const { data: visits, refresh: refreshVisits } = await useFetch<{ items: VisitItem[] }>('/api/city/visit-requests')

if (error.value?.statusCode === 401)
  await navigateTo(loginUrl)
watch(error, (e) => {
  if (e?.statusCode === 401)
    navigateTo(loginUrl)
})

// Visit status is derived from age, so poll gently to let it move on during a demo.
if (import.meta.client)
  useIntervalFn(() => refreshVisits(), 5000)

const monthItems = computed(() => (report.value?.months ?? [month.value]).map(m => ({ value: m, label: `${m.slice(0, 4)} 年 ${Number(m.slice(5))} 月` })))
const stallGroups = computed(() => report.value?.groups.filter(g => g.kind === 'stall') ?? [])
const restaurantGroups = computed(() => report.value?.groups.filter(g => g.kind === 'restaurant') ?? [])

const STATUS_ICON = { received: 'i-lucide-inbox', scheduled: 'i-lucide-calendar-check', assessed: 'i-lucide-clipboard-check' } as const
const timeFmt = new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
const when = (sec: number) => timeFmt.format(sec * 1000)

async function signOut() {
  await logout()
  await navigateTo('/login?role=city')
}

useHead({ title: '市府示範檢視 · 安心標章' })
</script>

<template>
  <div v-if="report" class="space-y-6">
    <div class="flex items-start gap-3 rounded-2xl border-2 border-[var(--sb-simulated)] bg-[var(--sb-simulated-bg)] p-4 text-lg font-bold text-[var(--sb-simulated)]" role="note">
      <UIcon name="i-lucide-eye" class="mt-1 size-6 shrink-0" />
      <p>示範:衛生局端會看到的畫面,唯讀</p>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-4xl font-black">
        每月徽章報表
      </h1>
      <div class="flex items-center gap-3">
        <USelect v-model="month" :items="monthItems" size="xl" class="w-48" aria-label="選擇月份" />
        <UButton v-if="me" size="xl" color="neutral" variant="outline" icon="i-lucide-log-out" @click="signOut">
          登出
        </UButton>
      </div>
    </div>

    <section class="sb-card-white space-y-2 p-6 text-center">
      <p class="text-xl text-[var(--sb-ink-soft)]">
        {{ month.slice(0, 4) }} 年 {{ Number(month.slice(5)) }} 月,臺北市民共送出
      </p>
      <p class="text-7xl font-black text-[var(--sb-moss)]">
        {{ report.total }}<span class="ml-2 text-3xl">個徽章</span>
      </p>
      <p v-if="report.total === 0" class="text-lg text-[var(--sb-ink-soft)]">
        這個月的徽章還在路上。
      </p>
      <SimTag v-if="report.simulatedIncluded">
        含模擬票
      </SimTag>
    </section>

    <section class="sb-card-white space-y-4 p-6">
      <h2 class="text-3xl font-black">
        四種徽章
      </h2>
      <div class="grid gap-5 sm:grid-cols-2">
        <BadgeMark v-for="k in BADGE_KEYS" :key="k" :badge="k" :count="report.perBadge[k]" />
      </div>
    </section>

    <section class="sb-card-white space-y-4 p-6">
      <h2 class="flex flex-wrap items-center gap-2 text-3xl font-black">
        各夜市與行政區
        <SimTag v-if="report.simulatedIncluded">
          含模擬票
        </SimTag>
      </h2>
      <p class="text-base text-[var(--sb-ink-soft)]">
        只呈現各市場或行政區的合計,依固定名單順序排列,不比較攤位。
      </p>
      <div v-if="stallGroups.length">
        <h3 class="mb-2 text-xl font-bold">
          夜市
        </h3>
        <ul class="grid gap-3 sm:grid-cols-2">
          <li v-for="g in stallGroups" :key="g.group" class="flex items-center justify-between rounded-2xl bg-[var(--sb-sage)] px-4 py-3 text-xl">
            <span class="font-bold">{{ g.group }}<span v-if="!g.group.endsWith('夜市')" class="text-base font-normal">夜市</span></span>
            <span class="text-2xl font-black">{{ g.total }}</span>
          </li>
        </ul>
      </div>
      <div v-if="restaurantGroups.length">
        <h3 class="mb-2 text-xl font-bold">
          餐廳(依行政區)
        </h3>
        <ul class="grid gap-3 sm:grid-cols-2">
          <li v-for="g in restaurantGroups" :key="g.group" class="flex items-center justify-between rounded-2xl bg-[var(--sb-sage)] px-4 py-3 text-xl">
            <span class="font-bold">{{ g.group }}</span>
            <span class="text-2xl font-black">{{ g.total }}</span>
          </li>
        </ul>
      </div>
      <p v-if="!report.groups.length" class="text-lg text-[var(--sb-ink-soft)]">
        這個月還沒有收到徽章。
      </p>
    </section>

    <section class="sb-card-white space-y-4 p-6">
      <h2 class="flex flex-wrap items-center gap-2 text-3xl font-black">
        輔導訪視申請
        <SimTag>狀態為模擬</SimTag>
      </h2>
      <p class="text-base text-[var(--sb-ink-soft)]">
        攤商送出的申請會存起來;申請不會真的送到衛生局,處理狀態由時間推算,僅為示範。
      </p>
      <ul v-if="visits?.items.length" class="space-y-3">
        <li v-for="v in visits.items" :key="v.ref" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--sb-sage)] px-4 py-3">
          <div>
            <p class="text-xl font-bold">
              {{ v.venueName }}<SimTag v-if="v.madeUp" class="ml-2">
                虛構店家
              </SimTag>
            </p>
            <p class="text-base text-[var(--sb-ink-soft)]">
              {{ v.group }} · 編號 {{ v.ref }} · {{ when(v.createdAt) }}
            </p>
          </div>
          <span class="inline-flex items-center gap-2 rounded-full border-2 border-[var(--sb-ink)] px-3 py-1 text-lg font-bold">
            <UIcon :name="STATUS_ICON[v.status]" class="size-5" />{{ v.statusZh }}
          </span>
        </li>
      </ul>
      <p v-else class="text-lg text-[var(--sb-ink-soft)]">
        目前還沒有申請。攤商在「我是攤商」送出後,會出現在這裡。
      </p>
    </section>
  </div>
  <div v-else class="py-20 text-center text-xl">
    <p>請先登入市府示範帳號。</p>
    <UButton :to="loginUrl" size="xl" class="mt-4">
      前往登入
    </UButton>
  </div>
</template>
