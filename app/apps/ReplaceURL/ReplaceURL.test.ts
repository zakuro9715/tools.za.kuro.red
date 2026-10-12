import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import ReplaceURL from './ReplaceURL.vue'

describe('ReplaceURL', () => {
  beforeEach(() => localStorage.clear())

  it('applies the Wayback preset to the entered URL', async () => {
    const wrapper = await mountSuspended(ReplaceURL)
    await wrapper.get('[data-testid="replace-url-url"]').setValue('https://example.com/page')
    await wrapper.get('[data-testid="replace-url-use-pattern-wayback"]').trigger('click')

    expect(wrapper.get('[data-testid="replace-url-result"]').text()).toBe('https://web.archive.org/web/https://example.com/page')
    expect(wrapper.get('[data-testid="replace-url-result"] a').attributes('href')).toBe('https://web.archive.org/web/https://example.com/page')
  })

  it('shows a URL generated from an empty input', async () => {
    const wrapper = await mountSuspended(ReplaceURL)
    await wrapper.get('[data-testid="replace-url-before"]').setValue('^')
    await wrapper.get('[data-testid="replace-url-after"]').setValue('https://example.com')
    await wrapper.get('[data-testid="replace-url-regex"]').trigger('click')

    expect(wrapper.get('[data-testid="replace-url-result"]').text()).toBe('https://example.com')
    expect(wrapper.get('[data-testid="replace-url-result"] a').attributes('href')).toBe('https://example.com')
  })

  it('saves a pattern and applies it from the saved list', async () => {
    const wrapper = await mountSuspended(ReplaceURL)
    await wrapper.get('[data-testid="replace-url-url"]').setValue('https://www.example.com')
    await wrapper.get('[data-testid="replace-url-before"]').setValue('www.')
    await wrapper.get('[data-testid="replace-url-after"]').setValue('')
    await wrapper.get('[data-testid="replace-url-save-pattern"]').trigger('click')
    const nameInput = document.querySelector<HTMLInputElement>('[data-testid="replace-url-pattern-name"]')
    expect(nameInput).not.toBeNull()
    nameInput!.value = 'Remove www'
    nameInput!.dispatchEvent(new Event('input', { bubbles: true }))
    document.querySelector<HTMLButtonElement>('[data-testid="replace-url-confirm-save"]')!.click()
    await nextTick()

    const saved = JSON.parse(localStorage.getItem('tools_replace_url_patterns') ?? '[]') as Array<{ id: string }>
    expect(saved).toHaveLength(1)

    await wrapper.get(`[data-testid="replace-url-use-saved-${saved[0]!.id}"]`).trigger('click')
    expect(wrapper.get('[data-testid="replace-url-result"]').text()).toBe('https://example.com')
  })

  it('opens the save modal and requires a pattern name', async () => {
    const wrapper = await mountSuspended(ReplaceURL)
    await wrapper.get('[data-testid="replace-url-save-pattern"]').trigger('click')

    expect(document.querySelector('[data-testid="replace-url-pattern-name"]')).not.toBeNull()
    document.querySelector<HTMLButtonElement>('[data-testid="replace-url-confirm-save"]')!.click()
    await nextTick()

    expect(document.querySelector('[data-testid="replace-url-save-error"]')).not.toBeNull()
    expect(localStorage.getItem('tools_replace_url_patterns')).toBeNull()
  })

  it('shows an error for an invalid regular expression', async () => {
    const wrapper = await mountSuspended(ReplaceURL)
    await wrapper.get('[data-testid="replace-url-url"]').setValue('https://example.com')
    await wrapper.get('[data-testid="replace-url-before"]').setValue('[')
    await wrapper.get('[data-testid="replace-url-regex"]').trigger('click')

    expect(wrapper.find('[data-testid="replace-url-error"]').exists()).toBe(true)
  })
})
