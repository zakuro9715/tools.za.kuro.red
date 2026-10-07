import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import MidiToAudio from './MidiToAudio.vue'
import { createMidi, stubSoundFontFetch } from './testFixtures'

const selectFile = async (wrapper: Awaited<ReturnType<typeof mountSuspended>>, file: File) => {
  const input = wrapper.get('[data-testid="midi-file-input"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
  await input.trigger('change')
  await vi.waitFor(() => expect(wrapper.find('[data-testid="midi-info"]').exists() || wrapper.find('[data-testid="midi-to-audio-error"]').exists()).toBe(true))
}

describe('MidiToAudio', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows an error for an invalid MIDI file', async () => {
    const wrapper = await mountSuspended(MidiToAudio)

    await selectFile(wrapper, new File(['not midi'], 'bad.mid'))

    expect(wrapper.get('[data-testid="midi-to-audio-error"]').text()).not.toBe('')
  })

  it('converts a MIDI file to WAV', async () => {
    stubSoundFontFetch()
    URL.createObjectURL = vi.fn(() => 'blob:test')
    URL.revokeObjectURL = vi.fn()
    const wrapper = await mountSuspended(MidiToAudio)

    await selectFile(wrapper, new File([createMidi()], 'song.mid'))
    expect(wrapper.get('[data-testid="midi-info-file"]').text()).toBe('song.mid')

    await wrapper.get('[data-testid="render-controls-convert"]').trigger('click')
    await vi.waitFor(async () => {
      await flushPromises()
      expect(wrapper.find('[data-testid="render-controls-download"]').exists()).toBe(true)
      expect(wrapper.get('[data-testid="render-controls-player"]').attributes('src')).toBe('blob:test')
    }, { timeout: 10000 })
  })

  it('shows an error when the sound font cannot be downloaded', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })))
    const wrapper = await mountSuspended(MidiToAudio)

    await selectFile(wrapper, new File([createMidi()], 'song.mid'))
    await wrapper.get('[data-testid="render-controls-convert"]').trigger('click')

    await vi.waitFor(() => expect(wrapper.find('[data-testid="midi-to-audio-error"]').exists()).toBe(true))
  })
})
