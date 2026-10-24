<script setup lang="ts">
import type { BadgeKey } from '~~/shared/badges'
import type { GroupInfo, VenueKind, VenueListItem } from '~~/shared/types'
import { BADGES } from '~~/shared/badges'

const route = useRoute()
const router = useRouter()
const to = useEmbedTo()
const reqFetch = useRequestFetch()

useSeoMeta({
  title: '找一家安心的好店｜安心標章',
  description: '在地圖上找到通過衛生局食安微笑標章的夜市攤位與餐廳,送徽章給你喜歡的店。非官方。',
})

const kind = computed<VenueKind>(() => (route.query.kind === 'restaurant' ? 'restaurant' : 'stall'))
const group = computed(() => (typeof route.query.group === 'string' ? route.query.group : ''))

function setQuery(patch: Record<string, string | undefined>) {
  const query: Record<string, string> = {}
  for (const [k, v] of Object.entries({ ...route.query, ...patch })) {
    if (typeof v === 'string' && v)
      query[k] = v
  }
  router.replace({ query })
}

const search = ref('')
const q = refDebounced(search, 300)
const badge = ref<BadgeKey | ''>('')
const shown = ref(30)

const { data: feed } = await useFetch('/api/feed', { query: { limit: 4 }, key: 'feed-strip' })
const { data: groups } = await useFetch<GroupInfo[]>('/api/markets', { query: computed(() => ({ kind: kind.value })), key: 'markets' })

const { data: venues, status } = await useAsyncData(
  'venues',
  async () => {
    const text = q.value.trim()
    if (!group.value && !text)
      return []
    return await reqFetch<VenueListItem[]>('/api/stalls', {
      query: { kind: kind.value, group: text ? undefined : group.value, q: text || undefined, badge: badge.value || undefined },
    })
  },
  { watch: [group, kind, q, badge], default: () => [] },
)
watch([group, kind, q, badge], () => {
  shown.value = 30
})

const searching = computed(() => !!q.value.trim())
/** Stall chips are districts; an old link may still name a single market. */
const stallDistrict = computed(() => kind.value === 'stall' && group.value.endsWith('區'))
const visible = computed(() => (venues.value ?? []).slice(0, shown.value))
const heading = computed(() => {
  if (searching.value)
    return `搜尋「${q.value.trim()}」`
  if (kind.value === 'restaurant')
    return group.value
  return stallDistrict.value ? `${group.value}的夜市攤位` : `${group.value}夜市`
})

function chooseKind(k: VenueKind) {
  if (k === kind.value)
    return
  search.value = ''
  setQuery({ kind: k, group: undefined })
}

async function choose(key: string) {
  search.value = ''
  setQuery({ group: key })
  await nextTick()
  document.getElementById('venue-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-1">
      <h1 class="text-3xl font-black leading-tight sm:text-4xl">
        找一家安心的好店
      </h1>
      <p class="text-xl text-[var(--sb-ink-soft)]">
        只收錄通過衛生局衛生管理分級標章的店。
      </p>
    </div>

    <CityCounter />

    <section v-if="feed?.length" class="space-y-3" aria-labelledby="news-h">
      <div class="flex items-center justify-between gap-3">
        <h2 id="news-h" class="flex items-center gap-2 text-2xl font-black">
          <UIcon name="i-lucide-party-popper" class="size-7 text-[var(--sb-moss)]" /> 好消息
        </h2>
        <UButton :to="to('/feed')" trailing-icon="i-lucide-arrow-right" variant="ghost" size="lg">
          看全部
        </UButton>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <NuxtLink
          v-for="i in feed"
          :key="i.id"
          :to="i.venueId ? to(`/stall/${i.venueId}`) : to('/diner', { group: i.group ?? '', kind: 'stall' })"
          class="sb-card-white flex items-start gap-3 p-4 transition hover:-translate-y-0.5"
        >
          <UIcon :name="i.kind === 'milestone' ? 'i-lucide-trophy' : i.kind === 'streak' ? 'i-lucide-repeat-2' : 'i-lucide-badge-check'" class="mt-1 size-6 shrink-0 text-[var(--sb-moss)]" />
          <p class="text-lg font-bold leading-snug">
            {{ i.text }}
            <SimTag v-if="i.simulated" />
          </p>
        </NuxtLink>
      </div>
    </section>

    <section class="space-y-4" aria-labelledby="find-h">
      <h2 id="find-h" class="text-3xl font-black">
        在哪裡吃?
      </h2>
      <div class="flex flex-wrap gap-3" role="group" aria-label="類型">
        <UButton size="xl" icon="i-lucide-store" :variant="kind === 'stall' ? 'solid' : 'outline'" :color="kind === 'stall' ? 'primary' : 'neutral'" :aria-pressed="kind === 'stall'" @click="chooseKind('stall')">
          夜市攤位 <span class="text-base font-normal">Night-market stalls</span>
        </UButton>
        <UButton size="xl" icon="i-lucide-utensils" :variant="kind === 'restaurant' ? 'solid' : 'outline'" :color="kind === 'restaurant' ? 'primary' : 'neutral'" :aria-pressed="kind === 'restaurant'" @click="chooseKind('restaurant')">
          餐廳 <span class="text-base font-normal">Restaurants</span>
        </UButton>
      </div>

      <MarketMap :groups="groups ?? []" :selected="group" @select="choose" />
      <p class="text-lg text-[var(--sb-ink-soft)]">
        點一片葉子,看那一區的店。葉子上的數字是店家數量。
      </p>
      <div class="flex flex-wrap gap-2" role="group" aria-label="行政區">
        <UButton v-for="g in groups" :key="g.key" size="lg" :variant="g.key === group ? 'solid' : 'soft'" :color="g.key === group ? 'primary' : 'neutral'" :aria-pressed="g.key === group" @click="choose(g.key)">
          {{ g.key }}
        </UButton>
      </div>
    </section>

    <section id="venue-list" class="scroll-mt-20 space-y-4">
      <UInput v-model="search" size="xl" icon="i-lucide-search" placeholder="搜尋店名、夜市或行政區,例如:雞排、牛肉麵" class="w-full" aria-label="搜尋店名" :ui="{ base: 'text-lg' }" />

      <div class="space-y-2">
        <p class="text-lg font-bold">
          想找哪一種徽章?
        </p>
        <div class="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap" role="group" aria-label="徽章篩選">
          <button
            v-for="b in BADGES"
            :key="b.key"
            type="button"
            class="relative rounded-2xl border-2 p-2 pr-3 text-left transition focus-visible:outline-2 focus-visible:outline-[var(--sb-moss)]"
            :class="badge === b.key ? 'border-[var(--sb-ink)] bg-white shadow-md' : 'border-transparent bg-[var(--sb-sage)]'"
            :aria-pressed="badge === b.key"
            @click="badge = badge === b.key ? '' : b.key"
          >
            <BadgeMark :badge="b.key" size="sm" />
            <UIcon v-if="badge === b.key" name="i-lucide-check" class="absolute -right-2 -top-2 size-7 rounded-full bg-[var(--sb-ink)] p-1 text-white" />
          </button>
        </div>
      </div>

      <div v-if="group || searching" class="space-y-4">
        <h2 id="list-h" class="text-3xl font-black">
          {{ heading }}
        </h2>
        <div v-if="visible.length" class="grid gap-3 md:grid-cols-2">
          <VenueRow v-for="v in visible" :key="v.id" :venue="v" :show-group="searching || stallDistrict" />
        </div>
        <p v-else-if="status !== 'pending'" class="sb-card p-6 text-xl">
          這個條件目前沒有店家,換個徽章或關鍵字試試。
        </p>
        <div v-if="(venues?.length ?? 0) > shown" class="flex justify-center">
          <UButton size="xl" variant="outline" color="neutral" icon="i-lucide-chevrons-down" @click="shown += 30">
            再看更多
          </UButton>
        </div>
      </div>
      <p v-else class="sb-card flex items-center gap-3 p-6 text-xl">
        <UIcon name="i-lucide-map-pinned" class="size-8 shrink-0 text-[var(--sb-moss)]" />
        先在上面選一個行政區,或直接搜尋店名。
      </p>
    </section>
  </div>
</template>
