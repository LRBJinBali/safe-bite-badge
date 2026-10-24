<script setup lang="ts">
import { badgeByKey } from '~~/shared/badges'

const props = withDefaults(defineProps<{
  badge: string
  size?: 'sm' | 'md' | 'lg'
  /** Text label beside the shape (colour is never the only signal) */
  label?: boolean
  count?: number
  hint?: boolean
}>(), { size: 'md', label: true })

const def = computed(() => badgeByKey(props.badge)!)
const px = computed(() => ({ sm: 40, md: 56, lg: 80 })[props.size])
const shapeStyle = computed(() => {
  const shape = def.value.shape
  const base: Record<string, string> = { background: `var(${def.value.cssVar})`, width: `${px.value}px`, height: `${px.value}px` }
  if (shape === 'diamond') base.clipPath = 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)'
  if (shape === 'squircle') base.borderRadius = '32%'
  if (shape === 'circle') base.borderRadius = '50%'
  if (shape === 'arch') base.borderRadius = '50% 50% 14% 14% / 62% 62% 14% 14%'
  return base
})
</script>

<template>
  <div class="inline-flex items-center gap-3" :class="{ 'flex-col text-center gap-1': size === 'lg' }">
    <span class="grid shrink-0 place-items-center text-[var(--sb-ink)]" :style="shapeStyle" aria-hidden="true">
      <UIcon :name="def.icon" :style="{ width: `${px * 0.5}px`, height: `${px * 0.5}px` }" />
    </span>
    <span v-if="label" class="leading-tight">
      <span class="block font-bold text-[1.05rem]">{{ def.zh }}<span v-if="count !== undefined" class="ml-2 font-black">× {{ count }}</span></span>
      <span class="block text-sm text-[var(--sb-ink-soft)]">{{ def.en }}</span>
      <span v-if="hint" class="block text-sm text-[var(--sb-ink-soft)]">{{ def.hint }}</span>
    </span>
    <span v-else class="sr-only">{{ def.zh }}</span>
  </div>
</template>
