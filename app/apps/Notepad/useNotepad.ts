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

export function useNotepad() {
  const route = useRoute()
  const router = useRouter()
  const { locale, t } = useI18n({
    messages: {
      en: {
        status: {
          draftSaveFailed: 'Could not save the draft.',
          draftLoadFailed: 'Could not load the draft.',
          memosLoadFailed: 'Could not load saved memos.',
          created: 'New memo created.',
          contentRequired: 'Enter memo content.',
          memoSaveFailed: 'Could not save the memo.',
          saved: 'Saved.',
          memoDeleteFailed: 'Could not delete the memo.',
          deleted: 'Deleted.',
          allDeleted: 'All memos deleted.'
        },
        memo: {
          untitled: 'Untitled memo'
        }
      },
      ja: {
        status: {
          draftSaveFailed: '下書きを保存できませんでした',
          draftLoadFailed: '下書きを読み込めませんでした',
          memosLoadFailed: '保存済みメモを読み込めませんでした',
          created: '新規メモを作成しました',
          contentRequired: '内容を入力してください',
          memoSaveFailed: 'メモを保存できませんでした',
          saved: '保存しました',
          memoDeleteFailed: 'メモを削除できませんでした',
          deleted: '削除しました',
          allDeleted: 'すべて削除しました'
        },
        memo: {
          untitled: '無題のメモ'
        }
      }
    }
  })
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
    } satisfies Draft, t('status.draftSaveFailed'))
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
      showStatus(t('status.draftLoadFailed'))
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
      showStatus(t('status.memosLoadFailed'))
    }
  }

  const createNewMemo = async () => {
    currentId.value = null
    currentContent.value = ''
    await setRouteId(null)
    showStatus(t('status.created'))
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
      showStatus(t('status.contentRequired'))
      return
    }

    const titleLine = currentContent.value.trim().split('\n')[0] || t('memo.untitled')
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

    if (persist(storageKey, memos.value, t('status.memoSaveFailed'))) {
      showStatus(t('status.saved'))
    }
  }

  const deleteMemo = async (id: string) => {
    memos.value = memos.value.filter(item => item.id !== id)
    const wasPersisted = persist(storageKey, memos.value, t('status.memoDeleteFailed'))

    if (currentId.value === id) {
      currentId.value = null
      currentContent.value = ''
      await setRouteId(null)
    }

    if (wasPersisted) {
      showStatus(t('status.deleted'))
    }
  }

  const clearCurrentContent = () => {
    currentContent.value = ''
  }

  const clearAllMemos = async () => {
    memos.value = []
    const wasPersisted = persist(storageKey, memos.value, t('status.memoDeleteFailed'))
    currentId.value = null
    currentContent.value = ''
    await setRouteId(null)

    if (wasPersisted) {
      showStatus(t('status.allDeleted'))
    }
  }

  const formatMemoDate = (timestamp: number): string => {
    return new Intl.DateTimeFormat(locale.value, {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).format(timestamp)
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
