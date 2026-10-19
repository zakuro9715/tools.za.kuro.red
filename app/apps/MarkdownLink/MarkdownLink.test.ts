import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MarkdownLink from './MarkdownLink.vue'

describe('MarkdownLink', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('converts a URL with a title into a Markdown link', async () => {
    const wrapper = await mountSuspended(MarkdownLink)
    await wrapper.get('[data-testid="markdown-link-url"]').setValue('https://example.com')
    await wrapper.get('[data-testid="markdown-link-title"]').setValue('Example')

    expect(wrapper.get('[data-testid="markdown-link-result"]').text()).toBe('[Example](https://example.com)')
  })

  it('falls back to the URL as the title when fetching fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('CORS')))
    const wrapper = await mountSuspended(MarkdownLink)
    await wrapper.get('[data-testid="markdown-link-url"]').setValue('https://example.com')
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.get('[data-testid="markdown-link-result"]').text()).toBe('[https://example.com](https://example.com)')
  })

  it('generates an image link in image mode', async () => {
    const wrapper = await mountSuspended(MarkdownLink)
    await wrapper.get('[data-testid="markdown-link-mode-image"]').trigger('click')
    await wrapper.get('[data-testid="markdown-link-image-url"]').setValue('https://example.com/a.png')
    await wrapper.get('[data-testid="markdown-link-alt"]').setValue('A')
    await wrapper.get('[data-testid="markdown-link-link-url"]').setValue('https://example.com')

    expect(wrapper.get('[data-testid="markdown-link-result"]').text()).toBe('[![A](https://example.com/a.png)](https://example.com)')
    expect(wrapper.find('[data-testid="markdown-link-preview"]').exists()).toBe(true)
  })

  it('copies the result', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = await mountSuspended(MarkdownLink)
    await wrapper.get('[data-testid="markdown-link-url"]').setValue('https://example.com')
    await wrapper.get('[data-testid="markdown-link-title"]').setValue('Example')
    await wrapper.get('[data-testid="markdown-link-copy"]').trigger('click')

    expect(writeText).toHaveBeenCalledWith('[Example](https://example.com)')
  })
})
