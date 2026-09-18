import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import NetworkInfoChecker from './NetworkInfoChecker.vue'

describe('NetworkInfoChecker', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders network status and refresh control', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }))
    const wrapper = await mountSuspended(NetworkInfoChecker)

    expect(wrapper.find('[data-testid="network-status"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="network-ping"]').text()).toContain('ms')
    expect(wrapper.find('[data-testid="network-refresh"]').exists()).toBe(true)
  })
})
