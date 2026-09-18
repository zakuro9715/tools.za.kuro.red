import { computed, onUnmounted, shallowRef, watch } from 'vue'

const waveBarCount = 130

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00'
  }
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

export function createWaveform(samples?: Float32Array) {
  if (!samples?.length) {
    return Array.from({ length: waveBarCount }, (_, index) =>
      Math.max(0.1, Math.abs(Math.sin(index * 0.05) * 0.4 + Math.cos(index * 0.15) * 0.3)),
    )
  }

  const step = Math.max(1, Math.floor(samples.length / waveBarCount))
  const waveform = Array.from({ length: waveBarCount }, (_, index) => {
    let sum = 0
    const start = index * step
    for (let sampleIndex = start; sampleIndex < Math.min(start + step, samples.length); sampleIndex++) {
      sum += Math.abs(samples[sampleIndex] ?? 0)
    }
    return sum / step
  })
  const peak = Math.max(...waveform, 0.0001)
  return waveform.map(value => value / peak)
}

export function useAudioVideo() {
  const canvas = shallowRef<HTMLCanvasElement | null>(null)
  const audioBuffer = shallowRef<AudioBuffer | null>(null)
  const fileName = shallowRef('')
  const title = shallowRef('noname')
  const artist = shallowRef('')
  const waveform = shallowRef(createWaveform())
  const duration = shallowRef(0)
  const currentTime = shallowRef(0)
  const volume = shallowRef(0.8)
  const isPlaying = shallowRef(false)
  const isRecording = shallowRef(false)
  const downloadUrl = shallowRef('')
  const status = shallowRef('')
  const error = shallowRef('')
  const canRecord = shallowRef(false)
  const isDecoding = shallowRef(false)

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let gain: GainNode | null = null
  let source: AudioBufferSourceNode | null = null
  let recorder: MediaRecorder | null = null
  let mediaDestination: MediaStreamAudioDestinationNode | null = null
  let pausedAt = 0
  let startedAt = 0
  let progressTimer: ReturnType<typeof setInterval> | undefined
  let animationFrame: number | undefined
  let previousVolume = 0.8

  if (import.meta.client) {
    try {
      artist.value = localStorage.getItem('audiovideo_saved_artist') ?? ''
    } catch (cause) {
      console.error('Failed to load saved artist.', cause)
    }
  }

  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))
  const progress = computed(() => duration.value ? currentTime.value / duration.value * 100 : 0)
  const compatibility = computed(() => {
    if (!import.meta.client || typeof MediaRecorder === 'undefined') {
      return false
    }
    return MediaRecorder.isTypeSupported('video/webm')
  })

  const ensureAudio = () => {
    if (!import.meta.client) {
      return false
    }
    if (!audioContext) {
      const AudioContextConstructor = window.AudioContext
        || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextConstructor) {
        error.value = 'unsupported'
        return false
      }
      audioContext = new AudioContextConstructor()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      gain = audioContext.createGain()
      gain.gain.setValueAtTime(volume.value, audioContext.currentTime)
      analyser.connect(gain)
      gain.connect(audioContext.destination)
    }
    return true
  }

  const stopSource = () => {
    if (!source) {
      return
    }
    source.onended = null
    try {
      source.stop()
    } catch {
      // The source may already be stopped.
    }
    source.disconnect()
    source = null
  }

  const stopTimer = () => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = undefined
    }
  }

  const render = () => {
    const element = canvas.value
    const context = element?.getContext('2d')
    if (!element || !context) {
      return
    }
    const width = 1920
    const height = 1080
    if (element.width !== width || element.height !== height) {
      element.width = width
      element.height = height
    }

    context.fillStyle = '#111827'
    context.fillRect(0, 0, width, height)
    context.textAlign = 'left'
    context.fillStyle = 'rgba(255, 255, 255, 0.58)'
    context.font = '500 36px sans-serif'
    if (artist.value.trim()) {
      context.fillText(artist.value, 140, 240, width - 280)
    }
    context.fillStyle = '#ffffff'
    context.font = '700 84px sans-serif'
    context.fillText(title.value || 'noname', 140, artist.value.trim() ? 350 : 280, width - 280)

    const waveX = 140
    const waveY = 820
    const waveWidth = width - 280
    const spacing = 4
    const barWidth = (waveWidth - spacing * (waveform.value.length - 1)) / waveform.value.length
    const ratio = duration.value ? Math.min(1, currentTime.value / duration.value) : 0
    waveform.value.forEach((value, index) => {
      const isPlayed = index / waveform.value.length <= ratio
      const barHeight = Math.max(6, value * 180)
      const x = waveX + index * (barWidth + spacing)
      context.fillStyle = isPlayed ? '#6366f1' : 'rgba(255, 255, 255, 0.22)'
      context.fillRect(x, waveY, barWidth, -barHeight)
      context.fillStyle = isPlayed ? '#818cf8' : 'rgba(255, 255, 255, 0.12)'
      context.fillRect(x, waveY + 4, barWidth, barHeight * 0.32)
    })

    const cursorX = waveX + waveWidth * ratio
    context.strokeStyle = '#a5b4fc'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(cursorX, waveY - 220)
    context.lineTo(cursorX, waveY + 100)
    context.stroke()
    context.font = 'bold 22px monospace'
    context.textAlign = 'left'
    context.fillStyle = '#ffffff'
    context.fillText(formatTime(currentTime.value), waveX, waveY + 135)
    context.textAlign = 'right'
    context.fillStyle = 'rgba(255, 255, 255, 0.6)'
    context.fillText(formatTime(duration.value), waveX + waveWidth, waveY + 135)

    if (isPlaying.value || isRecording.value) {
      animationFrame = requestAnimationFrame(render)
    }
  }

  const play = async (offset = pausedAt) => {
    if (!audioBuffer.value || !ensureAudio() || !audioContext || !analyser) {
      return
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
    stopSource()
    source = audioContext.createBufferSource()
    source.buffer = audioBuffer.value
    source.connect(analyser)
    source.onended = () => {
      if (isPlaying.value) {
        const wasRecording = isRecording.value
        stop()
        if (wasRecording) {
          stopRecording()
        }
      }
    }
    source.start(0, offset)
    pausedAt = offset
    startedAt = audioContext.currentTime
    isPlaying.value = true
    stopTimer()
    progressTimer = setInterval(() => {
      if (!audioContext || !isPlaying.value) {
        return
      }
      currentTime.value = Math.min(duration.value, pausedAt + audioContext.currentTime - startedAt)
    }, 100)
    render()
  }

  const pause = () => {
    if (!isPlaying.value || !audioContext) {
      return
    }
    pausedAt = currentTime.value
    isPlaying.value = false
    stopSource()
    stopTimer()
    render()
  }

  const stop = () => {
    isPlaying.value = false
    pausedAt = 0
    currentTime.value = 0
    stopSource()
    stopTimer()
    render()
  }

  const seek = (value: number) => {
    const nextTime = Math.min(duration.value, Math.max(0, value))
    currentTime.value = nextTime
    pausedAt = nextTime
    if (isPlaying.value) {
      void play(nextTime)
    } else {
      render()
    }
  }

  const setVolume = (value: number) => {
    volume.value = Math.min(1, Math.max(0, value))
    if (gain && audioContext) {
      gain.gain.setValueAtTime(volume.value, audioContext.currentTime)
    }
  }

  const toggleMute = () => {
    if (volume.value) {
      previousVolume = volume.value
      setVolume(0)
    } else {
      setVolume(previousVolume)
    }
  }

  const loadFile = (file: File | undefined) => {
    if (!file?.type.startsWith('audio/')) {
      error.value = 'invalid'
      return
    }
    if (!ensureAudio() || !audioContext) {
      return
    }

    isDecoding.value = true
    error.value = ''
    status.value = ''
    fileName.value = file.name
    const name = file.name.replace(/\.[^.]+$/, '')
    const parts = name.split('-')
    title.value = parts.length > 1 ? parts.slice(1).join('-').trim() : name
    if (parts.length > 1) {
      artist.value = parts[0]!.trim()
    }

    const reader = new FileReader()
    reader.onerror = () => {
      isDecoding.value = false
      error.value = 'read'
    }
    reader.onload = async () => {
      try {
        const buffer = await audioContext!.decodeAudioData(reader.result as ArrayBuffer)
        audioBuffer.value = buffer
        duration.value = buffer.duration
        currentTime.value = 0
        pausedAt = 0
        waveform.value = createWaveform(buffer.getChannelData(0))
        canRecord.value = compatibility.value
        status.value = 'loaded'
        render()
      } catch (cause) {
        console.error('Failed to decode audio.', cause)
        error.value = 'decode'
      } finally {
        isDecoding.value = false
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const bestMimeType = () => ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    .find(type => MediaRecorder.isTypeSupported(type)) ?? 'video/webm'

  const stopRecording = () => {
    if (recorder?.state === 'recording') {
      recorder.stop()
    }
    stop()
  }

  const startRecording = async () => {
    if (!audioBuffer.value || !canvas.value || !compatibility.value || !ensureAudio() || !audioContext || !analyser) {
      error.value = 'record'
      return
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    if (downloadUrl.value) {
      URL.revokeObjectURL(downloadUrl.value)
      downloadUrl.value = ''
    }
    mediaDestination = audioContext.createMediaStreamDestination()
    analyser.connect(mediaDestination)
    const stream = new MediaStream([
      ...mediaDestination.stream.getAudioTracks(),
      ...canvas.value.captureStream(60).getVideoTracks(),
    ])
    const chunks: Blob[] = []
    try {
      recorder = new MediaRecorder(stream, { mimeType: bestMimeType() })
    } catch (cause) {
      console.error('Failed to initialize MediaRecorder.', cause)
      error.value = 'record'
      return
    }
    recorder.ondataavailable = (event) => {
      if (event.data.size) {
        chunks.push(event.data)
      }
    }
    recorder.onstop = () => {
      downloadUrl.value = URL.createObjectURL(new Blob(chunks, { type: bestMimeType() }))
      isRecording.value = false
      mediaDestination?.disconnect()
      mediaDestination = null
    }
    isRecording.value = true
    recorder.start()
    stop()
    await play(0)
  }

  const setCanvas = (element: HTMLCanvasElement) => {
    canvas.value = element
    render()
  }

  watch([title, artist], render)
  watch(artist, (value) => {
    if (!import.meta.client) {
      return
    }
    try {
      localStorage.setItem('audiovideo_saved_artist', value)
    } catch (cause) {
      console.error('Failed to save artist.', cause)
    }
  })

  onUnmounted(() => {
    stop()
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
    recorder?.stop()
    audioContext?.close()
    if (downloadUrl.value) {
      URL.revokeObjectURL(downloadUrl.value)
    }
  })

  return {
    fileName,
    title,
    artist,
    duration,
    currentTime,
    volume,
    isPlaying,
    isRecording,
    downloadUrl,
    status,
    error,
    canRecord,
    isDecoding,
    formattedCurrentTime,
    formattedDuration,
    progress,
    compatibility,
    loadFile,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    startRecording,
    stopRecording,
    setCanvas,
  }
}
