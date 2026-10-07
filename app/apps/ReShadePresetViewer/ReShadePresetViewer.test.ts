import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ReShadePresetViewer from './ReShadePresetViewer.vue'

describe('ReShadePresetViewer', () => {
  it('updates the generated INI when an effect is disabled', async () => {
    const wrapper = await mountSuspended(ReShadePresetViewer)
    const effect = wrapper.get('[data-testid="reshade-toggle"]')
    await effect.trigger('click')

    expect((wrapper.get('[data-testid="reshade-preview"]').element as HTMLTextAreaElement).value).not.toContain('Techniques=AdaptiveSharpen@AdaptiveSharpen.fx,')
  })
})
