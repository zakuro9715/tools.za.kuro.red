import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it } from 'vitest'
import Notepad from './Notepad.vue'

describe('Notepad', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves input and displays the saved memo', async () => {
    const wrapper = await mountSuspended(Notepad)

    await wrapper.get('[data-testid="notepad-editor"]').setValue('First memo\nContent')
    await wrapper.get('[data-testid="notepad-save"]').trigger('click')

    expect(wrapper.get('[data-testid="notepad-select-memo"]').text()).toContain('First memo')
  })

  it('clears the current editor content and starts a new memo', async () => {
    const wrapper = await mountSuspended(Notepad)
    const editor = wrapper.get('[data-testid="notepad-editor"]')

    await editor.setValue('Draft text')
    await wrapper.get('[data-testid="notepad-clear-content"]').trigger('click')
    expect((editor.element as HTMLTextAreaElement).value).toBe('')

    await editor.setValue('Another draft')
    await wrapper.get('[data-testid="notepad-create"]').trigger('click')
    expect((editor.element as HTMLTextAreaElement).value).toBe('')
  })

  it('toggles and closes the memo list', async () => {
    const wrapper = await mountSuspended(Notepad)

    await wrapper.get('[data-testid="notepad-toggle-list"]').trigger('click')
    expect(wrapper.find('[data-testid="notepad-select-memo"]').exists()).toBe(false)

    await wrapper.get('[data-testid="notepad-toggle-list"]').trigger('click')
    await wrapper.get('[data-testid="notepad-close-list"]').trigger('click')
    expect(wrapper.find('[data-testid="notepad-select-memo"]').exists()).toBe(false)
  })

  it('requires confirmation before clearing all memos', async () => {
    const wrapper = await mountSuspended(Notepad)
    await wrapper.get('[data-testid="notepad-editor"]').setValue('Memo to remove')
    await wrapper.get('[data-testid="notepad-save"]').trigger('click')

    await wrapper.get('[data-testid="notepad-clear-all"]').trigger('click')
    expect(wrapper.find('[data-testid="notepad-confirm-clear-all"]').exists()).toBe(true)

    await wrapper.get('[data-testid="notepad-cancel-clear-all"]').trigger('click')
    expect(wrapper.find('[data-testid="notepad-select-memo"]').exists()).toBe(true)

    await wrapper.get('[data-testid="notepad-clear-all"]').trigger('click')
    await wrapper.get('[data-testid="notepad-confirm-clear-all"]').trigger('click')
    expect(wrapper.find('[data-testid="notepad-select-memo"]').exists()).toBe(false)
    expect(JSON.parse(localStorage.getItem('tools_notepad_data') ?? '[]')).toEqual([])
  })
})
