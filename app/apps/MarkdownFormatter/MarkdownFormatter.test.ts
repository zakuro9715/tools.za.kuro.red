import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MarkdownFormatter from './MarkdownFormatter.vue'

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }))

mockNuxtImport('useToast', () => () => ({ add: toastAdd }))

function mockClipboard(clipboard: Partial<Clipboard>) {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')

  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard })

  return () => {
    if (descriptor) {
      Object.defineProperty(navigator, 'clipboard', descriptor)
    } else {
      Reflect.deleteProperty(navigator, 'clipboard')
    }
  }
}

const outputOf = (wrapper: Awaited<ReturnType<typeof mountSuspended>>) =>
  (wrapper.get('[data-testid="markdown-formatter-output"]').element as HTMLTextAreaElement).value

describe('MarkdownFormatter', () => {
  afterEach(() => {
    toastAdd.mockClear()
    vi.restoreAllMocks()
  })

  it('shows formatted markdown in the output', async () => {
    const wrapper = await mountSuspended(MarkdownFormatter)

    await wrapper.get('[data-testid="markdown-formatter-input"]').setValue('#Title\nhttps://example.com')

    expect(outputOf(wrapper)).toBe('# Title\n\n[https://example.com](https://example.com)\n')
  })

  it('shows a diff only when the output differs from the input', async () => {
    const wrapper = await mountSuspended(MarkdownFormatter)
    const input = wrapper.get('[data-testid="markdown-formatter-input"]')

    expect(wrapper.find('[data-testid="markdown-formatter-diff"]').exists()).toBe(false)

    await input.setValue('# Title\n')
    expect(wrapper.find('[data-testid="markdown-formatter-diff"]').exists()).toBe(false)

    await input.setValue('#Title\n')
    expect(wrapper.find('[data-testid="markdown-formatter-diff"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="markdown-formatter-diff-add"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="markdown-formatter-diff-remove"]').exists()).toBe(true)
  })

  it('applies a rule only while it is enabled', async () => {
    const wrapper = await mountSuspended(MarkdownFormatter)

    await wrapper.get('[data-testid="markdown-formatter-input"]').setValue('3. a\n9. b\n')
    expect(outputOf(wrapper)).toBe('1. a\n2. b\n')

    await wrapper.get('[data-testid="markdown-formatter-rules-toggle"]').trigger('click')
    await wrapper.get('[data-testid="markdown-formatter-rule-olNumber"] button').trigger('click')
    expect(outputOf(wrapper)).toBe('3. a\n9. b\n')
  })

  it('fills the input with a sample that gets formatted', async () => {
    const wrapper = await mountSuspended(MarkdownFormatter)

    await wrapper.get('[data-testid="markdown-formatter-sample"]').trigger('click')

    const input = (wrapper.get('[data-testid="markdown-formatter-input"]').element as HTMLTextAreaElement).value
    expect(input).not.toBe('')
    expect(outputOf(wrapper)).not.toBe(input)
    expect(wrapper.find('[data-testid="markdown-formatter-diff"]').exists()).toBe(true)
  })

  it('clears the input when the clear button is clicked', async () => {
    const wrapper = await mountSuspended(MarkdownFormatter)
    const input = wrapper.get('[data-testid="markdown-formatter-input"]')

    await input.setValue('text')
    await wrapper.get('[data-testid="markdown-formatter-clear"]').trigger('click')

    expect((input.element as HTMLTextAreaElement).value).toBe('')
    expect(wrapper.find('[data-testid="markdown-formatter-clear"]').exists()).toBe(false)
  })

  it('pastes text from the clipboard', async () => {
    const wrapper = await mountSuspended(MarkdownFormatter)
    const restore = mockClipboard({ readText: vi.fn().mockResolvedValue('#Pasted') })

    await wrapper.get('[data-testid="markdown-formatter-paste"]').trigger('click')
    await vi.waitFor(() => expect(outputOf(wrapper)).toBe('# Pasted\n'))

    restore()
  })

  it('shows an error toast when pasting fails', async () => {
    const wrapper = await mountSuspended(MarkdownFormatter)
    const restore = mockClipboard({ readText: vi.fn().mockRejectedValue(new Error('denied')) })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await wrapper.get('[data-testid="markdown-formatter-paste"]').trigger('click')
    await vi.waitFor(() => expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ color: 'error' })))

    restore()
  })

  it('copies the output to the clipboard', async () => {
    const wrapper = await mountSuspended(MarkdownFormatter)
    const writeText = vi.fn().mockResolvedValue(undefined)
    const restore = mockClipboard({ writeText })

    await wrapper.get('[data-testid="markdown-formatter-input"]').setValue('#Title')
    await wrapper.get('[data-testid="markdown-formatter-copy"]').trigger('click')

    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith('# Title\n'))
    expect(toastAdd).toHaveBeenCalledWith(expect.not.objectContaining({ color: 'error' }))

    restore()
  })

  it('shows an error toast when copying fails', async () => {
    const wrapper = await mountSuspended(MarkdownFormatter)
    const restore = mockClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await wrapper.get('[data-testid="markdown-formatter-input"]').setValue('text')
    await wrapper.get('[data-testid="markdown-formatter-copy"]').trigger('click')

    await vi.waitFor(() => expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ color: 'error' })))

    restore()
  })
})
