import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import MarkdownLinkUrlForm from './MarkdownLinkUrlForm.vue'

describe('MarkdownLinkUrlForm', () => {
  it('autofocuses the URL input', async () => {
    const wrapper = await mountSuspended(MarkdownLinkUrlForm, { props: { url: '', title: '' } })

    expect(wrapper.findComponent({ name: 'UInput' }).props('autofocus')).toBe(true)
  })

  it('emits URL and title updates', async () => {
    const wrapper = await mountSuspended(MarkdownLinkUrlForm, { props: { url: '', title: '' } })
    await wrapper.get('[data-testid="markdown-link-url"]').setValue('https://example.com')
    await wrapper.get('[data-testid="markdown-link-title"]').setValue('Example')

    expect(wrapper.emitted('update:url')?.at(-1)).toEqual(['https://example.com'])
    expect(wrapper.emitted('update:title')?.at(-1)).toEqual(['Example'])
  })
})
