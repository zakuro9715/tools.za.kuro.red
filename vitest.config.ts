import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['app/**/*.test.ts'],
          environment: 'nuxt',
        },
      }),
      await defineVitestProject({
        test: {
          include: ['**/*.browser.test.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      }),
    ],
    onConsoleLog: (s) => {
      return !s.startsWith('<Suspense>')
    },
  },
})
