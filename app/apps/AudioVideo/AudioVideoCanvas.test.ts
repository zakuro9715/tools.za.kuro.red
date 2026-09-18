import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AudioVideoCanvas from './AudioVideoCanvas.vue'

describe('AudioVideoCanvas', () => {
  it('provides its canvas to the parent on mount', async () => {
    const wrapper = await mountSuspended(AudioVideoCanvas, {
      props: {
        hasAudio: false,
        isRecording: false,
      },
    })

    expect(wrapper.emitted('ready')?.[0]?.[0]).toBeInstanceOf(HTMLCanvasElement)
    expect(wrapper.find('[data-testid="audio-video-placeholder"]').exists()).toBe(true)
  })
})
