import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import MarkdownFormatterRules from './MarkdownFormatterRules.vue'

const { createDefaultRules, markdownFormatRuleIds } = useMarkdownFormatter()

const lastRules = (wrapper: Awaited<ReturnType<typeof mountSuspended>>) => {
  const events = wrapper.emitted('update:modelValue') ?? []
  return events[events.length - 1]?.[0] as Record<string, boolean>
}

const mountRules = async (modelValue: MarkdownFormatRules) => {
  const wrapper = await mountSuspended(MarkdownFormatterRules, { props: { modelValue }, attachTo: document.body })
  await wrapper.get('[data-testid="markdown-formatter-rules-toggle"]').trigger('click')
  return wrapper
}

describe('MarkdownFormatterRules', () => {
  it('does not expand or collapse the rules when the toggle-all button is clicked', async () => {
    const wrapper = await mountSuspended(MarkdownFormatterRules, {
      props: { modelValue: createDefaultRules() },
    })

    await wrapper.get('[data-testid="markdown-formatter-toggle-all"]').trigger('click')
    expect(wrapper.find('[data-testid="markdown-formatter-rule-olNumber"]').exists()).toBe(false)

    await wrapper.get('[data-testid="markdown-formatter-rules-toggle"]').trigger('click')
    await wrapper.get('[data-testid="markdown-formatter-toggle-all"]').trigger('click')
    expect(wrapper.find('[data-testid="markdown-formatter-rule-olNumber"]').exists()).toBe(true)
  })

  it('shows the number of active rules out of all rules', async () => {
    const total = markdownFormatRuleIds.length
    const wrapper = await mountSuspended(MarkdownFormatterRules, {
      props: { modelValue: { ...createDefaultRules(), hr: false, olNumber: false } },
    })

    expect(wrapper.get('[data-testid="markdown-formatter-rules-count"]').text()).toBe(`${total - 2}/${total}`)
  })

  it('hides the rules until expanded', async () => {
    const wrapper = await mountSuspended(MarkdownFormatterRules, {
      props: { modelValue: createDefaultRules() },
    })

    expect(wrapper.find('[data-testid="markdown-formatter-rule-olNumber"]').exists()).toBe(false)

    await wrapper.get('[data-testid="markdown-formatter-rules-toggle"]').trigger('click')

    expect(wrapper.find('[data-testid="markdown-formatter-rule-olNumber"]').exists()).toBe(true)
  })

  it('renders a checkbox for every rule', async () => {
    const wrapper = await mountRules(createDefaultRules())

    for (const id of markdownFormatRuleIds) {
      expect(wrapper.find(`[data-testid="markdown-formatter-rule-${id}"] button`).exists()).toBe(true)
    }
  })

  it('emits updated rules when a checkbox is toggled', async () => {
    const wrapper = await mountRules(createDefaultRules())

    await wrapper.get('[data-testid="markdown-formatter-rule-olNumber"] button').trigger('click')

    expect(lastRules(wrapper)?.olNumber).toBe(false)
    expect(lastRules(wrapper)?.urlLink).toBe(true)
  })

  it('disables all rules with the toggle button when every rule is enabled', async () => {
    const wrapper = await mountSuspended(MarkdownFormatterRules, {
      props: { modelValue: createDefaultRules() },
    })

    await wrapper.get('[data-testid="markdown-formatter-toggle-all"]').trigger('click')

    expect(Object.values(lastRules(wrapper)).every(value => value === false)).toBe(true)
  })

  it('enables all rules with the toggle button when some rule is disabled', async () => {
    const wrapper = await mountSuspended(MarkdownFormatterRules, {
      props: { modelValue: { ...createDefaultRules(), hr: false } },
    })

    await wrapper.get('[data-testid="markdown-formatter-toggle-all"]').trigger('click')

    expect(Object.values(lastRules(wrapper)).every(value => value === true)).toBe(true)
  })
})
