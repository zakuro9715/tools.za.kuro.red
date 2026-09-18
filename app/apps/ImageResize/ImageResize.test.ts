import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ImageResize from './ImageResize.vue'

describe('ImageResize', () => {
  it('shows a clear error for a non-image file', async () => {
    const wrapper = await mountSuspended(ImageResize)
    const input = wrapper.get('[data-testid="image-resize-file-input"]')
    const file = new File(['text'], 'note.txt', { type: 'text/plain' })

    Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
    await input.trigger('change')

    expect(wrapper.get('[data-testid="image-resize-error"]').text()).not.toBe('')
  })
})
