import { vi } from 'vitest'
import { BasicInstrument, BasicPreset, BasicSoundBank, EmptySample, MIDIBuilder } from 'spessasynth_core'

export function createSoundFont() {
  const bank = new BasicSoundBank()
  const sample = new EmptySample()
  sample.name = 'sine'
  sample.setAudioData(new Float32Array(Array.from({ length: 2000 }, (_, i) => Math.sin(i / 5))), 44100)
  sample.originalKey = 60
  sample.loopStart = 0
  sample.loopEnd = 1999
  bank.addSamples(sample)
  const instrument = new BasicInstrument()
  instrument.name = 'sine'
  instrument.createZone(sample)
  bank.addInstruments(instrument)
  const preset = new BasicPreset(bank)
  preset.name = 'sine'
  preset.createZone(instrument)
  bank.addPresets(preset)
  return bank.writeSF2()
}

export function createMidi() {
  const midi = new MIDIBuilder({ name: 'test' })
  midi.noteOn(0, 0, 0, 60, 100)
  midi.noteOff(midi.timeDivision, 0, 0, 60)
  return midi.writeMIDI()
}

export function stubSoundFontFetch(soundFont = createSoundFont()) {
  const fetchMock = vi.fn(async () => new Response(soundFont.slice(0)))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
