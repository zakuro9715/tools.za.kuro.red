import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ImageResizePreview from './ImageResizePreview.vue'

describe('ImageResizePreview', () => {
  it('displays source and output dimensions', async () => {
    const wrapper = await mountSuspended(ImageResizePreview, {
      props: {
        previewUrl: 'data:image/png;base64,',
        background: 'transparent',
        originalWidth: 100,
        originalHeight: 50,
        originalSize: '1 KB',
        width: 200,
        height: 100,
        outputSize: '2 KB',
      },
    })

    expect(wrapper.get('[data-testid="image-resize-dimensions"]').text()).toContain('100')
    expect(wrapper.get('[data-testid="image-resize-preview"]').attributes('src')).toBe('data:image/png;base64,')
    expect(wrapper.get('[data-testid="image-resize-preview-stage"]').classes()).toContain('preview-stage--transparent')
    expect(wrapper.get('[data-testid="image-resize-preview-stage"]').attributes('style')).toContain('width: 200px')
    expect(wrapper.get('[data-testid="image-resize-preview-stage"]').attributes('style')).toContain('aspect-ratio: 200 / 100')
  })
})
