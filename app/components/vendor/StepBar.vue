<script setup lang="ts">
import { VENDOR_STEPS } from '~~/shared/readiness'

/** 1 檢查 → 2 登記 → 3 預約訪視 → 4 預覽. Every step is a link, so people can jump around. */
const props = defineProps<{ current: 1 | 2 | 3 | 4, venueId?: string }>()
const to = useEmbedTo()
const link = (path: string) => to(path, props.venueId ? { venue: props.venueId } : {})
</script>

<template>
  <nav aria-label="步驟" class="sb-card px-3 py-3 sm:px-5">
    <ol class="grid grid-cols-4 gap-1 sm:gap-3">
      <li v-for="s in VENDOR_STEPS" :key="s.no">
        <NuxtLink
          :to="link(s.path)"
          class="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-base font-bold sm:flex-row sm:justify-center sm:gap-2 sm:text-lg"
          :class="s.no === current ? 'bg-[var(--sb-moss)] text-white' : 'text-[var(--sb-ink)] hover:bg-white/60'"
          :aria-current="s.no === current ? 'step' : undefined"
        >
          <span
            class="grid size-8 shrink-0 place-items-center rounded-full border-2 text-base"
            :class="s.no === current ? 'border-white' : s.no < current ? 'border-[var(--sb-moss)] bg-[var(--sb-moss)] text-white' : 'border-[var(--sb-ink-soft)]'"
          >
            <UIcon v-if="s.no < current" name="i-lucide-check" class="size-5" />
            <template v-else>{{ s.no }}</template>
          </span>
          <span>{{ s.title }}</span>
        </NuxtLink>
      </li>
    </ol>
  </nav>
</template>
