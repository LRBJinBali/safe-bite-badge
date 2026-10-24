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
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // Link preview card (LINE, Facebook, Slack, X). Crawlers need an absolute image URL.
        { name: 'description', content: '給拿到食安微笑標章的夜市攤位與餐廳,送上你的社區徽章。非官方,依臺北市衛生局公開名單製作。' },
        { property: 'og:site_name', content: '安心標章 Safe-Bite Badge' },
        { property: 'og:title', content: '安心標章 Safe-Bite Badge' },
        { property: 'og:description', content: '給拿到食安微笑標章的夜市攤位與餐廳,送上你的社區徽章。非官方,依臺北市衛生局公開名單製作。' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'zh_TW' },
        { property: 'og:image', content: 'https://safebitebadge.com/og.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: '安心標章:找一家安心的好店,四種社區徽章。非官方。' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://safebitebadge.com/og.png' },
      ],
    },
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: { deployConfig: true, nodeCompat: true },
  },
  typescript: { tsConfig: { compilerOptions: { resolveJsonModule: true } } },
})
