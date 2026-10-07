import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchSoundFont } from './useSoundFont'
import { createSoundFont, stubSoundFontFetch } from './testFixtures'

describe('fetchSoundFont', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('downloads the sound font and reports progress', async () => {
    const soundFont = createSoundFont()
    stubSoundFontFetch(soundFont)
    const onProgress = vi.fn()

    const buffer = await fetchSoundFont('https://example.test/progress.sf2', onProgress)

    expect(buffer.byteLength).toBe(soundFont.byteLength)
    expect(onProgress).toHaveBeenLastCalledWith(1)
  })

  it('throws when the download fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))

    await expect(fetchSoundFont('https://example.test/missing.sf2')).rejects.toThrow()
  })
})
