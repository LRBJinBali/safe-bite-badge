<script setup lang="ts">
const embed = useEmbed()
const { isDemo } = useDemo()
</script>

<template>
  <div class="min-h-dvh overflow-x-clip" :class="{ 'sb-embed': embed }">
    <header class="sb-header sticky top-0 z-30 border-b border-[var(--sb-sage)] bg-[var(--sb-bg)]/95 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2">
        <NuxtLink to="/" class="flex shrink-0 items-center gap-2 whitespace-nowrap text-xl font-black text-[var(--sb-moss)]">
          <UIcon name="i-lucide-leaf" class="size-7" /> 安心標章
          <span class="hidden text-sm font-normal text-[var(--sb-ink-soft)] sm:inline">Safe-Bite Badge</span>
        </NuxtLink>
        <div class="flex items-center gap-1 whitespace-nowrap">
          <SimTag v-if="isDemo" class="!hidden sm:!inline-flex">
            示範模式 demo
          </SimTag>
          <UButton to="/diner" variant="ghost" color="neutral" size="lg">
            食客
          </UButton>
          <UButton to="/vendor" variant="ghost" color="neutral" size="lg">
            攤商
          </UButton>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-6">
      <slot />
    </main>
    <footer class="sb-footer mx-auto max-w-5xl px-4 pb-10 pt-4">
      <UnofficialNote />
      <p class="mt-1 text-sm text-[var(--sb-ink-soft)]">
        官方認證資料為真實公開名單;徽章票數含<SimTag class="mx-1" />種子資料。
      </p>
    </footer>
  </div>
</template>
