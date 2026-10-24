<script setup lang="ts">
import type { VendorVenue } from '~~/shared/readiness'
import type { Venue } from '~~/shared/types'
import { READINESS_TOTAL, VENUE_MARKETS, VENUE_NAME_MAX } from '~~/shared/readiness'

useHead({ title: '攤商 · 安心標章' })

const route = useRoute()
const to = useEmbedTo()
const toast = useToast()
const requestFetch = useRequestFetch()

const marketLabel = (m: string) => m.endsWith('夜市') ? m : `${m}夜市`
const whereLabel = (v: Venue) => v.kind === 'restaurant' ? `餐廳 · ${v.group}` : marketLabel(v.group)

const mode = ref<'find' | 'prepare' | null>(route.query.mode === 'prepare' ? 'prepare' : route.query.mode === 'find' ? 'find' : null)

// Sign-in state and my practice venues in one go (cookies are forwarded on the server).
const { data: home, refresh } = await useAsyncData('vendor-home', async () => {
  const me = await requestFetch<{ role: string, email: string } | null>('/api/auth/me').catch(() => null)
  const venues = me?.role === 'vendor' ? await requestFetch<VendorVenue[]>('/api/vendor/venues').catch(() => []) : []
  return { me: me?.role === 'vendor' ? me : null, venues }
})
const me = computed(() => home.value?.me ?? null)
const venues = computed(() => home.value?.venues ?? [])

// --- Find my stall ---
const q = ref('')
const results = ref<Venue[]>([])
const searched = ref(false)
let seq = 0
watchDebounced(q, async (text) => {
  const mine = ++seq
  const t = text.trim()
  if (!t) {
    results.value = []
    searched.value = false
    return
  }
  const r = await $fetch<Venue[]>('/api/vendor/stalls', { query: { q: t } }).catch(() => [])
  if (mine === seq) {
    results.value = r
    searched.value = true
  }
}, { debounce: 250 })

// --- Prepare ---
const name = ref('')
const market = ref<(typeof VENUE_MARKETS)[number]>(VENUE_MARKETS[0])
const showForm = ref(false)
const busy = ref(false)
const formOpen = computed(() => showForm.value || !venues.value.length)
async function create() {
  busy.value = true
  try {
    const v = await $fetch<VendorVenue>('/api/vendor/venues', { method: 'POST', body: { name: name.value, market: market.value } })
    await navigateTo(to('/vendor/check', { venue: v.id }))
  }
  catch (e) {
    toast.add({ title: vendorError(e), color: 'error' })
  }
  finally { busy.value = false }
}
async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  clearNuxtData('auth-me')
  await refresh()
}
const signInTo = computed(() => ({ path: '/login', query: { role: 'vendor', next: route.query.embed === '1' ? '/vendor?mode=prepare&embed=1' : '/vendor?mode=prepare' } }))
const nameLeft = computed(() => VENUE_NAME_MAX - name.value.length)
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-black leading-tight sm:text-4xl">
        我經營小吃攤
      </h1>
      <p class="text-xl text-[var(--sb-ink-soft)]">
        請選一個:
      </p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        class="sb-card-white flex flex-col items-start gap-3 border-4 p-6 text-left transition"
        :class="mode === 'find' ? 'border-[var(--sb-moss)]' : 'border-transparent hover:border-[var(--sb-sage)]'"
        :aria-pressed="mode === 'find'"
        @click="mode = 'find'"
      >
        <UIcon name="i-lucide-badge-check" class="size-10 text-[var(--sb-moss)]" />
        <span class="text-2xl font-black leading-snug">我的攤位或餐廳已通過認證,查看</span>
        <span class="text-lg text-[var(--sb-ink-soft)]">找到自己的店,看朋友送來的徽章。</span>
      </button>
      <button
        type="button"
        class="sb-card-white flex flex-col items-start gap-3 border-4 p-6 text-left transition"
        :class="mode === 'prepare' ? 'border-[var(--sb-moss)]' : 'border-transparent hover:border-[var(--sb-sage)]'"
        :aria-pressed="mode === 'prepare'"
        @click="mode = 'prepare'"
      >
        <UIcon name="i-lucide-clipboard-list" class="size-10 text-[var(--sb-moss)]" />
        <span class="text-2xl font-black leading-snug">我想申請/準備認證</span>
        <span class="text-lg text-[var(--sb-ink-soft)]">檢查、登記、預約訪視,一步一步來。</span>
      </button>
    </div>

    <!-- Find my stall -->
    <section v-if="mode === 'find'" class="sb-card space-y-4 p-6">
      <h2 class="text-2xl font-black">
        找到我的店
      </h2>
      <UInput v-model="q" size="xl" class="w-full" icon="i-lucide-search" placeholder="輸入店名、夜市或行政區,例如:士林、牛肉麵" aria-label="搜尋攤位" autofocus />
      <ul v-if="results.length" class="space-y-2">
        <li v-for="v in results" :key="v.id">
          <NuxtLink
            :to="to(`/vendor/stall/${v.id}`)"
            class="flex items-center justify-between gap-3 rounded-2xl border-2 border-transparent bg-white p-4 hover:border-[var(--sb-moss)]"
          >
            <span>
              <span class="block text-xl font-bold">{{ v.name }}</span>
              <span class="block text-lg text-[var(--sb-ink-soft)]">{{ whereLabel(v) }}<SimTag v-if="v.simulated" class="ml-2">虛構</SimTag></span>
            </span>
            <UIcon name="i-lucide-chevron-right" class="size-6 shrink-0" />
          </NuxtLink>
        </li>
      </ul>
      <p v-else-if="searched" class="text-xl">
        找不到。換個字再試試看,例如夜市名或行政區。
      </p>
      <p v-else class="text-lg text-[var(--sb-ink-soft)]">
        輸入幾個字,結果會直接出現。這裡只能查看,不能修改,也不能認領店家。
      </p>
    </section>

    <!-- Prepare -->
    <section v-if="mode === 'prepare'" class="sb-card space-y-5 p-6">
      <template v-if="!me">
        <h2 class="text-2xl font-black">
          先登入
        </h2>
        <p class="text-xl">
          登入後,你的進度會存起來,換手機也找得到。
        </p>
        <p class="flex flex-wrap items-center gap-2 text-lg text-[var(--sb-ink-soft)]">
          <SimTag>模擬登入</SimTag> 用虛構信箱,不會寄出任何信,驗證碼會直接顯示在畫面上。
        </p>
        <UButton :to="signInTo" size="xl" trailing-icon="i-lucide-arrow-right">
          登入(模擬)
        </UButton>
      </template>
      <template v-else>
        <div class="flex flex-wrap items-center justify-between gap-2 text-lg text-[var(--sb-ink-soft)]">
          <span>已登入:{{ me.email }} <SimTag>模擬</SimTag></span>
          <UButton variant="link" color="neutral" size="lg" @click="logout">
            登出
          </UButton>
        </div>

        <div v-if="venues.length" class="space-y-3">
          <h2 class="text-2xl font-black">
            我的練習攤位
          </h2>
          <div v-for="v in venues" :key="v.id" class="space-y-3 rounded-2xl bg-white p-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xl font-bold">{{ v.name }}</span>
              <span class="text-lg text-[var(--sb-ink-soft)]">{{ marketLabel(v.market) }}</span>
              <SimTag>虛構</SimTag>
            </div>
            <p v-if="v.readinessDone || v.registrationDone" class="text-lg text-[var(--sb-ink-soft)]">
              檢查 {{ v.readinessDone }} / {{ READINESS_TOTAL }} 項<template v-if="v.registrationDone">
                · 登記 {{ v.registrationDone }} / 6 步
              </template>
            </p>
            <div class="flex flex-wrap gap-2">
              <UButton :to="to('/vendor/check', { venue: v.id })" size="lg">
                {{ v.readinessDone ? '繼續準備' : '開始準備' }}
              </UButton>
              <UButton v-if="v.latestVisitRef" :to="to(`/vendor/visit/${v.latestVisitRef}`)" size="lg" color="neutral" variant="outline">
                看訪視狀態
              </UButton>
              <UButton :to="to('/vendor/preview', { venue: v.id })" size="lg" color="neutral" variant="outline">
                預覽
              </UButton>
            </div>
          </div>
        </div>

        <UButton v-if="venues.length && !formOpen" size="xl" color="neutral" variant="outline" icon="i-lucide-plus" @click="showForm = true">
          新增另一個練習攤位
        </UButton>

        <form v-if="formOpen" class="space-y-4" @submit.prevent="create">
          <h2 class="text-2xl font-black">
            建立一個練習攤位
          </h2>
          <p class="flex flex-wrap items-center gap-2 text-lg text-[var(--sb-ink-soft)]">
            <SimTag>虛構</SimTag> 請取一個編出來的名字,不要填真實店名、電話或地址。
          </p>
          <label class="block space-y-1">
            <span class="text-xl font-bold">攤名(最多 {{ VENUE_NAME_MAX }} 個字)</span>
            <UInput v-model="name" size="xl" class="w-full" :maxlength="VENUE_NAME_MAX" placeholder="例如:練習小吃攤" />
            <span v-if="name && nameLeft <= 5" class="block text-base text-[var(--sb-ink-soft)]">還可以輸入 {{ nameLeft }} 個字</span>
          </label>
          <label class="block space-y-1">
            <span class="text-xl font-bold">在哪個夜市</span>
            <USelect v-model="market" size="xl" class="w-full" :items="[...VENUE_MARKETS]" />
          </label>
          <UButton type="submit" size="xl" :loading="busy" :disabled="!name.trim()" trailing-icon="i-lucide-arrow-right">
            建立並開始檢查
          </UButton>
        </form>
      </template>
    </section>
  </div>
</template>
