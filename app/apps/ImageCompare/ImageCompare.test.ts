import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ImageCompare from './ImageCompare.vue'

describe('ImageCompare', () => {
  it('switches comparison orientation', async () => {
    const wrapper = await mountSuspended(ImageCompare)

    await wrapper.get('[data-testid="image-compare-horizontal"]').trigger('click')

    expect(wrapper.findAll('[data-testid="image-compare-stage"] img')[1]!.attributes('style')).toContain('polygon(0 50%')
  })

  it('toggles the image fit mode', async () => {
    const wrapper = await mountSuspended(ImageCompare)

    await wrapper.get('[data-testid="image-compare-fit"]').trigger('click')

    expect(wrapper.findAll('[data-testid="image-compare-stage"] img')[0]!.classes()).toContain('object-contain')
  })
})
