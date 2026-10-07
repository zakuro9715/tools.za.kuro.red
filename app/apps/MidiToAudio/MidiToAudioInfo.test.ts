import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import MidiToAudioInfo from './MidiToAudioInfo.vue'

describe('MidiToAudioInfo', () => {
  it('shows file name, duration and track count', async () => {
    const wrapper = await mountSuspended(MidiToAudioInfo, {
      props: { fileName: 'song.mid', info: { duration: 65, tracks: 3 } },
    })

    expect(wrapper.get('[data-testid="midi-info-file"]').text()).toBe('song.mid')
    expect(wrapper.get('[data-testid="midi-info-duration"]').text()).toBe('1:05')
    expect(wrapper.get('[data-testid="midi-info-tracks"]').text()).toBe('3')
  })
})
