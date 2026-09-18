import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it } from 'vitest'
import TextChecker from './TextChecker.vue'

describe('TextChecker', () => {
  beforeEach(() => localStorage.clear())

  it('clears the source text', async () => {
    const wrapper = await mountSuspended(TextChecker)
    const input = wrapper.get('[data-testid="text-checker-input"]')
    await input.setValue('校正する文章')
    await wrapper.get('[data-testid="text-checker-clear"]').trigger('click')

    expect((input.element as HTMLTextAreaElement).value).toBe('')
  })
})
