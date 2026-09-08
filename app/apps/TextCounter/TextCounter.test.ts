import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TextCounter from './TextCounter.vue'

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }))

mockNuxtImport('useToast', () => () => ({ add: toastAdd }))

const waitForDebounce = () => new Promise(resolve => setTimeout(resolve, 250))

function mockClipboardReadText(readText: () => Promise<string>) {
  const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { readText },
  })

  return () => {
    if (clipboardDescriptor) {
      Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
    } else {
      Reflect.deleteProperty(navigator, 'clipboard')
    }
  }
}

describe('TextCounter', () => {
  afterEach(() => {
    toastAdd.mockClear()
    vi.restoreAllMocks()
  })

  it('updates displayed character count after text input', async () => {
    const wrapper = await mountSuspended(TextCounter)

    await wrapper.get('textarea').setValue('abc')
    await waitForDebounce()

    expect(wrapper.get('[data-testid="text-counter-characters-with-spaces"]').text()).toContain('3')
    expect(wrapper.get('[data-testid="text-counter-characters"]').text()).toContain('3')
  })

  it('clears the input when the clear button is clicked', async () => {
    const wrapper = await mountSuspended(TextCounter)
    const textarea = wrapper.get('textarea')

    await textarea.setValue('Text to clear')
    await waitForDebounce()
    await wrapper.get('[data-testid="text-counter-clear"]').trigger('click')

    expect((textarea.element as HTMLTextAreaElement).value).toBe('')
    expect(wrapper.find('[data-testid="text-counter-clear"]').exists()).toBe(false)
  })

  it('pastes text from the clipboard', async () => {
    const wrapper = await mountSuspended(TextCounter)
    const readText = vi.fn().mockResolvedValue('Pasted text')
    const restoreClipboard = mockClipboardReadText(readText)

    try {
      await wrapper.get('[data-testid="text-counter-paste"]').trigger('click')
      await waitForDebounce()
    } finally {
      restoreClipboard()
    }

    expect(readText).toHaveBeenCalledOnce()
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('Pasted text')
    expect(wrapper.get('[data-testid="text-counter-characters-with-spaces"]').text()).toContain('11')
  })

  it('shows an error toast when clipboard access fails', async () => {
    const wrapper = await mountSuspended(TextCounter)
    const readText = vi.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'))
    const restoreClipboard = mockClipboardReadText(readText)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      await wrapper.get('[data-testid="text-counter-paste"]').trigger('click')
      await waitForDebounce()
    } finally {
      restoreClipboard()
    }

    expect(readText).toHaveBeenCalledOnce()
    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({
      color: 'error',
      icon: 'i-lucide-circle-alert',
    }))
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('')
    expect(consoleError).toHaveBeenCalledOnce()
  })
})
