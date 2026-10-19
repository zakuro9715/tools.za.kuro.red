import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import MarkdownFormatterDiff from './MarkdownFormatterDiff.vue'

describe('MarkdownFormatterDiff', () => {
  it('renders each diff line with its type', async () => {
    const wrapper = await mountSuspended(MarkdownFormatterDiff, {
      props: {
        lines: [
          { type: 'same', text: 'a' },
          { type: 'remove', text: 'b' },
          { type: 'add', text: 'c' },
        ],
      },
    })

    expect(wrapper.findAll('[data-testid="markdown-formatter-diff-same"]')).toHaveLength(1)
    expect(wrapper.get('[data-testid="markdown-formatter-diff-remove"]').text()).toContain('b')
    expect(wrapper.get('[data-testid="markdown-formatter-diff-add"]').text()).toContain('c')
  })

  it('renders nothing when there are no lines', async () => {
    const wrapper = await mountSuspended(MarkdownFormatterDiff, { props: { lines: [] } })

    expect(wrapper.find('[data-testid^="markdown-formatter-diff-"]').exists()).toBe(false)
  })
})
