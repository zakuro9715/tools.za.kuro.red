import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import MidiToAudioRenderControls from './MidiToAudioRenderControls.vue'

const props = { sampleRate: 44100, fontProgress: 0, renderProgress: 0 }

describe('MidiToAudioRenderControls', () => {
  it('emits convert when the convert button is clicked', async () => {
    const wrapper = await mountSuspended(MidiToAudioRenderControls, { props: { ...props, status: 'idle' } })

    await wrapper.get('[data-testid="render-controls-convert"]').trigger('click')

    expect(wrapper.emitted('convert')).toHaveLength(1)
  })

  it('shows the download button only when done', async () => {
    const idle = await mountSuspended(MidiToAudioRenderControls, { props: { ...props, status: 'idle' } })
    const done = await mountSuspended(MidiToAudioRenderControls, { props: { ...props, status: 'done' } })

    expect(idle.find('[data-testid="render-controls-download"]').exists()).toBe(false)
    await done.get('[data-testid="render-controls-download"]').trigger('click')
    expect(done.emitted('download')).toHaveLength(1)
  })

  it('shows progress while rendering', async () => {
    const wrapper = await mountSuspended(MidiToAudioRenderControls, { props: { ...props, status: 'rendering', renderProgress: 0.5 } })

    expect(wrapper.find('[data-testid="render-controls-progress"]').exists()).toBe(true)
  })

  it('shows a player without downloading when done', async () => {
    const wrapper = await mountSuspended(MidiToAudioRenderControls, { props: { ...props, status: 'done', audioUrl: 'blob:test' } })

    expect(wrapper.get('[data-testid="render-controls-player"]').attributes('src')).toBe('blob:test')
  })
})
