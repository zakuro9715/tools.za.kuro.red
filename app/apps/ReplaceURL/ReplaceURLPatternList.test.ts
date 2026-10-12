import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ReplaceURLPatternList from './ReplaceURLPatternList.vue'
import { presetPatterns } from './useReplaceURL'

describe('ReplaceURLPatternList', () => {
  it('emits a selected built-in pattern', async () => {
    const wrapper = await mountSuspended(ReplaceURLPatternList, {
      props: { presets: presetPatterns, savedPatterns: [] },
    })
    await wrapper.get('[data-testid="replace-url-use-pattern-steam"]').trigger('click')

    expect(wrapper.emitted('use')?.[0]?.[0]).toEqual(
      presetPatterns.find(pattern => pattern.id === 'steam'),
    )
  })

  it('emits the mobile-site conversion preset', async () => {
    const wrapper = await mountSuspended(ReplaceURLPatternList, {
      props: { presets: presetPatterns, savedPatterns: [] },
    })
    await wrapper.get('[data-testid="replace-url-use-pattern-mobile-to-desktop"]').trigger('click')

    expect(wrapper.emitted('use')?.[0]?.[0]).toEqual(
      presetPatterns.find(pattern => pattern.id === 'mobile-to-desktop'),
    )
  })

  it('emits the identifier of a deleted saved pattern', async () => {
    const wrapper = await mountSuspended(ReplaceURLPatternList, {
      props: {
        presets: [],
        savedPatterns: [{ id: 'custom-id', name: 'Custom', before: 'a', after: 'b', isRegex: false }],
      },
    })
    await wrapper.get('[data-testid="replace-url-delete-saved-custom-id"]').trigger('click')

    expect(wrapper.emitted('delete')).toEqual([['custom-id']])
  })
})
