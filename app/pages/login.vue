<script setup lang="ts">
import type { Role } from '~~/shared/types'

definePageMeta({ title: '登入' })

const route = useRoute()
const toast = useToast()
const { refresh } = useAuth()

const role = ref<Role>(route.query.role === 'city' ? 'city' : 'vendor')
const EXAMPLE: Record<Role, string> = { vendor: 'demo-vendor@example.test', city: 'demo-city@example.test' }
const email = ref(EXAMPLE[role.value])
const code = ref('')
const sent = ref(false)
const busy = ref(false)
const error = ref('')

const roleItems = [
  { value: 'vendor', label: '我是攤商', icon: 'i-lucide-store' },
  { value: 'city', label: '市府(示範)', icon: 'i-lucide-landmark' },
]

watch(role, (r) => {
  if (Object.values(EXAMPLE).includes(email.value))
    email.value = EXAMPLE[r]
  code.value = ''
  sent.value = false
  error.value = ''
})

const next = computed(() => {
  const n = route.query.next
  return typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : `/${role.value}`
})

function fail(e: unknown) {
  const err = e as { statusMessage?: string, data?: { statusMessage?: string } }
  const msg = err.data?.statusMessage ?? err.statusMessage ?? ''
  error.value = msg.includes('example.test') ? '只能使用 @example.test 結尾的虛構信箱' : msg.includes('Wrong') ? '驗證碼不正確或已過期,請重新取得' : msg.includes('Slow') ? '請稍等一下再試' : '登入沒有成功,請再試一次'
}

async function getCode() {
  busy.value = true
  error.value = ''
  try {
    const r = await $fetch<{ code: string }>('/api/auth/code', { method: 'POST', body: { email: email.value, role: role.value } })
    code.value = r.code
    sent.value = true
  }
  catch (e) {
    fail(e)
    return false
  }
  finally { busy.value = false }
  return true
}

async function verify() {
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/verify', { method: 'POST', body: { email: email.value, role: role.value, code: code.value } })
    await refresh()
    toast.add({ title: '登入成功', color: 'success' })
    await navigateTo(next.value)
  }
  catch (e) { fail(e) }
  finally { busy.value = false }
}

async function quick() {
  if (await getCode())
    await verify()
}

useHead({ title: '登入 · 安心標章' })
</script>

<template>
  <div class="mx-auto max-w-xl space-y-6">
    <h1 class="text-4xl font-black">
      登入
    </h1>

    <div class="flex items-start gap-3 rounded-2xl border-2 border-[var(--sb-simulated)] bg-[var(--sb-simulated-bg)] p-4 text-lg font-bold text-[var(--sb-simulated)]" role="note">
      <UIcon name="i-lucide-flask-conical" class="mt-1 size-6 shrink-0" />
      <p>
        <SimTag class="mr-1" />
        模擬登入:不會寄出任何信,只接受 @example.test
      </p>
    </div>

    <section class="sb-card-white space-y-5 p-6">
      <div class="grid grid-cols-2 gap-3" role="radiogroup" aria-label="選擇身分">
        <UButton
          v-for="r in roleItems"
          :key="r.value"
          :icon="r.icon"
          size="xl"
          block
          :variant="role === r.value ? 'solid' : 'outline'"
          :color="role === r.value ? 'primary' : 'neutral'"
          role="radio"
          :aria-checked="role === r.value"
          @click="role = r.value as Role"
        >
          {{ r.label }}
        </UButton>
      </div>

      <UFormField label="虛構信箱(示範用)" size="xl" :ui="{ label: 'text-lg font-bold' }">
        <UInput v-model="email" type="email" size="xl" class="w-full" autocomplete="off" inputmode="email" :disabled="busy" />
      </UFormField>

      <UButton v-if="!sent" size="xl" block icon="i-lucide-mail" :loading="busy" @click="getCode">
        取得驗證碼
      </UButton>

      <template v-else>
        <div class="rounded-2xl bg-[var(--sb-sage)] p-4 text-center">
          <p class="text-lg">
            畫面上的驗證碼(沒有寄信)
          </p>
          <p class="text-4xl font-black tracking-[0.3em]">
            {{ code }}
          </p>
        </div>
        <UFormField label="驗證碼" size="xl" :ui="{ label: 'text-lg font-bold' }">
          <UInput v-model="code" size="xl" class="w-full" inputmode="numeric" maxlength="6" :disabled="busy" />
        </UFormField>
        <UButton size="xl" block icon="i-lucide-log-in" :loading="busy" @click="verify">
          登入
        </UButton>
      </template>

      <p v-if="error" class="text-lg font-bold text-[var(--sb-simulated)]" role="alert">
        {{ error }}
      </p>

      <USeparator />

      <UButton size="xl" block color="neutral" variant="soft" icon="i-lucide-zap" :disabled="busy" @click="quick">
        示範登入
      </UButton>
      <p class="text-center text-base text-[var(--sb-ink-soft)]">
        一鍵完成取得驗證碼與登入。登入不會讓任何人認領或修改真實攤位。
      </p>
    </section>
  </div>
</template>
