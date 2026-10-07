import {
  BasicMIDI,
  SoundBankLoader,
  SpessaSynthProcessor,
  SpessaSynthSequencer,
  audioToWav,
} from 'spessasynth_core'

export type RenderOptions = {
  sampleRate: number
  onProgress?: (ratio: number) => void
}

export type MidiInfo = {
  duration: number
  tracks: number
}

const bufferSize = 128
const tailSeconds = 2

export function parseMidi(buffer: ArrayBuffer) {
  return BasicMIDI.fromArrayBuffer(buffer)
}

export function getMidiInfo(midi: BasicMIDI): MidiInfo {
  return { duration: midi.duration, tracks: midi.tracks.length }
}

export function formatDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

const yieldToUi = () => new Promise<void>(resolve => setTimeout(resolve))

export async function renderMidiToWav(midi: BasicMIDI, soundFont: ArrayBuffer, options: RenderOptions) {
  const { sampleRate, onProgress } = options
  const synth = new SpessaSynthProcessor(sampleRate, { eventsEnabled: false })
  synth.soundBankManager.addSoundBank(SoundBankLoader.fromArrayBuffer(soundFont.slice(0)), 'main')
  await synth.processorInitialized
  synth.setSystemParameter('autoAllocateVoices', true)

  const sequencer = new SpessaSynthSequencer(synth)
  sequencer.loadNewSongList([midi])
  sequencer.play()

  const sampleCount = Math.ceil(sampleRate * (midi.duration + tailSeconds))
  const left = new Float32Array(sampleCount)
  const right = new Float32Array(sampleCount)
  const yieldInterval = Math.floor(sampleRate / bufferSize)
  let filled = 0
  let iteration = 0
  while (filled < sampleCount) {
    sequencer.processTick()
    const size = Math.min(bufferSize, sampleCount - filled)
    synth.process(left, right, filled, size)
    filled += size
    iteration++
    if (iteration % yieldInterval === 0) {
      onProgress?.(filled / sampleCount)
      await yieldToUi()
    }
  }
  onProgress?.(1)

  return audioToWav([left, right], sampleRate)
}

export type ConvertStatus = 'idle' | 'loading-font' | 'rendering' | 'done' | 'error'

export function useMidiToAudio() {
  const soundFont = useSoundFont()
  const midi = shallowRef<BasicMIDI | null>(null)
  const info = shallowRef<MidiInfo | null>(null)
  const fileName = shallowRef('')
  const sampleRate = shallowRef(44100)
  const status = shallowRef<ConvertStatus>('idle')
  const renderProgress = shallowRef(0)
  const error = shallowRef('')
  const wavUrl = shallowRef('')

  const revoke = () => {
    if (wavUrl.value) {
      URL.revokeObjectURL(wavUrl.value)
      wavUrl.value = ''
    }
  }

  const loadFile = async (file: File | undefined) => {
    if (!file) {
      return
    }

    revoke()
    error.value = ''
    status.value = 'idle'
    try {
      const parsed = parseMidi(await file.arrayBuffer())
      midi.value = parsed
      info.value = getMidiInfo(parsed)
      fileName.value = file.name
    } catch {
      midi.value = null
      info.value = null
      fileName.value = ''
      status.value = 'error'
      error.value = 'invalid-midi'
    }
  }

  const convert = async () => {
    if (!midi.value) {
      return
    }

    revoke()
    error.value = ''
    renderProgress.value = 0
    try {
      status.value = 'loading-font'
      const font = await soundFont.load()
      status.value = 'rendering'
      const wav = await renderMidiToWav(midi.value, font, {
        sampleRate: sampleRate.value,
        onProgress: (ratio) => {
          renderProgress.value = ratio
        },
      })
      wavUrl.value = URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }))
      status.value = 'done'
    } catch {
      status.value = 'error'
      error.value = 'convert-failed'
    }
  }

  const download = () => {
    if (!wavUrl.value) {
      return
    }

    const link = document.createElement('a')
    link.href = wavUrl.value
    link.download = `${fileName.value.replace(/\.[^.]+$/, '') || 'audio'}.wav`
    link.click()
  }

  onScopeDispose(revoke)

  return {
    info,
    fileName,
    sampleRate,
    status,
    error,
    wavUrl,
    fontProgress: soundFont.progress,
    renderProgress,
    loadFile,
    convert,
    download,
  }
}
