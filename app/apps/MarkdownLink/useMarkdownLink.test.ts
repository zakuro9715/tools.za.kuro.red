import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

const flush = async () => {
  await vi.waitFor(() => expect(true).toBe(true))
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

describe('useMarkdownLink', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('uses the entered title for a single URL', () => {
    vi.stubGlobal('fetch', vi.fn())
    const md = useMarkdownLink()
    md.url.value = 'https://example.com'
    md.title.value = 'Example'

    expect(md.result.value).toBe('[Example](https://example.com)')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('falls back to the URL when the title cannot be fetched', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('CORS')))
    const md = useMarkdownLink()
    md.url.value = 'https://example.com'
    await flush()

    expect(md.result.value).toBe('[https://example.com](https://example.com)')
  })

  it('uses the fetched page title', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '<html><head><title> Example\n Domain </title></head></html>',
    }))
    const md = useMarkdownLink()
    md.url.value = 'https://example.com'
    await flush()

    expect(md.result.value).toBe('[Example Domain](https://example.com)')
  })

  it('builds an image link in image mode', () => {
    const md = useMarkdownLink()
    md.mode.value = 'image'
    md.alt.value = 'Logo'
    md.imageUrl.value = 'https://example.com/logo.png'
    md.linkUrl.value = 'https://example.com'

    expect(md.result.value).toBe('[![Logo](https://example.com/logo.png)](https://example.com)')
  })

  it('builds a plain image when the link URL is empty and nothing without an image URL', () => {
    const md = useMarkdownLink()
    md.mode.value = 'image'
    expect(md.result.value).toBe('')
    md.imageUrl.value = 'https://example.com/logo.png'

    expect(md.result.value).toBe('![](https://example.com/logo.png)')
  })

  it('does not fetch non-HTTP URLs', async () => {
    vi.stubGlobal('fetch', vi.fn())

    expect(await fetchPageTitle('steam://openurl/x')).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('reports a copy failure', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const md = useMarkdownLink()
    await md.copyResult()

    expect(md.error.value).toBe('copyFailed')
  })
})
