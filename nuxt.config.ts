export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@vueuse/nuxt', '@nuxt/eslint', 'nitro-cloudflare-dev'],
  css: ['~/assets/css/main.css'],
  colorMode: { preference: 'light', fallback: 'light' },
  eslint: { config: { standalone: false } },
  routeRules: { '/api/**': { cors: false } },
  runtimeConfig: {
    adminKey: '', // NUXT_ADMIN_KEY: when set, /admin needs ?key=
    turnstileSecret: '', // NUXT_TURNSTILE_SECRET: when empty, awards skip the check
    public: {
      mapboxToken: '', // NUXT_PUBLIC_MAPBOX_TOKEN
      mapboxStyle: 'mapbox://styles/mapbox/light-v11', // NUXT_PUBLIC_MAPBOX_STYLE: swap for your Studio style
      turnstileSiteKey: '', // NUXT_PUBLIC_TURNSTILE_SITE_KEY
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant-TW' },
      title: '安心標章 Safe-Bite Badge',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: { deployConfig: true, nodeCompat: true },
  },
  typescript: { tsConfig: { compilerOptions: { resolveJsonModule: true } } },
})
