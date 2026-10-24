<script setup lang="ts">
/** One big tick row. Done is shown by a check icon and the words 已完成, never by colour alone. */
defineProps<{ title: string, hint?: string, checked: boolean, no?: number, busy?: boolean }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <div class="rounded-2xl border-2 bg-white p-4" :class="checked ? 'border-[var(--sb-moss)]' : 'border-[var(--sb-sage)]'">
    <button
      type="button"
      role="checkbox"
      :aria-checked="checked"
      :disabled="busy"
      class="flex w-full items-start gap-4 text-left"
      @click="$emit('toggle')"
    >
      <span
        class="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border-2"
        :class="checked ? 'border-[var(--sb-moss)] bg-[var(--sb-moss)] text-white' : 'border-[var(--sb-ink-soft)] bg-white'"
      >
        <UIcon v-if="checked" name="i-lucide-check" class="size-6" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block text-xl font-bold leading-snug">
          <span v-if="no" class="mr-1 text-[var(--sb-ink-soft)]">{{ no }}.</span>{{ title }}
        </span>
        <span v-if="hint" class="mt-1 block text-lg text-[var(--sb-ink-soft)]">{{ hint }}</span>
      </span>
      <span v-if="checked" class="shrink-0 pt-1 text-base font-bold text-[var(--sb-moss)]">已完成</span>
    </button>
    <div v-if="$slots.default" class="mt-3 pl-[3.25rem]">
      <slot />
    </div>
  </div>
</template>
