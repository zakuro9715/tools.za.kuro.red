import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import SqliteViewer from './SqliteViewer.vue'

describe('SqliteViewer', () => {
  it('loads the sample database through the viewer controls', async () => {
    Object.defineProperty(window, 'initSqlJs', {
      configurable: true,
      value: async () => ({
        Database: class {
          close() {}
          run() {}
          exec() { return [] }
        },
      }),
    })
    const wrapper = await mountSuspended(SqliteViewer)

    expect(wrapper.find('[data-testid="sqlite-upload"]').exists()).toBe(true)
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.get('[data-testid="sqlite-sample"]').trigger('click')
    expect(wrapper.get('[data-testid="sqlite-filename"]').text()).toContain('SampleInmemory.db')
  })
})
