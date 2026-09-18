import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ReshadePresetViewer from './ReshadePresetViewer.vue'

describe('ReshadePresetViewer', () => {
  it('updates the generated INI when an effect is disabled', async () => {
    const wrapper = await mountSuspended(ReshadePresetViewer)
    const effect = wrapper.get('[data-testid="reshade-toggle"]')
    await effect.trigger('click')

    expect((wrapper.get('[data-testid="reshade-preview"]').element as HTMLTextAreaElement).value).not.toContain('Techniques=AdaptiveSharpen@AdaptiveSharpen.fx,')
  })
})
