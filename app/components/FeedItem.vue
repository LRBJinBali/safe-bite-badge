<script setup lang="ts">
import type { FeedItem, ReactionKind } from '~~/shared/types'

const props = defineProps<{ item: FeedItem }>()

const to = useEmbedTo()
const KINDS = {
  new: { label: '新獲認證', icon: 'i-lucide-badge-check' },
  streak: { label: '連續獲證', icon: 'i-lucide-repeat-2' },
  milestone: { label: '徽章里程碑', icon: 'i-lucide-trophy' },
} as const
const REACTIONS: { kind: ReactionKind, label: string, icon: string }[] = [
  { kind: 'congrats', label: '恭喜', icon: 'i-lucide-party-popper' },
  { kind: 'want', label: '我想去', icon: 'i-lucide-footprints' },
  { kind: 'been', label: '去過了', icon: 'i-lucide-circle-check' },
]

const counts = ref<FeedItem['reactions']>({ ...props.item.reactions })
const mine = ref<ReactionKind[]>([...props.item.mine])
watch(() => props.item, (i) => {
  counts.value = { ...i.reactions }
  mine.value = [...i.mine]
})

const destination = computed(() => props.item.venueId
  ? to(`/stall/${props.item.venueId}`)
  : to('/diner', { group: props.item.group ?? '', kind: props.item.id.startsWith('new:restaurant:') ? 'restaurant' : 'stall' }))

// A fresh invisible spam check per click (renders nothing when no site key is set).
const pending = ref<ReactionKind | null>(null)
const failed = ref(false)

function tap(kind: ReactionKind) {
  if (mine.value.includes(kind)) {
    if (kind === 'want')
      navigateTo(destination.value)
    return
  }
  failed.value = false
  pending.value = kind
}

async function send(token: string) {
  const kind = pending.value
  if (!kind)
    return
  pending.value = null
  mine.value = [...mine.value, kind]
  counts.value = { ...counts.value, [kind]: (counts.value[kind] ?? 0) + 1 }
  try {
    const res = await $fetch<{ count: number }>(`/api/feed/${encodeURIComponent(props.item.id)}/reactions`, { method: 'POST', body: { kind, turnstile: token } })
    counts.value = { ...counts.value, [kind]: res.count }
    if (kind === 'want')
      navigateTo(destination.value)
  }
  catch {
    mine.value = mine.value.filter(k => k !== kind)
    counts.value = { ...counts.value, [kind]: Math.max((counts.value[kind] ?? 1) - 1, 0) || undefined }
    failed.value = true
  }
}
</script>

<template>
  <article class="sb-card-white space-y-4 p-5">
    <div class="flex flex-wrap items-center gap-2 text-base font-bold text-[var(--sb-moss)]">
      <UIcon :name="KINDS[item.kind].icon" class="size-6" />
      <span>{{ KINDS[item.kind].label }}</span>
      <span v-if="item.group" class="font-normal text-[var(--sb-ink-soft)]">· {{ item.group }}{{ item.venueId || item.group.endsWith('區') || item.group.endsWith('夜市') ? '' : '夜市' }}</span>
      <SimTag v-if="item.simulated" />
    </div>
    <p class="text-xl font-bold leading-snug">
      <NuxtLink v-if="item.venueId" :to="to(`/stall/${item.venueId}`)" class="hover:underline">
        {{ item.text }}
      </NuxtLink>
      <template v-else>
        {{ item.text }}
      </template>
    </p>
    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="r in REACTIONS"
        :key="r.kind"
        size="lg"
        :icon="mine.includes(r.kind) ? 'i-lucide-check' : r.icon"
        :color="mine.includes(r.kind) ? 'primary' : 'neutral'"
        :variant="mine.includes(r.kind) ? 'solid' : 'outline'"
        :disabled="(mine.includes(r.kind) && r.kind !== 'want') || pending !== null"
        :aria-pressed="mine.includes(r.kind)"
        @click="tap(r.kind)"
      >
        {{ r.label }}<span v-if="counts[r.kind]" class="ml-1 font-black">{{ counts[r.kind] }}</span>
      </UButton>
    </div>
    <p v-if="failed" class="text-base text-[var(--sb-simulated)]">
      剛剛沒有送出,請再試一次。
    </p>
    <TurnstileBox v-if="pending" @token="send" />
  </article>
</template>
