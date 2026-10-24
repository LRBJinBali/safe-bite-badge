<script setup lang="ts">
import type { BadgeKey } from '~~/shared/badges'

interface Overview {
  month: string
  now: number
  kpi: { monthBadges: number, awards: number, realAwards: number, simulatedAwards: number, reactions: number, simulatedReactions: number, signins: number, madeUpVenues: number, visitRequests: number }
  groups: { group: string, kind: 'stall' | 'restaurant', total: number }[]
  badges: { key: BadgeKey, count: number }[]
  activity: { id: number, kind: string, detail: string, simulated: boolean, at: number }[]
  env: { mapboxToken: boolean, turnstileSiteKey: boolean, turnstileSecret: boolean, adminKey: boolean }
}

const route = useRoute()
const toast = useToast()
const { isDemo, setDemo } = useDemo()
const KEY = 'sb_admin_key'

const adminKey = ref('')
const keyInput = ref('')
const data = ref<Overview | null>(null)
const needKey = ref(false)
const failed = ref(false)
const busy = ref('')

const headers = () => (adminKey.value ? { 'x-admin-key': adminKey.value } : undefined)

async function load() {
  try {
    data.value = await $fetch<Overview>('/api/admin/overview', { headers: headers() })
    needKey.value = false
    failed.value = false
  }
  catch (e) {
    if ((e as { statusCode?: number }).statusCode === 401) {
      needKey.value = true
      data.value = null
    }
    else { failed.value = true }
  }
}

function saveKey() {
  adminKey.value = keyInput.value.trim()
  try {
    localStorage.setItem(KEY, adminKey.value)
  }
  catch { /* private window: keep it in memory */ }
  load()
}

onMounted(() => {
  const q = route.query.key
  try {
    if (typeof q === 'string' && q)
      localStorage.setItem(KEY, q)
    adminKey.value = localStorage.getItem(KEY) ?? ''
  }
  catch { adminKey.value = typeof q === 'string' ? q : '' }
  load()
})
useIntervalFn(() => {
  if (import.meta.client && !needKey.value)
    load()
}, 5000)

async function demoCall(label: string, path: string) {
  busy.value = path
  try {
    const r = await $fetch<unknown>(path, { method: 'POST', headers: headers() })
    toast.add({ title: `${label}完成`, description: JSON.stringify(r).slice(0, 300), color: 'success' })
    await load()
  }
  catch (e) {
    const err = e as { statusCode?: number, statusMessage?: string }
    toast.add({
      title: err.statusCode === 404 ? `${label}還沒有準備好` : `${label}沒有成功`,
      description: err.statusCode === 404 ? '這個功能的接口尚未上線,稍後再試。' : (err.statusMessage ?? '請再試一次'),
      color: 'warning',
    })
  }
  finally { busy.value = '' }
}

const KIND_ZH: Record<string, string> = { 'signin': '登入', 'award': '送出徽章', 'seed': '種子資料', 'reset': '重設', 'visit': '訪視申請', 'visit-request': '送出訪視申請', 'venue': '新增虛構店家', 'reaction': '回應' }
const timeFmt = new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
const at = (s: number) => timeFmt.format(s * 1000)
const maxGroup = computed(() => Math.max(1, ...(data.value?.groups.map(g => g.total) ?? [1])))

const tiles = computed(() => {
  const k = data.value?.kpi
  if (!k)
    return []
  return [
    { label: '本月徽章', value: k.monthBadges, icon: 'i-lucide-badge-check' },
    { label: '累計送出', value: k.awards, icon: 'i-lucide-layers' },
    { label: '真實徽章', value: k.realAwards, icon: 'i-lucide-user-check' },
    { label: '模擬徽章', value: k.simulatedAwards, icon: 'i-lucide-flask-conical', sim: true },
    { label: '回應(恭喜等)', value: k.reactions, icon: 'i-lucide-party-popper' },
    { label: '登入次數', value: k.signins, icon: 'i-lucide-log-in', sim: true },
    { label: '虛構店家', value: k.madeUpVenues, icon: 'i-lucide-store', sim: true },
    { label: '訪視申請', value: k.visitRequests, icon: 'i-lucide-clipboard-list', sim: true },
  ]
})

const envRows = computed(() => {
  const e = data.value?.env
  if (!e)
    return []
  return [
    { label: 'Mapbox token', ok: e.mapboxToken, note: '沒有也能用,地圖改為清單' },
    { label: 'Turnstile 網站金鑰', ok: e.turnstileSiteKey, note: '防洗票檢查(前端)' },
    { label: 'Turnstile 密鑰', ok: e.turnstileSecret, note: '空白時略過伺服器驗證' },
    { label: 'Admin key', ok: e.adminKey, note: '空白時本頁對所有人開放' },
  ]
})

useHead({ title: '管理總覽 · 安心標章' })
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-4xl font-black">
        管理總覽
      </h1>
      <p class="flex items-center gap-2 text-base text-[var(--sb-ink-soft)]">
        <UIcon name="i-lucide-refresh-cw" class="size-5" /> 每 5 秒自動更新
      </p>
    </div>

    <section v-if="needKey" class="sb-card-white mx-auto max-w-xl space-y-4 p-6">
      <h2 class="text-3xl font-black">
        請輸入管理金鑰
      </h2>
      <p class="text-lg text-[var(--sb-ink-soft)]">
        這一頁給產品負責人看。也可以用網址 ?key=金鑰 直接打開。
      </p>
      <UInput v-model="keyInput" type="password" size="xl" class="w-full" placeholder="管理金鑰" @keydown.enter="saveKey" />
      <UButton size="xl" block icon="i-lucide-key-round" @click="saveKey">
        進入
      </UButton>
    </section>

    <p v-else-if="failed && !data" class="text-xl">
      暫時讀不到資料,稍後會自動再試。
    </p>

    <template v-else-if="data">
      <section class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div v-for="t in tiles" :key="t.label" class="sb-card-white p-4">
          <p class="flex flex-wrap items-center gap-x-2 text-base font-bold text-[var(--sb-ink-soft)]">
            <UIcon :name="t.icon" class="size-5 shrink-0" />{{ t.label }}<SimTag v-if="t.sim">
              模擬
            </SimTag>
          </p>
          <p class="mt-1 text-5xl font-black text-[var(--sb-moss)]">
            {{ t.value }}
          </p>
        </div>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="sb-card-white space-y-4 p-6">
          <h2 class="text-3xl font-black">
            {{ Number(data.month.slice(5)) }} 月各市場合計
          </h2>
          <ul v-if="data.groups.length" class="space-y-3">
            <li v-for="g in data.groups" :key="g.kind + g.group">
              <div class="flex justify-between text-lg font-bold">
                <span>{{ g.group }}<span v-if="g.kind === 'stall' && !g.group.endsWith('夜市')" class="text-base font-normal">夜市</span></span><span>{{ g.total }}</span>
              </div>
              <div class="h-3 rounded-full bg-[var(--sb-sage)]">
                <div class="h-3 rounded-full bg-[var(--sb-moss)] transition-all" :style="{ width: `${Math.max(4, (g.total / maxGroup) * 100)}%` }" />
              </div>
            </li>
          </ul>
          <p v-else class="text-lg text-[var(--sb-ink-soft)]">
            本月的徽章還在路上。
          </p>
          <p class="text-sm text-[var(--sb-ink-soft)]">
            只有合計,依固定順序,沒有排名。
          </p>
        </section>

        <section class="sb-card-white space-y-4 p-6">
          <h2 class="text-3xl font-black">
            本月四種徽章
          </h2>
          <div class="grid gap-5 sm:grid-cols-2">
            <BadgeMark v-for="b in data.badges" :key="b.key" :badge="b.key" :count="b.count" />
          </div>
        </section>
      </div>

      <section class="sb-card-white space-y-3 p-6">
        <h2 class="text-3xl font-black">
          最近 20 筆活動
        </h2>
        <ul v-if="data.activity.length" class="divide-y divide-[var(--sb-sage)]">
          <li v-for="a in data.activity" :key="a.id" class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-lg">
            <span class="w-24 text-base text-[var(--sb-ink-soft)]">{{ at(a.at) }}</span>
            <span class="font-bold">{{ KIND_ZH[a.kind] ?? a.kind }}</span>
            <span class="min-w-0 flex-1 truncate text-[var(--sb-ink-soft)]">{{ a.detail }}</span>
            <SimTag v-if="a.simulated" />
          </li>
        </ul>
        <p v-else class="text-lg text-[var(--sb-ink-soft)]">
          還沒有活動紀錄。
        </p>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="sb-card-white space-y-3 p-6">
          <h2 class="text-3xl font-black">
            資料狀態
          </h2>
          <div class="space-y-2 text-lg">
            <p class="font-bold">
              <UIcon name="i-lucide-badge-check" class="mr-1 size-5 align-text-bottom" />真實資料
            </p>
            <ul class="list-disc space-y-1 pl-6">
              <li>113、114 年食安微笑標章名單:516 攤</li>
              <li>衛生局優、良餐廳(已去除連鎖與機構):876 家</li>
            </ul>
            <p class="pt-2 font-bold">
              <UIcon name="i-lucide-flask-conical" class="mr-1 size-5 align-text-bottom" />模擬的部分 <SimTag />
            </p>
            <ul class="list-disc space-y-1 pl-6">
              <li>種子票數與由此產生的里程碑、連續認證動態</li>
              <li>虛構店家(示範夜市)</li>
              <li>攤商與市府的登入(@example.test,不寄信)</li>
              <li>訪視申請的處理狀態</li>
            </ul>
          </div>
        </section>

        <section class="sb-card-white space-y-3 p-6">
          <h2 class="text-3xl font-black">
            環境檢查
          </h2>
          <ul class="space-y-2">
            <li v-for="r in envRows" :key="r.label" class="flex items-center gap-3 text-lg">
              <UIcon :name="r.ok ? 'i-lucide-circle-check' : 'i-lucide-circle-dashed'" class="size-6 shrink-0" />
              <span class="font-bold">{{ r.label }}</span>
              <span class="font-bold">{{ r.ok ? '已設定' : '未設定' }}</span>
              <span class="text-base text-[var(--sb-ink-soft)]">{{ r.note }}</span>
            </li>
          </ul>
        </section>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="sb-card-white space-y-4 p-6">
          <h2 class="text-3xl font-black">
            示範工具
          </h2>
          <div class="flex flex-wrap gap-3">
            <UButton to="/demo" size="xl" icon="i-lucide-columns-2">
              開啟示範模式
            </UButton>
            <UButton size="xl" color="neutral" variant="outline" icon="i-lucide-sprout" :loading="busy === '/api/demo/seed?force=1'" @click="demoCall('產生種子資料', '/api/demo/seed?force=1')">
              產生種子票
            </UButton>
            <UButton size="xl" color="neutral" variant="outline" icon="i-lucide-rotate-ccw" :loading="busy === '/api/demo/reset'" @click="demoCall('重設示範', '/api/demo/reset')">
              重設示範
            </UButton>
          </div>
          <label class="flex items-center gap-3 text-lg font-bold">
            <USwitch :model-value="isDemo" size="xl" @update:model-value="setDemo(!!$event)" />
            此瀏覽器的示範模式
          </label>
        </section>

        <section class="sb-card-white space-y-3 p-6">
          <h2 class="text-3xl font-black">
            配色
          </h2>
          <p class="text-lg">
            想調整顏色、字級與圓角,請改 <code class="rounded bg-[var(--sb-sage)] px-1">app/assets/css/theme.css</code>。
          </p>
        </section>
      </div>
    </template>
  </div>
</template>
