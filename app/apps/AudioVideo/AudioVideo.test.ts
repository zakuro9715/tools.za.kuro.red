import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AudioVideo from './AudioVideo.vue'

describe('AudioVideo', () => {
  it('allows users to edit track metadata', async () => {
    const wrapper = await mountSuspended(AudioVideo)
    const title = wrapper.get('[data-testid="audio-video-title"]')
    const artist = wrapper.get('[data-testid="audio-video-artist"]')

    await title.setValue('Track title')
    await artist.setValue('Artist name')

    expect((title.element as HTMLInputElement).value).toBe('Track title')
    expect((artist.element as HTMLInputElement).value).toBe('Artist name')
  })

  it('does not enable playback without an audio file', async () => {
    const wrapper = await mountSuspended(AudioVideo)

    expect(wrapper.get('[data-testid="audio-video-play"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-testid="audio-video-stop"]').attributes('disabled')).toBeDefined()
  })
})
