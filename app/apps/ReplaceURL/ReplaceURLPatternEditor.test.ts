import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ReplaceURLPatternEditor from './ReplaceURLPatternEditor.vue'

describe('ReplaceURLPatternEditor', () => {
  it('autofocuses the URL input', async () => {
    const wrapper = await mountSuspended(ReplaceURLPatternEditor, {
      props: {
        url: '',
        before: '',
        after: '',
        isRegex: false,
      },
    })

    expect(wrapper.findComponent({ name: 'UInput' }).props('autofocus')).toBe(true)
  })

  it('toggles regular-expression mode', async () => {
    const wrapper = await mountSuspended(ReplaceURLPatternEditor, {
      props: {
        url: '',
        before: '',
        after: '',
        isRegex: false,
      },
    })
    await wrapper.get('[data-testid="replace-url-regex"]').trigger('click')

    expect(wrapper.emitted('update:isRegex')?.at(-1)).toEqual([true])
  })

  it('emits save when requested', async () => {
    const wrapper = await mountSuspended(ReplaceURLPatternEditor, {
      props: {
        url: '',
        before: '',
        after: '',
        isRegex: false,
      },
    })
    await wrapper.get('[data-testid="replace-url-save-pattern"]').trigger('click')

    expect(wrapper.emitted('save')).toHaveLength(1)
  })
})
