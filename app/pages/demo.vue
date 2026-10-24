<script setup lang="ts">
import type { BadgeKey } from '~~/shared/badges'
import { BADGE_KEYS } from '~~/shared/badges'

definePageMeta({ layout: false })
useHead({ title: '示範模式 Demo · 安心標章' })

type Side = 'left' | 'right'

interface Step {
  zh: string
  en: string
  sub: string
  /** Left phone (diner) */
  left: string
  /** Right phone (vendor) */
  right: string
  /** Only when this browser is already signed in with that role does the right phone open `url` (a sign-in cannot happen inside the pane). Otherwise it keeps `right`, or shows a static sign-in card when `card` is set. */
  signedIn?: { role: 'vendor' | 'city', url: string, card?: boolean }
  /** Which phone a small screen shows */
  focus: Side
  /** Parent sends badges to the demo stall by itself */
  autoAward?: boolean
  /** Seconds before auto-play moves on */
  secs: number
}

const DEMO_STALL = 'DEMO-001'
const MARKET = encodeURIComponent('示範夜市')

// THE SCRIPT: edit captions, URLs and timing here.
const STEPS: Step[] = [
  {
    zh: '這是什麼?',
    en: 'What is this?',
    sub: '幫夜市攤位送上四種社區徽章,只慶祝、不批評。非官方,依衛生局公開名單製作。',
    left: '/diner?embed=1',
    right: '/vendor?embed=1',
    focus: 'left',
    secs: 11,
  },
  {
    zh: '食客看地圖,挑一個夜市',
    en: 'Diners browse the map and pick a night market',
    sub: '沒有排名、沒有比較,只是找一個想去的地方。(示範夜市為虛構)',
    left: `/diner?embed=1&kind=stall&group=${MARKET}`,
    right: '/vendor?embed=1',
    focus: 'left',
    secs: 9,
  },
  {
    zh: '打開一個攤位',
    en: 'Open a stall',
    sub: '左邊是食客看到的攤位,右邊是攤商看到的同一個攤位。',
    left: `/stall/${DEMO_STALL}?embed=1`,
    right: `/vendor/stall/${DEMO_STALL}?embed=1`,
    focus: 'left',
    secs: 9,
  },
  {
    zh: '送出徽章,兩邊同時看到',
    en: 'Send badges: both sides update',
    sub: '看左邊的數字變多,右邊的「本月新收到」也跟著變。',
    left: `/stall/${DEMO_STALL}?embed=1`,
    right: `/vendor/stall/${DEMO_STALL}?embed=1`,
    focus: 'left',
    autoAward: true,
    secs: 12,
  },
  {
    zh: '攤商端:從檢查到預約訪視',
    en: 'Vendors: from readiness check to a visit request',
    sub: '先檢查準備度、了解登記,再預約衛生局訪視。(訪視轉送與狀態為模擬)',
    left: `/stall/${DEMO_STALL}?embed=1`,
    right: '/vendor?embed=1',
    signedIn: { role: 'vendor', url: '/vendor/check?embed=1' },
    focus: 'right',
    secs: 11,
  },
  {
    zh: '標章結束,不是失敗',
    en: 'A ended label is not a failure',
    sub: '只寫「標章已結束」,不再收新徽章,並告訴攤商怎麼重新申請。',
    left: '/stall/DEMO-LAPSED-001?embed=1',
    right: '/vendor/stall/DEMO-LAPSED-001?embed=1',
    focus: 'left',
    secs: 10,
  },
  {
    zh: '市政端看總覽',
    en: 'The city sees the big picture',
    sub: '市政人員登入後,看全市的總覽(模擬登入,信箱為虛構)。',
    left: '/diner?embed=1',
    right: '/vendor?embed=1',
    signedIn: { role: 'city', url: '/city?embed=1', card: true },
    focus: 'right',
    secs: 10,
  },
]

const route = useRoute()
const { setDemo } = useDemo()

const ready = ref(false)
const step = ref(0)
const playing = ref(false)
const reloadKey = ref(0)
const tab = ref<Side>('left')
const leftSrc = ref('')
const rightSrc = ref('')
const showCityCard = ref(false)
const resetting = ref(false)
const resetNote = ref('')
const leftFrame = ref<HTMLIFrameElement | null>(null)
const rightFrame = ref<HTMLIFrameElement | null>(null)
const toast = ref<{ id: number, n: number, badges: BadgeKey[] } | null>(null)
const toastError = ref(false)

const current = computed(() => STEPS[step.value]!)
const isLast = computed(() => step.value === STEPS.length - 1)

let timer: ReturnType<typeof setTimeout> | undefined
let awardTimer: ReturnType<typeof setTimeout> | undefined
let toastTimer: ReturnType<typeof setTimeout> | undefined
let stepToken = 0

function refreshPanes() {
  for (const f of [leftFrame.value, rightFrame.value]) {
    try {
      f?.contentWindow?.postMessage({ type: 'refresh' }, location.origin)
    }
    catch {}
  }
}

async function award() {
  const n = [2, 3, 3, 4][Math.floor(Math.random() * 4)]!
  const badges = [...BADGE_KEYS].sort(() => Math.random() - 0.5).slice(0, n)
  try {
    await $fetch(`/api/stalls/${DEMO_STALL}/awards`, { method: 'POST', body: { badges } })
    toastError.value = false
    toast.value = { id: Date.now(), n, badges }
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast.value = null), 3600)
    refreshPanes()
    setTimeout(refreshPanes, 1500)
  }
  catch {
    toastError.value = true
  }
}

async function go(i: number) {
  const target = Math.min(Math.max(i, 0), STEPS.length - 1)
  const s = STEPS[target]!
  const token = ++stepToken
  step.value = target
  clearTimeout(awardTimer)
  toast.value = null
  toastError.value = false
  tab.value = s.focus
  if (leftSrc.value !== s.left)
    leftSrc.value = s.left
  const si = s.signedIn
  const me = si ? await $fetch<{ role: string } | null>('/api/auth/me').catch(() => null) : null
  if (token !== stepToken)
    return
  const ok = !!si && me?.role === si.role
  showCityCard.value = !!si?.card && !ok
  const right = ok ? si!.url : s.right
  if (rightSrc.value !== right)
    rightSrc.value = right
  if (s.autoAward)
    awardTimer = setTimeout(award, 1800)
}

const next = () => go(step.value + 1)
const prev = () => go(step.value - 1)

function togglePlay() {
  if (!playing.value && isLast.value)
    go(0)
  playing.value = !playing.value
}

// Auto-play: one timer per step.
watch([playing, step], () => {
  clearTimeout(timer)
  if (!playing.value)
    return
  timer = setTimeout(() => {
    if (isLast.value)
      playing.value = false
    else next()
  }, current.value.secs * 1000)
})

async function reset(restart = true) {
  resetting.value = true
  playing.value = false
  try {
    await $fetch('/api/demo/reset', { method: 'POST' })
    resetNote.value = '已重置示範攤位的資料。Demo data reset.'
  }
  catch {
    resetNote.value = '重置失敗,請再按一次。Reset failed, try again.'
  }
  resetting.value = false
  if (restart) {
    reloadKey.value++
    go(0)
  }
  setTimeout(() => (resetNote.value = ''), 5000)
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (!ready.value || e.metaKey || e.ctrlKey || e.altKey)
    return
  const t = e.target as HTMLElement | null
  if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))
    return
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    next()
  }
  else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prev()
  }
  else if (e.key === ' ') {
    e.preventDefault();
    (document.activeElement as HTMLElement | null)?.blur?.()
    togglePlay()
  }
})

onMounted(async () => {
  // The demo cookie must exist before the panes load, so they can see the made-up venues.
  await Promise.allSettled([
    setDemo(true),
    $fetch('/api/demo/seed', { method: 'POST' }),
    route.query.keep === '1' ? Promise.resolve() : $fetch('/api/demo/reset', { method: 'POST' }),
  ])
  ready.value = true
  go(0)
  if (route.query.autoplay === '1')
    setTimeout(() => (playing.value = true), 1200)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  clearTimeout(awardTimer)
  clearTimeout(toastTimer)
})
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-[var(--sb-bg)]">
    <header class="flex items-center justify-between gap-3 px-4 py-2 sm:px-6">
      <NuxtLink to="/" class="flex items-center gap-2 text-xl font-black text-[var(--sb-moss)]">
        <UIcon name="i-lucide-leaf" class="size-7" /> 安心標章
        <span class="hidden text-sm font-normal text-[var(--sb-ink-soft)] sm:inline">Safe-Bite Badge</span>
      </NuxtLink>
      <div class="flex items-center gap-2">
        <SimTag>示範模式 demo · 虛構攤位與模擬票</SimTag>
        <UButton to="/" color="neutral" variant="ghost" size="lg" icon="i-lucide-house">
          <span class="hidden sm:inline">首頁</span>
        </UButton>
      </div>
    </header>

    <!-- Caption: big, high contrast, readable from the back of the room -->
    <section class="relative mx-3 overflow-hidden bg-moss-800 text-white sm:mx-6" style="border-radius: 2rem 1rem 2rem 1rem" aria-live="polite">
      <div class="flex flex-col gap-2 px-6 py-5 sm:px-10 lg:py-6">
        <p class="flex items-center gap-3 text-lg font-bold text-moss-200">
          <span class="rounded-full bg-white px-3 py-0.5 text-base font-black text-moss-800">步驟 {{ step + 1 }} / {{ STEPS.length }}</span>
          Step {{ step + 1 }}
        </p>
        <h1 class="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
          {{ current.zh }}
        </h1>
        <p class="text-xl font-semibold text-moss-200">
          {{ current.en }}
        </p>
        <p class="max-w-4xl text-xl leading-snug lg:text-2xl">
          {{ current.sub }}
        </p>
      </div>

      <!-- floating "+N badges" -->
      <Transition name="pop">
        <div v-if="toast" :key="toast.id" class="absolute right-4 top-4 flex items-center gap-3 rounded-full bg-white px-5 py-3 text-moss-800 shadow-2xl sm:right-8 sm:top-6">
          <span class="text-4xl font-black sm:text-5xl">+{{ toast.n }}</span>
          <span class="text-xl font-black leading-tight">徽章<span class="block text-sm font-semibold">badges</span></span>
          <span class="flex gap-1">
            <BadgeMark v-for="b in toast.badges" :key="b" :badge="b" size="sm" :label="false" />
          </span>
        </div>
      </Transition>
      <p v-if="toastError" class="absolute right-4 top-4 rounded-full bg-[var(--sb-simulated-bg)] px-4 py-2 text-lg font-bold text-[var(--sb-simulated)]">
        送出失敗,按「再送一次」。 Failed, send again.
      </p>

      <div v-if="playing" :key="`${step}-bar`" class="bar absolute inset-x-0 bottom-0 h-1.5 bg-moss-300" :style="{ animationDuration: `${current.secs}s` }" />
    </section>

    <!-- Controls -->
    <section class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-4">
      <div class="flex items-center gap-2" role="tablist" aria-label="步驟 Steps">
        <button
          v-for="(s, i) in STEPS"
          :key="s.zh"
          type="button"
          :aria-label="`步驟 ${i + 1}: ${s.zh}`"
          :aria-current="i === step"
          class="h-4 rounded-full transition-all"
          :class="i === step ? 'w-10 bg-[var(--sb-moss)]' : i < step ? 'w-4 bg-moss-300' : 'w-4 bg-moss-200'"
          @click="go(i)"
        />
      </div>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <UButton size="xl" color="neutral" variant="outline" icon="i-lucide-arrow-left" :disabled="step === 0" @click="prev">
          上一步
        </UButton>
        <UButton size="xl" icon="i-lucide-arrow-right" trailing :disabled="isLast" @click="next">
          下一步 Next
        </UButton>
        <UButton size="xl" :color="playing ? 'warning' : 'neutral'" :variant="playing ? 'solid' : 'outline'" :icon="playing ? 'i-lucide-pause' : 'i-lucide-play'" @click="togglePlay">
          {{ playing ? '暫停 Pause' : '自動播放 Auto-play' }}
        </UButton>
        <UButton v-if="current.autoAward" size="xl" color="neutral" variant="soft" icon="i-lucide-sparkles" @click="award">
          再送一次 Again
        </UButton>
        <UButton size="xl" color="neutral" variant="ghost" icon="i-lucide-rotate-ccw" :loading="resetting" @click="reset()">
          重設 Reset
        </UButton>
      </div>
    </section>

    <!-- Mobile: tabs switch the phone -->
    <div class="flex justify-center gap-2 px-4 pb-3 lg:hidden" role="tablist">
      <UButton size="lg" :variant="tab === 'left' ? 'solid' : 'outline'" :color="tab === 'left' ? 'primary' : 'neutral'" icon="i-lucide-utensils" @click="tab = 'left'">
        食客 Diner
      </UButton>
      <UButton size="lg" :variant="tab === 'right' ? 'solid' : 'outline'" :color="tab === 'right' ? 'primary' : 'neutral'" icon="i-lucide-store" @click="tab = 'right'">
        攤商 Vendor
      </UButton>
    </div>

    <!-- Phones -->
    <section class="flex flex-1 items-start justify-center gap-10 px-3 pb-6 sm:px-6">
      <div v-for="side in (['left', 'right'] as const)" :key="side" class="w-full max-w-[26rem] lg:block" :class="tab === side ? 'block' : 'hidden'">
        <p class="mb-2 hidden items-center justify-center gap-2 text-2xl font-black text-[var(--sb-moss)] lg:flex">
          <UIcon :name="side === 'left' ? 'i-lucide-utensils' : 'i-lucide-store'" class="size-7" />
          {{ side === 'left' ? '食客 Diner' : '攤商 Vendor' }}
        </p>
        <div class="phone relative overflow-hidden bg-white">
          <template v-if="ready">
            <iframe
              v-if="side === 'left' && leftSrc"
              :key="`l-${reloadKey}`"
              :ref="(el) => (leftFrame = el as HTMLIFrameElement | null)"
              :src="leftSrc"
              title="食客畫面 Diner"
              class="block size-full border-0"
            />
            <iframe
              v-else-if="side === 'right' && rightSrc"
              :key="`r-${reloadKey}`"
              :ref="(el) => (rightFrame = el as HTMLIFrameElement | null)"
              :src="rightSrc"
              title="攤商畫面 Vendor"
              class="block size-full border-0"
            />
          </template>
          <div v-else class="grid size-full place-items-center text-xl text-[var(--sb-ink-soft)]">
            準備示範資料… Getting ready…
          </div>

          <div v-if="side === 'right' && showCityCard" class="absolute inset-0 grid place-items-center bg-[var(--sb-bg)] p-6">
            <div class="sb-card-white space-y-4 p-6 text-center">
              <UIcon name="i-lucide-landmark" class="mx-auto size-14 text-[var(--sb-moss)]" />
              <p class="text-2xl font-black">
                市政端:登入後看總覽
                <span class="block text-base font-normal text-[var(--sb-ink-soft)]">City view needs a (simulated) sign-in</span>
              </p>
              <p class="text-lg leading-snug">
                用虛構信箱 (@example.test) 登入,驗證碼會直接顯示在畫面上,不會寄出任何信件。
              </p>
              <div class="flex flex-col gap-3">
                <UButton to="/login?role=city" target="_blank" size="xl" block icon="i-lucide-log-in">
                  市政登入 City sign-in
                </UButton>
                <UButton to="/admin" target="_blank" size="xl" block color="neutral" variant="outline" icon="i-lucide-layout-dashboard">
                  管理總覽 Admin
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Reset area + keys -->
    <footer class="mx-auto w-full max-w-5xl space-y-3 px-4 pb-10 text-center">
      <div class="sb-card mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-3 p-4">
        <p class="text-lg font-bold">
          重置示範資料
          <span class="block text-sm font-normal text-[var(--sb-ink-soft)]">只清掉示範攤位上新送出的徽章,其他資料不動。Only the made-up demo stalls are reset.</span>
        </p>
        <UButton size="lg" color="neutral" variant="solid" icon="i-lucide-rotate-ccw" :loading="resetting" @click="reset(false)">
          重置示範資料
        </UButton>
        <UButton to="/admin" size="lg" color="neutral" variant="outline" icon="i-lucide-layout-dashboard">
          管理總覽 Admin
        </UButton>
        <p v-if="resetNote" class="w-full text-base font-bold text-[var(--sb-moss)]">
          {{ resetNote }}
        </p>
      </div>
      <p class="text-sm text-[var(--sb-ink-soft)]">
        鍵盤:→ 下一步 · ← 上一步 · 空白鍵 自動播放/暫停
      </p>
      <UnofficialNote />
    </footer>
  </div>
</template>

<style scoped>
.phone {
  border: 10px solid var(--sb-ink);
  border-radius: 2.75rem;
  box-shadow: 0 24px 48px -20px rgb(30 42 36 / 45%);
  height: 70dvh;
}

@media (min-width: 1024px) {
  .phone {
    height: clamp(30rem, calc(100dvh - 22rem), 52rem);
  }
}

.bar {
  transform-origin: left;
  animation: fill linear forwards;
}

@keyframes fill {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.pop-enter-active {
  animation: pop-in 0.5s cubic-bezier(0.2, 1.4, 0.4, 1);
}

.pop-leave-active {
  transition: opacity 0.6s, transform 0.6s;
}

.pop-leave-to {
  opacity: 0;
  transform: translateY(-1.5rem);
}

@keyframes pop-in {
  from { opacity: 0; transform: translateY(1.5rem) scale(0.6); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .bar, .pop-enter-active { animation: none; }
}
</style>
