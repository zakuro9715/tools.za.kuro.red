import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { useNotepad } from './useNotepad'

const NotepadHarness = defineComponent({
  setup: useNotepad,
  template: '<div />',
})

async function mountNotepad() {
  return mountSuspended(NotepadHarness)
}

describe('useNotepad', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads saved memos on mount', async () => {
    localStorage.setItem('tools_notepad_data', JSON.stringify([{
      id: 'memo-1',
      title: 'Stored memo',
      content: 'Stored content',
      updatedAt: 1,
    }]))

    const wrapper = await mountNotepad()

    expect(wrapper.vm.memos).toHaveLength(1)
  })

  it('creates and persists a memo with a truncated title', async () => {
    const wrapper = await mountNotepad()
    wrapper.vm.currentContent = 'A memo title that is longer than twenty-five characters'

    await wrapper.vm.saveMemo()

    const storedMemos = JSON.parse(localStorage.getItem('tools_notepad_data') ?? '[]')
    expect(storedMemos).toHaveLength(1)
    expect(storedMemos[0]).toMatchObject({
      title: 'A memo title that is long...',
      content: 'A memo title that is longer than twenty-five characters',
    })
    expect(wrapper.vm.currentId).toBe(storedMemos[0].id)
    expect(wrapper.vm.statusMessage).not.toBe('')
  })

  it('does not save an empty new memo', async () => {
    const wrapper = await mountNotepad()

    await wrapper.vm.saveMemo()

    expect(wrapper.vm.memos).toHaveLength(0)
    expect(localStorage.getItem('tools_notepad_data')).toBeNull()
    expect(wrapper.vm.statusMessage).not.toBe('')
  })

  it('selects and deletes a memo while updating storage and the route', async () => {
    localStorage.setItem('tools_notepad_data', JSON.stringify([{
      id: 'memo-1',
      title: 'Stored memo',
      content: 'Stored content',
      updatedAt: 1,
    }]))
    const wrapper = await mountNotepad()

    await wrapper.vm.selectMemo('memo-1')
    await wrapper.vm.deleteMemo('memo-1')

    expect(wrapper.vm.currentId).toBeNull()
    expect(wrapper.vm.currentContent).toBe('')
    expect(JSON.parse(localStorage.getItem('tools_notepad_data') ?? '[]')).toEqual([])
    expect(wrapper.vm.statusMessage).not.toBe('')
  })

  it('clears all memos, the draft, and the route', async () => {
    localStorage.setItem('tools_notepad_data', JSON.stringify([{
      id: 'memo-1',
      title: 'Stored memo',
      content: 'Stored content',
      updatedAt: 1,
    }]))
    const wrapper = await mountNotepad()
    wrapper.vm.currentContent = 'Changed draft'
    await wrapper.vm.$nextTick()

    await wrapper.vm.clearAllMemos()

    expect(wrapper.vm.memos).toEqual([])
    expect(wrapper.vm.currentId).toBeNull()
    expect(wrapper.vm.currentContent).toBe('')
    expect(JSON.parse(localStorage.getItem('tools_notepad_data') ?? '[]')).toEqual([])
    expect(wrapper.vm.statusMessage).not.toBe('')
  })
})
