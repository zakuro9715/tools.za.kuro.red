import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import WalkingCalc from './WalkingCalc.vue'

describe('WalkingCalc', () => {
  it('converts speed to pace', async () => {
    const wrapper = await mountSuspended(WalkingCalc)

    await wrapper.get('[data-testid="walking-conversion-speed"]').setValue('6')

    expect((wrapper.get('[data-testid="walking-conversion-pace-minutes"]').element as HTMLInputElement).value).toBe('10')
    expect((wrapper.get('[data-testid="walking-conversion-pace-seconds"]').element as HTMLInputElement).value).toBe('00')
  })

  it('calculates time from distance and pace, then clears the calculation', async () => {
    const wrapper = await mountSuspended(WalkingCalc)

    await wrapper.get('[data-testid="walking-distance"]').setValue('5')
    await wrapper.get('[data-testid="walking-pace-minutes"]').setValue('10')

    expect((wrapper.get('[data-testid="walking-time-minutes"]').element as HTMLInputElement).value).toBe('50')
    expect(wrapper.get('[data-testid="walking-time-indicator"]').text()).toContain('自動計算')

    await wrapper.get('[data-testid="walking-clear"]').trigger('click')
    expect((wrapper.get('[data-testid="walking-distance"]').element as HTMLInputElement).value).toBe('')
    expect(wrapper.get('[data-testid="walking-distance-indicator"]').text()).toContain('未入力')
  })
})
