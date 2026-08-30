import { onMounted, ref, shallowRef, watch } from 'vue'

interface Memo {
  id: string
  title: string
  content: string
  updatedAt: number
}

interface Draft {
  id: string | null
  content: string
}

const storageKey = 'tools_notepad_data'
const draftKey = 'tools_notepad_draft'

function isMemo(value: unknown): value is Memo {
  if (!value || typeof value !== 'object') {
    return false
  }

  const memo = value as Memo
  return typeof memo.id === 'string'
    && typeof memo.title === 'string'
    && typeof memo.content === 'string'
    && typeof memo.updatedAt === 'number'
}

function formatMemoDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function useNotepad() {
  const route = useRoute()
  const router = useRouter()
  const memos = ref<Memo[]>([])
  const currentId = shallowRef<string | null>(null)
  const currentContent = shallowRef('')
  const statusMessage = shallowRef('')
  const isReady = shallowRef(false)
  let statusTimeout: ReturnType<typeof setTimeout> | undefined

  const showStatus = (message: string) => {
    statusMessage.value = message

    if (statusTimeout) {
      clearTimeout(statusTimeout)
    }

    statusTimeout = setTimeout(() => {
      if (statusMessage.value === message) {
        statusMessage.value = ''
      }
    }, 2000)
  }

  const persist = (key: string, value: unknown, errorMessage: string) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Failed to save notepad data for "${key}".`, error)
      showStatus(errorMessage)
      return false
    }
  }

  const saveDraft = () => {
    persist(draftKey, {
      id: currentId.value,
      content: currentContent.value
    } satisfies Draft, '下書きを保存できませんでした')
  }

  const getDraft = (): Draft | null => {
    try {
      const storedDraft: unknown = JSON.parse(localStorage.getItem(draftKey) ?? 'null')

      if (
        storedDraft
        && typeof storedDraft === 'object'
        && ('id' in storedDraft)
        && ('content' in storedDraft)
        && (typeof storedDraft.id === 'string' || storedDraft.id === null)
        && typeof storedDraft.content === 'string'
      ) {
        return storedDraft as Draft
      }

      return null
    } catch (error) {
      console.error('Failed to load notepad draft.', error)
      showStatus('下書きを読み込めませんでした')
      return null
    }
  }

  const setRouteId = async (id: string | null, replace = false) => {
    const query = { ...route.query }

    if (id) {
      query.id = id
    } else {
      delete query.id
    }

    await (replace ? router.replace({ query }) : router.push({ query }))
  }

  const loadFromRoute = async () => {
    const id = typeof route.query.id === 'string' ? route.query.id : null
    const draft = getDraft()

    if (id) {
      if (draft?.id === id) {
        currentId.value = draft.id
        currentContent.value = draft.content
        return
      }

      const memo = memos.value.find(item => item.id === id)
      if (memo) {
        currentId.value = memo.id
        currentContent.value = memo.content
        return
      }
    }

    if (!id && draft) {
      currentId.value = draft.id
      currentContent.value = draft.content

      if (draft.id) {
        await setRouteId(draft.id, true)
      }
      return
    }

    currentId.value = null
    currentContent.value = ''
  }

  const loadMemos = () => {
    try {
      const storedMemos: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
      memos.value = Array.isArray(storedMemos) ? storedMemos.filter(isMemo) : []
    } catch (error) {
      console.error('Failed to load saved notepad memos.', error)
      memos.value = []
      showStatus('保存済みメモを読み込めませんでした')
    }
  }

  const createNewMemo = async () => {
    currentId.value = null
    currentContent.value = ''
    await setRouteId(null)
    showStatus('新規メモを作成しました')
  }

  const selectMemo = async (id: string) => {
    const memo = memos.value.find(item => item.id === id)
    if (!memo) {
      return
    }

    currentId.value = memo.id
    currentContent.value = memo.content
    await setRouteId(memo.id)
  }

  const saveMemo = async () => {
    if (!currentContent.value.trim() && !currentId.value) {
      showStatus('内容を入力してください')
      return
    }

    const titleLine = currentContent.value.trim().split('\n')[0] || '無題のメモ'
    const title = titleLine.length > 25 ? `${titleLine.slice(0, 25)}...` : titleLine
    const updatedAt = Date.now()

    if (currentId.value) {
      const index = memos.value.findIndex(item => item.id === currentId.value)
      if (index !== -1) {
        memos.value[index] = {
          id: currentId.value,
          title,
          content: currentContent.value,
          updatedAt
        }
      }
    } else {
      const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
      currentId.value = id
      memos.value.unshift({ id, title, content: currentContent.value, updatedAt })
      await setRouteId(id)
    }

    memos.value.sort((first, second) => second.updatedAt - first.updatedAt)

    if (persist(storageKey, memos.value, 'メモを保存できませんでした')) {
      showStatus('保存しました')
    }
  }

  const deleteMemo = async (id: string) => {
    memos.value = memos.value.filter(item => item.id !== id)
    const wasPersisted = persist(storageKey, memos.value, 'メモを削除できませんでした')

    if (currentId.value === id) {
      currentId.value = null
      currentContent.value = ''
      await setRouteId(null)
    }

    if (wasPersisted) {
      showStatus('削除しました')
    }
  }

  const clearCurrentContent = () => {
    currentContent.value = ''
  }

  const clearAllMemos = async () => {
    memos.value = []
    const wasPersisted = persist(storageKey, memos.value, 'メモを削除できませんでした')
    currentId.value = null
    currentContent.value = ''
    await setRouteId(null)

    if (wasPersisted) {
      showStatus('すべて削除しました')
    }
  }

  watch([currentId, currentContent], () => {
    if (isReady.value) {
      saveDraft()
    }
  })

  watch(() => route.query.id, () => {
    if (isReady.value) {
      void loadFromRoute()
    }
  })

  onMounted(async () => {
    loadMemos()
    await loadFromRoute()
    isReady.value = true
  })

  return {
    memos,
    currentId,
    currentContent,
    statusMessage,
    createNewMemo,
    selectMemo,
    saveMemo,
    deleteMemo,
    clearCurrentContent,
    clearAllMemos,
    formatMemoDate
  }
}
