<script setup lang="ts">
import type { BadgeKey } from '~~/shared/badges'
import type { FeedItem, MeResponse, VenueDetail } from '~~/shared/types'

const route = useRoute()
const embed = useEmbed()
const to = useEmbedTo()
const id = String(route.params.id)
const url = `/api/stalls/${encodeURIComponent(id)}`

const { data: venue, error, refresh } = await useFetch<VenueDetail>(url, { key: `stall:${id}` })
const { data: me, refresh: refreshMe } = useFetch<MeResponse>(`${url}/me`, { key: `stall-me:${id}`, server: false, lazy: true })

if (import.meta.server && error.value)
  setResponseStatus(useRequestEvent()!, 404)

const title = computed(() => venue.value ? `${venue.value.name}｜安心標章` : '找不到這家店｜安心標章')
const description = computed(() => {
  const v = venue.value
  if (!v)
    return '這家店不在名單上。'
  const where = `${v.group}${v.kind === 'stall' ? '夜市' : ''}`
  return v.lapsed
    ? `${where}的「${v.name}」食安微笑標章已結束。非官方。`
    : `${where}的「${v.name}」擁有衛生局食安微笑標章。來送徽章,為好店加油!非官方。`
})
useSeoMeta({ title, ogTitle: title, description, ogDescription: description, ogType: 'website', ogLocale: 'zh_TW' })

const sheet = ref(false)
const sent = ref<BadgeKey[]>([])
const related = ref<FeedItem[]>([])
const busy = computed(() => sheet.value)

// Demo panes: a second pane sees changes live.
const { pause, resume } = useIntervalFn(() => {
  if (busy.value)
    return
  refresh()
  refreshMe()
  refreshNuxtData('counter')
}, 3000, { immediate: false })
onMounted(() => {
  if (embed.value)
    resume()
})
onBeforeUnmount(pause)

async function done(given: BadgeKey[]) {
  sent.value = given
  await Promise.all([refresh(), refreshMe(), refreshNuxtData('counter')])
  related.value = await $fetch<FeedItem[]>('/api/feed', { query: { stall: id } }).catch(() => [])
  await nextTick()
  document.getElementById('thanks')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const blockedNote = computed(() => {
  switch (me.value?.reason) {
    case 'month': return '這個月已送過,下個月再來。'
    case 'all-given': return '這家店的徽章你都送過了,謝謝你!'
    default: return ''
  }
})
</script>

<template>
  <div class="space-y-5">
    <UButton :to="to('/diner', venue ? { group: venue.group, kind: venue.kind } : {})" icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="lg" class="-ml-3">
      回找好店
    </UButton>

    <div v-if="error || !venue" class="sb-card space-y-4 p-6">
      <h1 class="text-3xl font-black">
        找不到這家店
      </h1>
      <p class="text-xl">
        這家店不在衛生局的名單上,所以這裡沒有它的頁面。
      </p>
      <UButton :to="to('/diner')" size="xl" icon="i-lucide-map">
        回地圖找店
      </UButton>
    </div>

    <template v-else>
      <StallView :venue="venue">
        <template #actions>
          <UButton v-if="!venue.lapsed && (!me || me.canAward)" size="xl" icon="i-lucide-leaf" class="order-first w-full justify-center sm:w-auto" @click="sheet = true">
            送出徽章
          </UButton>
          <ShareButton v-if="!sent.length" :title="venue.name" :text="`${venue.group}${venue.kind === 'stall' ? '夜市' : ''}的 ${venue.name},通過食安微笑標章。`" />
        </template>

        <p v-if="venue.lapsed" class="flex items-center gap-2 text-xl font-bold">
          <UIcon name="i-lucide-info" class="size-6 shrink-0" />
          標章已結束,暫時不能送徽章。
        </p>
        <p v-else-if="blockedNote && !sent.length" class="flex items-center gap-2 text-xl font-bold text-[var(--sb-moss)]">
          <UIcon name="i-lucide-heart-handshake" class="size-6 shrink-0" />
          {{ blockedNote }}
        </p>

        <section v-if="sent.length" id="thanks" class="sb-card space-y-4 p-6 text-center">
          <UIcon name="i-lucide-party-popper" class="sb-pop mx-auto size-14 text-[var(--sb-moss)]" />
          <h2 class="text-3xl font-black">
            謝謝你!
          </h2>
          <p class="text-xl">
            你送出了 {{ sent.length }} 個徽章,店家會看到。
          </p>
          <div class="flex flex-wrap justify-center gap-5">
            <BadgeMark v-for="b in sent" :key="b" class="sb-pop" :badge="b" size="lg" />
          </div>
          <CityCounter compact />
          <div class="flex justify-center">
            <ShareButton :title="venue.name" :text="`我送了徽章給 ${venue.name},你也來看看。`" />
          </div>
        </section>

        <section v-if="sent.length && related.length" class="space-y-3">
          <h2 class="text-2xl font-black">
            這家店的好消息
          </h2>
          <FeedItem v-for="i in related" :key="i.id" :item="i" />
        </section>
      </StallView>
      <AwardSheet v-model:open="sheet" :stall-id="venue.id" :name="venue.name" :given="me?.exempt ? [] : (me?.given ?? [])" @done="done" @blocked="refreshMe()" />
    </template>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .sb-pop {
    animation: sb-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
}

@keyframes sb-pop {
  from { opacity: 0; transform: scale(0.4) rotate(-12deg); }
  to { opacity: 1; transform: none; }
}
</style>
