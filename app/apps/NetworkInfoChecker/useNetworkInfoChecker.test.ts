import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import { useNetworkInfoChecker } from './useNetworkInfoChecker'

const Harness = defineComponent({ setup: useNetworkInfoChecker, template: '<div />' })

describe('useNetworkInfoChecker', () => {
  it('starts with a checking status and no ping', async () => {
    const wrapper = await mountSuspended(Harness)

    expect(wrapper.vm.status).toBe('checking')
    expect(wrapper.vm.ping).toBeNull()
    expect(wrapper.vm.statusColor).toBe('bg-muted')
  })
})
