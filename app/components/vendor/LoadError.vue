<script setup lang="ts">
const to = useEmbedTo()
</script>

<template>
  <div class="sb-card space-y-3 p-6">
    <p class="text-2xl font-black">
      找不到這個練習攤位
    </p>
    <p class="text-xl text-[var(--sb-ink-soft)]">
      它可能屬於另一個登入帳號。請回到攤商首頁,選一個自己的練習攤位。
    </p>
    <UButton :to="to('/vendor', { mode: 'prepare' })" size="xl">
      回到攤商首頁
    </UButton>
  </div>
</template>
