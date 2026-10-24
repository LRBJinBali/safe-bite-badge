<script setup lang="ts">
import { BADGES } from '~~/shared/badges'

useHead({ title: '安心標章 Safe-Bite Badge' })

const { data: counter, refresh } = useFetch('/api/counter', { lazy: true, server: false })
// A brand-new database is seeded in the background on first visit: look once more.
onMounted(() => setTimeout(() => {
  if (!counter.value?.total)
    refresh()
}, 2500))

const steps = [
  { icon: 'i-lucide-map-pin', zh: '找到好店', en: 'Find an eatery', text: '在地圖上挑夜市或行政區,打開喜歡的攤位或餐廳。' },
  { icon: 'i-lucide-heart-handshake', zh: '送出徽章', en: 'Send badges', text: '每個攤位最多送四種,為它的好加油。' },
  { icon: 'i-lucide-store', zh: '攤商看見', en: 'The stall sees it', text: '攤商端會看到本月新收到的徽章。' },
]
</script>

<template>
  <div class="relative space-y-14 pb-6">
    <!-- soft leaf shapes in the background -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 -top-6 -z-10 h-[34rem] overflow-hidden">
      <div class="absolute -left-24 -top-10 size-72 bg-[var(--sb-sage)]" style="border-radius: 0 100% 0 100%" />
      <div class="absolute -right-16 top-20 size-56 rotate-12 bg-moss-100" style="border-radius: 0 100% 0 100%" />
      <div class="absolute left-1/2 top-64 size-40 -translate-x-1/2 -rotate-12 bg-[var(--sb-sage)]/70" style="border-radius: 100% 0 100% 0" />
    </div>

    <!-- what is this -->
    <section class="space-y-3 pt-2 text-center sm:space-y-4 sm:pt-4">
      <div class="mx-auto grid size-14 place-items-center bg-[var(--sb-moss)] text-white sm:size-20" style="border-radius: 0 100% 0 100%">
        <UIcon name="i-lucide-leaf" class="size-8 sm:size-11" />
      </div>
      <h1 class="text-4xl font-black leading-tight text-[var(--sb-moss)] sm:text-6xl">
        安心標章
      </h1>
      <p class="mx-auto max-w-2xl text-2xl font-bold leading-snug sm:text-3xl">
        幫夜市攤位和餐廳送上四種社區徽章,只慶祝、不批評
      </p>
      <p class="text-base text-[var(--sb-ink-soft)] sm:text-lg">
        Award four community badges to night-market stalls and restaurants. We only celebrate.
      </p>
      <p v-if="counter?.total" class="inline-flex flex-wrap items-center justify-center gap-x-2 rounded-2xl bg-white px-4 py-2 text-base sm:text-lg font-bold text-[var(--sb-moss)] shadow-sm">
        <UIcon name="i-lucide-sparkles" class="size-5" />
        本月台北已送出 {{ counter.total }} 個徽章
        <SimTag v-if="counter.simulatedIncluded">
          含模擬票
        </SimTag>
      </p>
    </section>

    <!-- two doors -->
    <section aria-label="選擇身分 Choose your door" class="grid gap-6 md:grid-cols-2">
      <NuxtLink
        to="/diner"
        class="group relative flex min-h-64 flex-col justify-between gap-6 overflow-hidden bg-[var(--sb-moss)] p-6 text-white sm:p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--sb-badge-detour)]"
        style="border-radius: 3rem 1.5rem 3rem 1.5rem"
      >
        <div class="flex items-start gap-5">
          <span class="grid size-14 shrink-0 place-items-center sm:size-20 bg-white/15" style="border-radius: 0 100% 0 100%">
            <UIcon name="i-lucide-utensils" class="size-8 sm:size-11" />
          </span>
          <div>
            <p class="text-4xl font-black whitespace-nowrap sm:text-5xl">
              我是食客
            </p>
            <p class="mt-1 text-xl font-semibold text-moss-100">
              I'm a diner
            </p>
          </div>
        </div>
        <p class="text-xl leading-snug">
          逛夜市、找餐廳,送出徽章為它加油。不用註冊。
        </p>
        <span class="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-xl font-black text-[var(--sb-moss)]">
          開始逛 Start <UIcon name="i-lucide-arrow-right" class="size-6 transition group-hover:translate-x-1" />
        </span>
      </NuxtLink>

      <NuxtLink
        to="/vendor"
        class="group relative flex min-h-64 flex-col justify-between gap-6 overflow-hidden border-4 border-[var(--sb-moss)] bg-[var(--sb-sage)] p-6 text-[var(--sb-ink)] sm:p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--sb-badge-detour)]"
        style="border-radius: 1.5rem 3rem 1.5rem 3rem"
      >
        <div class="flex items-start gap-5">
          <span class="grid size-14 shrink-0 place-items-center sm:size-20 bg-[var(--sb-moss)] text-white" style="border-radius: 100% 0 100% 0">
            <UIcon name="i-lucide-store" class="size-8 sm:size-11" />
          </span>
          <div>
            <p class="text-4xl font-black whitespace-nowrap sm:text-5xl">
              我是攤商
            </p>
            <p class="mt-1 text-xl font-semibold text-[var(--sb-ink-soft)]">
              I run a food stall
            </p>
          </div>
        </div>
        <p class="text-xl leading-snug">
          看看自己的攤位收到什麼,檢查準備度、了解登記、預約訪視。
        </p>
        <span class="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--sb-moss)] px-6 py-3 text-xl font-black text-white">
          攤商入口 Enter <UIcon name="i-lucide-arrow-right" class="size-6 transition group-hover:translate-x-1" />
        </span>
      </NuxtLink>
    </section>

    <!-- four badges -->
    <section class="space-y-6">
      <div class="space-y-1 text-center">
        <h2 class="text-4xl font-black">
          四種徽章,四句溫暖的話
        </h2>
        <p class="text-lg text-[var(--sb-ink-soft)]">
          Four badges, each one a kind word. Shape, icon and name always go together.
        </p>
      </div>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="b in BADGES" :key="b.key" class="sb-card-white grid place-items-center px-4 py-6">
          <BadgeMark :badge="b.key" size="lg" hint />
        </div>
      </div>
    </section>

    <!-- how it works -->
    <section class="space-y-6">
      <h2 class="text-center text-4xl font-black">
        怎麼運作
        <span class="block text-lg font-normal text-[var(--sb-ink-soft)]">How it works</span>
      </h2>
      <ol class="grid gap-5 md:grid-cols-3">
        <li v-for="(s, i) in steps" :key="s.zh" class="sb-card space-y-2 p-6">
          <div class="flex items-center gap-3">
            <span class="grid size-12 place-items-center rounded-full bg-[var(--sb-moss)] text-2xl font-black text-white">{{ i + 1 }}</span>
            <UIcon :name="s.icon" class="size-8 text-[var(--sb-moss)]" />
          </div>
          <p class="text-2xl font-black">
            {{ s.zh }}
            <span class="block text-base font-normal text-[var(--sb-ink-soft)]">{{ s.en }}</span>
          </p>
          <p class="text-lg leading-snug">
            {{ s.text }}
          </p>
        </li>
      </ol>
    </section>

    <!-- unofficial + small links -->
    <section class="space-y-4 text-center">
      <p class="mx-auto inline-flex max-w-2xl items-start gap-2 rounded-2xl bg-white px-5 py-3 text-left text-base text-[var(--sb-ink-soft)] shadow-sm">
        <UIcon name="i-lucide-info" class="mt-0.5 size-5 shrink-0 text-[var(--sb-moss)]" />
        <span>
          <strong class="text-[var(--sb-ink)]">只有拿到衛生局「食安微笑標章」的攤位與餐廳才會出現。</strong>
          <span class="block"><strong class="text-[var(--sb-ink)]">非官方</strong>:依臺北市衛生局公開名單製作,與衛生局無關,也不會發出或模仿官方標章。</span>
          <span class="block">Unofficial, built on public Health Department lists.</span>
        </span>
      </p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <UButton to="/demo" size="lg" icon="i-lucide-play" variant="soft">
          示範模式 Demo
        </UButton>
        <UButton to="/login?role=city" size="md" color="neutral" variant="link" icon="i-lucide-landmark">
          市政人員登入 City sign-in
        </UButton>
        <UButton to="/admin" size="md" color="neutral" variant="link" icon="i-lucide-layout-dashboard">
          管理總覽 Admin
        </UButton>
      </div>
    </section>
  </div>
</template>
