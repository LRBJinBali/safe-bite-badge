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
    sub: '幫夜市攤位和餐廳送上四種社區徽章,只慶祝、不批評。非官方,依衛生局公開名單製作。',
    left: '/diner?embed=1',
    right: '/vendor?embed=1',
    focus: 'left',
    secs: 11,
  },
  {
    zh: '食客看地圖,挑夜市或餐廳',
    en: 'Diners browse the map and pick a market or district',
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
    zh: '不只夜市,餐廳也一樣',
    en: 'Not only night markets: restaurants too',
    sub: '同一套徽章也用在 876 家通過衛生局餐飲衛生分級的餐廳。(示範小館為虛構)',
    left: '/stall/DEMO-R-001?embed=1',
    right: '/vendor/stall/DEMO-R-001?embed=1',
    focus: 'left',
    secs: 9,
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

// STAGE: on a wide screen the page is laid out once at DESIGN_W x DESIGN_H and scaled to fit the window,
// so the whole demo is visible without scrolling on a laptop or a projector. Browser zoom is not available
// in every viewer, so + / - (and Cmd or Ctrl with + / -) zoom the stage instead.
const DESIGN_W = 1360
const DESIGN_H = 760
const ZOOM_MIN = 0.5
const ZOOM_MAX = 2.5
const mounted = ref(false)
const { width: vw, height: vh } = useWindowSize({ initialWidth: 0, initialHeight: 0 })
const zoom = useLocalStorage('sb_demo_zoom', 1)
const staged = computed(() => mounted.value && vw.value >= 900)
const scale = computed(() => Math.min(vw.value / DESIGN_W, vh.value / DESIGN_H) * zoom.value)
const stageSize = computed(() => ({
  w: Math.max(Math.floor(vw.value / scale.value), DESIGN_W),
  h: Math.max(Math.floor(vh.value / scale.value), DESIGN_H),
}))
// The box that takes the scaled space (a transform does not change layout size), and the scaled stage inside it.
const boxStyle = computed(() => staged.value
  ? { width: `${Math.floor(stageSize.value.w * scale.value)}px`, height: `${Math.floor(stageSize.value.h * scale.value)}px` }
  : undefined)
const stageStyle = computed(() => staged.value
  ? {
      width: `${stageSize.value.w}px`,
      height: `${stageSize.value.h}px`,
      transform: `scale(${scale.value})`,
      transformOrigin: '0 0',
    }
  : undefined)
const { isSupported: canFullscreen, isFullscreen, toggle: toggleFullscreen } = useFullscreen()

function zoomBy(d: number) {
  zoom.value = Math.min(Math.max(Math.round((zoom.value + d) * 100) / 100, ZOOM_MIN), ZOOM_MAX)
}
const zoomReset = () => (zoom.value = 1)

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

function handleKey(key: string, mod: boolean, alt: boolean) {
  if (!alt && (key === '+' || key === '=')) {
    zoomBy(0.1)
    return true
  }
  if (!alt && (key === '-' || key === '_')) {
    zoomBy(-0.1)
    return true
  }
  if (!alt && key === '0') {
    zoomReset()
    return true
  }
  if (mod || alt)
    return false
  if (key === 'ArrowRight') {
    next()
  }
  else if (key === 'ArrowLeft') {
    prev()
  }
  else if (key === ' ') {
    (document.activeElement as HTMLElement | null)?.blur?.()
    togglePlay()
  }
  else {
    return false
  }
  return true
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (!ready.value)
    return
  const t = e.target as HTMLElement | null
  if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))
    return
  if (handleKey(e.key, e.metaKey || e.ctrlKey, e.altKey))
    e.preventDefault()
})

// Keys pressed after clicking inside a phone are forwarded by the embed plugin.
useEventListener('message', (e: MessageEvent) => {
  if (e.origin === location.origin && e.data?.type === 'key' && ready.value)
    handleKey(String(e.data.key), !!e.data.mod, !!e.data.alt)
})

onMounted(async () => {
  mounted.value = true
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
  <div :class="staged ? 'fixed inset-0 overflow-auto bg-[var(--sb-bg)]' : 'bg-[var(--sb-bg)]'">
    <div :class="staged ? 'relative' : ''" :style="boxStyle">
      <div :class="staged ? 'absolute left-0 top-0 flex flex-col' : 'flex min-h-dvh flex-col'" :style="stageStyle">
        <header class="flex shrink-0 items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <NuxtLink to="/" class="flex items-center gap-2 text-xl font-black text-[var(--sb-moss)]">
            <UIcon name="i-lucide-leaf" class="size-7" /> 安心標章
            <span class="hidden text-sm font-normal text-[var(--sb-ink-soft)] sm:inline">Safe-Bite Badge</span>
          </NuxtLink>
          <div class="flex items-center gap-2">
            <SimTag class="!hidden sm:!inline-flex">
              示範模式 demo · 虛構攤位與模擬票
            </SimTag>
            <!-- Zoom: works even where browser zoom does not (keys: + - 0) -->
            <div v-if="staged" class="flex items-center gap-1" role="group" aria-label="縮放 Zoom">
              <UButton color="neutral" variant="outline" size="lg" icon="i-lucide-zoom-out" aria-label="縮小 Zoom out" :disabled="zoom <= ZOOM_MIN" @click="zoomBy(-0.1)" />
              <UButton color="neutral" variant="ghost" size="lg" class="min-w-16 justify-center tabular-nums" aria-label="符合視窗 Fit to window" @click="zoomReset">
                {{ Math.round(zoom * 100) }}%
              </UButton>
              <UButton color="neutral" variant="outline" size="lg" icon="i-lucide-zoom-in" aria-label="放大 Zoom in" :disabled="zoom >= ZOOM_MAX" @click="zoomBy(0.1)" />
            </div>
            <UButton v-if="staged && canFullscreen" color="neutral" variant="outline" size="lg" :icon="isFullscreen ? 'i-lucide-minimize' : 'i-lucide-maximize'" aria-label="全螢幕 Full screen" @click="toggleFullscreen" />
            <UButton to="/admin" color="neutral" variant="ghost" size="lg" icon="i-lucide-layout-dashboard">
              <span class="hidden sm:inline">管理 Admin</span>
            </UButton>
            <UButton to="/" color="neutral" variant="ghost" size="lg" icon="i-lucide-house">
              <span class="hidden sm:inline">首頁</span>
            </UButton>
          </div>
        </header>

        <!-- floating "+N badges" -->
        <Transition name="pop">
          <div v-if="toast" :key="toast.id" class="absolute left-1/2 top-2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white px-5 py-2 text-moss-800 shadow-2xl">
            <span class="text-4xl font-black">+{{ toast.n }}</span>
            <span class="text-xl font-black leading-tight">徽章<span class="block text-sm font-semibold">badges</span></span>
            <span class="flex gap-1">
              <BadgeMark v-for="b in toast.badges" :key="b" :badge="b" size="sm" :label="false" />
            </span>
          </div>
        </Transition>
        <p v-if="toastError" class="absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-full bg-[var(--sb-simulated-bg)] px-4 py-2 text-lg font-bold text-[var(--sb-simulated)]">
          送出失敗,按「再送一次」。 Failed, send again.
        </p>

        <!-- Wide: phone | caption and controls | phone, all in one screen. Narrow: caption, then one phone at a time. -->
        <div class="flex flex-1 gap-6 px-3 sm:px-6" :class="staged ? 'min-h-0 flex-row pb-4' : 'flex-col pb-6'">
          <!-- Caption and controls: big, high contrast, readable from the back of the room -->
          <div class="flex flex-col gap-4" :class="staged ? 'order-2 min-w-0 flex-1 justify-center' : 'order-1'">
            <section class="relative overflow-hidden bg-moss-800 text-white" style="border-radius: 2rem 1rem 2rem 1rem" aria-live="polite">
              <div class="flex flex-col gap-2 px-6 py-5" :class="staged ? '' : 'sm:px-10'">
                <p class="flex items-center gap-3 text-lg font-bold text-moss-200">
                  <span class="rounded-full bg-white px-3 py-0.5 text-base font-black text-moss-800">步驟 {{ step + 1 }} / {{ STEPS.length }}</span>
                  Step {{ step + 1 }}
                </p>
                <h1 class="font-black leading-tight" :class="staged ? 'text-4xl' : 'text-3xl sm:text-4xl'">
                  {{ current.zh }}
                </h1>
                <p class="text-xl font-semibold text-moss-200">
                  {{ current.en }}
                </p>
                <p class="text-xl leading-snug">
                  {{ current.sub }}
                </p>
              </div>
              <div v-if="playing" :key="`${step}-bar`" class="bar absolute inset-x-0 bottom-0 h-1.5 bg-moss-300" :style="{ animationDuration: `${current.secs}s` }" />
            </section>

            <!-- Controls -->
            <section class="flex flex-col items-center gap-3">
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
              <div class="flex flex-wrap items-center justify-center gap-2">
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
                <UButton size="xl" color="neutral" variant="ghost" icon="i-lucide-rotate-ccw" :loading="resetting" title="只清掉示範攤位上新送出的徽章 Only the made-up demo stalls are reset" @click="reset()">
                  重設 Reset
                </UButton>
              </div>
              <p v-if="resetNote" class="text-base font-bold text-[var(--sb-moss)]">
                {{ resetNote }}
              </p>
              <p class="text-center text-sm text-[var(--sb-ink-soft)]">
                鍵盤:→ 下一步 · ← 上一步 · 空白鍵 自動播放/暫停 · + / − 縮放
              </p>
              <UnofficialNote class="text-center" />
            </section>

            <!-- Narrow screens: tabs switch the phone -->
            <div v-if="!staged" class="flex justify-center gap-2" role="tablist">
              <UButton size="lg" :variant="tab === 'left' ? 'solid' : 'outline'" :color="tab === 'left' ? 'primary' : 'neutral'" icon="i-lucide-utensils" @click="tab = 'left'">
                食客 Diner
              </UButton>
              <UButton size="lg" :variant="tab === 'right' ? 'solid' : 'outline'" :color="tab === 'right' ? 'primary' : 'neutral'" icon="i-lucide-store" @click="tab = 'right'">
                攤商 Vendor
              </UButton>
            </div>
          </div>

          <!-- Phones -->
          <div
            v-for="side in (['left', 'right'] as const)"
            :key="side"
            class="flex flex-col"
            :class="staged ? `w-[22rem] shrink-0 ${side === 'left' ? 'order-1' : 'order-3'}` : `order-2 mx-auto w-full max-w-[26rem] ${tab === side ? '' : 'hidden'}`"
          >
            <p v-if="staged" class="mb-1 flex shrink-0 items-center justify-center gap-2 text-2xl font-black text-[var(--sb-moss)]">
              <UIcon :name="side === 'left' ? 'i-lucide-utensils' : 'i-lucide-store'" class="size-7" />
              {{ side === 'left' ? '食客 Diner' : '攤商 Vendor' }}
            </p>
            <div class="phone relative overflow-hidden bg-white" :class="staged ? 'min-h-0 flex-1' : 'phone-small'">
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.phone {
  border: 10px solid var(--sb-ink);
  border-radius: 2.75rem;
  box-shadow: 0 24px 48px -20px rgb(30 42 36 / 45%);
}

.phone-small {
  height: 70dvh;
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
  transform: translate(-50%, -1.5rem);
}

@keyframes pop-in {
  from { opacity: 0; transform: translate(-50%, 1.5rem) scale(0.6); }
  to { opacity: 1; transform: translate(-50%, 0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .bar, .pop-enter-active { animation: none; }
}
</style>
