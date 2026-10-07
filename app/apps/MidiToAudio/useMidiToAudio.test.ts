import { describe, expect, it } from 'vitest'
import { formatDuration, getMidiInfo, parseMidi, renderMidiToWav } from './useMidiToAudio'
import { createMidi, createSoundFont } from './testFixtures'

describe('formatDuration', () => {
  it('formats seconds as m:ss', () => {
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(0)).toBe('0:00')
  })
})

describe('getMidiInfo', () => {
  it('returns duration and track count', () => {
    const info = getMidiInfo(parseMidi(createMidi()))

    expect(info.duration).toBeGreaterThan(0)
    expect(info.tracks).toBeGreaterThan(0)
  })
})

describe('renderMidiToWav', () => {
  it('renders a WAV file with the given sample rate', async () => {
    const wav = await renderMidiToWav(parseMidi(createMidi()), createSoundFont(), { sampleRate: 22050 })
    const view = new DataView(wav)

    expect(new TextDecoder().decode(wav.slice(0, 4))).toBe('RIFF')
    expect(new TextDecoder().decode(wav.slice(8, 12))).toBe('WAVE')
    expect(view.getUint32(24, true)).toBe(22050)
  })

  it('reports progress up to 1', async () => {
    const progress: number[] = []
    await renderMidiToWav(parseMidi(createMidi()), createSoundFont(), {
      sampleRate: 22050,
      onProgress: ratio => progress.push(ratio),
    })

    expect(progress.at(-1)).toBe(1)
  })
})
