import { describe, expect, it } from 'vitest'
import { createWaveform } from './useAudioVideo'

describe('createWaveform', () => {
  it('creates a normalized waveform from audio samples', () => {
    const waveform = createWaveform(new Float32Array([0, 0.5, -1, 0.25]))

    expect(waveform).toHaveLength(130)
    expect(Math.max(...waveform)).toBe(1)
    expect(Math.min(...waveform)).toBeGreaterThanOrEqual(0)
  })

  it('creates a fallback waveform when no audio is loaded', () => {
    expect(createWaveform()).toHaveLength(130)
  })
})
