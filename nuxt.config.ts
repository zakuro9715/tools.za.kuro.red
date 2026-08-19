// https://nuxt.com/docs/api/configuration/nuxt-config
const baseUrl = 'https://tools.za.kuro.red'
export default defineNuxtConfig({
  compatibilityDate: '2026-06-30',
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/a11y',
    '@nuxt/hints',
    '@nuxtjs/seo',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  site: {
    url: baseUrl,
    name: 'tools.za.kuro.red',
  },

  i18n: {
    baseUrl,
    locales: [
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'ja', iso: 'ja-JP', name: '日本語' },
    ],
    defaultLocale: 'ja',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
    },
    strategy: 'prefix_except_default',
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
