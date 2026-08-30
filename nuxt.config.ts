// https://nuxt.com/docs/api/configuration/nuxt-config
const baseUrl = 'https://tools.za.kuro.red'
export default defineNuxtConfig({
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

  site: {
    url: baseUrl,
    name: 'tools.za.kuro.red'
  },

  routeRules: {
    '/': { prerender: true }
  },
  compatibilityDate: '2026-06-30',


  components: [
    '~/components',
    '~/apps/'
  ],

  imports: {
    dirs: ['~/apps/**/*.ts']
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    baseUrl,
    locales: [
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'ja', iso: 'ja-JP', name: '日本語' }
    ],
    defaultLocale: 'ja',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected'
    },
    strategy: 'prefix_except_default'
  }
})
