import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import TextCounterMetric from './TextCounterMetric.vue'

describe('TextCounterMetric', () => {
  it('renders the label, value, and unit', async () => {
    const wrapper = await mountSuspended(TextCounterMetric, {
      props: {
        label: 'Characters',
        value: '1,234',
        unit: 'chars',
      },
    })

    expect(wrapper.text()).toContain('Characters')
    expect(wrapper.text()).toContain('1,234')
    expect(wrapper.text()).toContain('chars')
  })

  it('does not render a unit when one is not provided', async () => {
    const wrapper = await mountSuspended(TextCounterMetric, {
      props: {
        label: 'Lines',
        value: '10',
      },
    })

    expect(wrapper.find('span').exists()).toBe(false)
  })
})
