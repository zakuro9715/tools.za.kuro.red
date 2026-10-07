export const soundFontUrl = 'https://raw.githubusercontent.com/mrbumpy409/GeneralUser-GS/main/GeneralUser-GS.sf2'
const cacheName = 'midi-to-audio-soundfont'

async function openCache() {
  try {
    return typeof caches === 'undefined' ? null : await caches.open(cacheName)
  } catch {
    return null
  }
}

async function readBody(response: Response, onProgress?: (ratio: number) => void) {
  const total = Number(response.headers.get('content-length')) || 0
  if (!response.body) {
    return await response.arrayBuffer()
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    chunks.push(value)
    received += value.length
    if (total) {
      onProgress?.(Math.min(1, received / total))
    }
  }

  const result = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  onProgress?.(1)
  return result.buffer
}

export async function fetchSoundFont(url = soundFontUrl, onProgress?: (ratio: number) => void) {
  const cache = await openCache()
  const cached = await cache?.match(url)
  if (cached) {
    const buffer = await cached.arrayBuffer()
    onProgress?.(1)
    return buffer
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch sound font: ${response.status}`)
  }

  const copy = response.clone()
  const buffer = await readBody(response, onProgress)
  await cache?.put(url, copy).catch(() => undefined)
  return buffer
}

export function useSoundFont() {
  const buffer = shallowRef<ArrayBuffer | null>(null)
  const progress = shallowRef(0)
  const isLoading = shallowRef(false)

  const load = async () => {
    if (buffer.value) {
      return buffer.value
    }

    isLoading.value = true
    progress.value = 0
    try {
      buffer.value = await fetchSoundFont(soundFontUrl, (ratio) => {
        progress.value = ratio
      })
      return buffer.value
    } finally {
      isLoading.value = false
    }
  }

  return { progress, isLoading, load }
}
