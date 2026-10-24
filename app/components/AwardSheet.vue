<script setup lang="ts">
import type { BadgeKey } from '~~/shared/badges'
import { BADGES } from '~~/shared/badges'

const props = defineProps<{ stallId: string, name: string, given: BadgeKey[] }>()
const emit = defineEmits<{ done: [given: BadgeKey[]], blocked: [] }>()
const open = defineModel<boolean>('open', { default: false })
const picked = ref<BadgeKey[]>([])
const token = ref<string | null>(null)
const busy = ref(false)
const error = ref('')

watch(open, (v) => {
  if (!v)
    return
  picked.value = []
  token.value = null
  error.value = ''
})

const isGiven = (k: BadgeKey) => props.given.includes(k)
const isOn = (k: BadgeKey) => isGiven(k) || picked.value.includes(k)

function toggle(k: BadgeKey) {
  if (isGiven(k))
    return
  picked.value = picked.value.includes(k) ? picked.value.filter(x => x !== k) : [...picked.value, k]
}

const REASONS: Record<string, string> = {
  'month': '這個月已送過,下個月再來。',
  'all-given': '這家店的徽章你都送過了,謝謝你!',
  'lapsed': '標章已結束,暫時不能送徽章。',
  'none-selected': '請先選一個徽章。',
}

function friendly(e: unknown) {
  const err = e as { statusCode?: number, data?: { data?: { reason?: string }, statusMessage?: string } }
  const reason = err.data?.data?.reason ?? err.data?.statusMessage
  if (err.statusCode === 409 && reason && REASONS[reason])
    return REASONS[reason]
  if (err.statusCode === 403)
    return '安全檢查沒有通過,請重新整理頁面再試。'
  if (err.statusCode === 429)
    return '按得太快了,請稍等一下再送。'
  return '這次沒有送出,請再試一次。'
}

async function submit() {
  if (!picked.value.length || busy.value || token.value === null)
    return
  busy.value = true
  error.value = ''
  try {
    await $fetch(`/api/stalls/${encodeURIComponent(props.stallId)}/awards`, { method: 'POST', body: { badges: picked.value, turnstile: token.value } })
    const sent = [...picked.value]
    open.value = false
    emit('done', sent)
  }
  catch (e) {
    error.value = friendly(e)
    if ((e as { statusCode?: number }).statusCode === 409)
      emit('blocked')
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <USlideover v-model:open="open" side="bottom" :title="`送徽章給 ${name}`" description="選你想送的徽章,最多四個。" :ui="{ content: 'mx-auto max-h-[94dvh] max-w-xl rounded-t-3xl', title: 'text-2xl font-black', description: 'text-lg' }">
    <template #body>
      <div class="space-y-3">
        <button
          v-for="b in BADGES"
          :key="b.key"
          type="button"
          class="flex min-h-20 w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition focus-visible:outline-2 focus-visible:outline-[var(--sb-moss)]"
          :class="[
            isOn(b.key) ? 'border-[var(--sb-ink)] bg-[var(--sb-sage)]' : 'border-[var(--sb-sage)] bg-white',
            isGiven(b.key) ? 'opacity-70' : '',
          ]"
          :disabled="isGiven(b.key)"
          :aria-pressed="isOn(b.key)"
          @click="toggle(b.key)"
        >
          <BadgeMark :badge="b.key" size="md" :label="false" />
          <span class="min-w-0 flex-1 leading-snug">
            <span class="block text-xl font-bold">{{ b.zh }} <span class="hidden text-sm font-normal text-[var(--sb-ink-soft)] sm:inline">{{ b.en }}</span></span>
            <span class="block text-base text-[var(--sb-ink-soft)]">{{ b.hint }}</span>
          </span>
          <span class="flex shrink-0 flex-col items-center gap-0.5 text-sm font-bold">
            <UIcon :name="isOn(b.key) ? 'i-lucide-square-check-big' : 'i-lucide-square'" class="size-8" />
            {{ isGiven(b.key) ? '已送過' : isOn(b.key) ? '已選' : '' }}
          </span>
        </button>
        <p v-if="error" class="rounded-2xl bg-[var(--sb-simulated-bg)] p-3 text-lg font-bold text-[var(--sb-simulated)]" role="alert">
          {{ error }}
        </p>
        <TurnstileBox v-if="open" @token="token = $event" />
      </div>
    </template>
    <template #footer>
      <div class="flex w-full flex-col gap-2">
        <UButton block size="xl" icon="i-lucide-send" :loading="busy || token === null" :disabled="!picked.length" @click="submit">
          {{ token === null ? '安全檢查中…' : picked.length ? `送出 ${picked.length} 個徽章` : '先選一個徽章' }}
        </UButton>
        <UButton block size="lg" variant="ghost" color="neutral" @click="open = false">
          先不要
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
