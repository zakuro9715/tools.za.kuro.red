import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ImageCompareStage from './ImageCompareStage.vue'

describe('ImageCompareStage', () => {
  it('emits the bounded position selected on the stage', async () => {
    const wrapper = await mountSuspended(ImageCompareStage, {
      props: {
        imageAUrl: 'a.png',
        imageBUrl: 'b.png',
        orientation: 'vertical',
        fit: 'cover',
        position: 0.5,
      },
    })
    const stage = wrapper.get('[data-testid="image-compare-stage"]')
    Object.defineProperty(stage.element, 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, width: 100, height: 100 }),
    })

    await stage.trigger('pointerdown', { clientX: 25, clientY: 25, pointerId: 1 })

    expect(wrapper.emitted('setPosition')).toEqual([[0.25]])
  })
})
