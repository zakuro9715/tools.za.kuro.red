import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import MarkdownLinkImageForm from './MarkdownLinkImageForm.vue'

const props = { alt: '', imageUrl: '', linkUrl: '' }

describe('MarkdownLinkImageForm', () => {
  it('shows a preview only for an HTTP image URL', async () => {
    const empty = await mountSuspended(MarkdownLinkImageForm, { props })
    const filled = await mountSuspended(MarkdownLinkImageForm, { props: { ...props, imageUrl: 'https://example.com/a.png' } })
    const invalid = await mountSuspended(MarkdownLinkImageForm, { props: { ...props, imageUrl: 'javascript:alert(1)' } })

    expect(empty.find('[data-testid="markdown-link-preview"]').exists()).toBe(false)
    expect(filled.get('[data-testid="markdown-link-preview"]').attributes('src')).toBe('https://example.com/a.png')
    expect(invalid.find('[data-testid="markdown-link-preview"]').exists()).toBe(false)
  })

  it('emits alt updates', async () => {
    const wrapper = await mountSuspended(MarkdownLinkImageForm, { props })
    await wrapper.get('[data-testid="markdown-link-alt"]').setValue('Logo')

    expect(wrapper.emitted('update:alt')?.at(-1)).toEqual(['Logo'])
  })
})
