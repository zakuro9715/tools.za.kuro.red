import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import MidiToAudioFileInput from './MidiToAudioFileInput.vue'

describe('MidiToAudioFileInput', () => {
  it('emits the selected file', async () => {
    const wrapper = await mountSuspended(MidiToAudioFileInput)
    const input = wrapper.get('[data-testid="midi-file-input"]')
    const file = new File(['x'], 'a.mid')

    Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
    await input.trigger('change')

    expect(wrapper.emitted('select')?.[0]).toEqual([file])
  })
})
