import { computed, shallowRef } from 'vue'

export type PresetPatternId = 'wayback' | 'gyo-tc' | 'steam' | 'mobile-to-desktop' | 'remove-www' | 'remove-fragment'

interface PatternRule {
  before: string
  after: string
  isRegex: boolean
}

export interface PresetPattern extends PatternRule {
  id: PresetPatternId
}

export interface SavedPattern extends PatternRule {
  id: string
  name: string
}

type ReplaceURLError = 'invalidName' | 'duplicateName' | 'loadFailed' | 'saveFailed' | 'copyFailed'

const storageKey = 'tools_replace_url_patterns'

const presetPatterns: PresetPattern[] = [
  { id: 'wayback', before: '^', after: 'https://web.archive.org/web/', isRegex: true },
  { id: 'gyo-tc', before: '^', after: 'https://gyo.tc/', isRegex: true },
  { id: 'steam', before: '^', after: 'steam://openurl/', isRegex: true },
  { id: 'mobile-to-desktop', before: '^(https?://)(?:m|mobile)\\.', after: '$1', isRegex: true },
  { id: 'remove-www', before: '://www.', after: '://', isRegex: false },
  { id: 'remove-fragment', before: '#.*$', after: '', isRegex: true },
]

function isSavedPattern(value: unknown): value is SavedPattern {
  if (!value || typeof value !== 'object') {
    return false
  }

  return 'id' in value
    && typeof value.id === 'string'
    && 'name' in value
    && typeof value.name === 'string'
    && 'before' in value
    && typeof value.before === 'string'
    && 'after' in value
    && typeof value.after === 'string'
    && 'isRegex' in value
    && typeof value.isRegex === 'boolean'
}

export function useReplaceURL() {
  const url = shallowRef('')
  const before = shallowRef('')
  const after = shallowRef('')
  const isRegex = shallowRef(false)
  const patternName = shallowRef('')
  const savedPatterns = shallowRef<SavedPattern[]>([])
  const error = shallowRef<ReplaceURLError | null>(null)

  const result = computed(() => {
    if (!before.value && !isRegex.value) {
      return { url: `${after.value}${url.value}`, error: null }
    }

    if (!isRegex.value) {
      return { url: url.value.split(before.value).join(after.value), error: null }
    }

    try {
      return { url: url.value.replace(new RegExp(before.value, 'g'), after.value), error: null }
    } catch {
      return { url: '', error: 'invalidRegex' as const }
    }
  })

  const isOpenable = computed(() => {
    try {
      return ['http:', 'https:', 'steam:'].includes(new URL(result.value.url).protocol)
    } catch {
      return false
    }
  })

  const loadPatterns = () => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
      savedPatterns.value = Array.isArray(parsed) ? parsed.filter(isSavedPattern) : []
    } catch (cause) {
      console.error('Failed to load URL replacer patterns.', cause)
      error.value = 'loadFailed'
    }
  }

  const persistPatterns = (patterns: SavedPattern[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(patterns))
      savedPatterns.value = patterns
      return true
    } catch (cause) {
      console.error('Failed to save URL replacer patterns.', cause)
      error.value = 'saveFailed'
      return false
    }
  }

  const usePattern = (pattern: PresetPattern | SavedPattern) => {
    before.value = pattern.before
    after.value = pattern.after
    isRegex.value = pattern.isRegex
    patternName.value = 'name' in pattern ? pattern.name : ''
    error.value = null
  }

  const savePattern = () => {
    const name = patternName.value.trim()
    if (!name) {
      error.value = 'invalidName'
      return false
    }

    if (savedPatterns.value.some(pattern => pattern.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      error.value = 'duplicateName'
      return false
    }

    const saved = persistPatterns([
      ...savedPatterns.value,
      {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        before: before.value,
        after: after.value,
        isRegex: isRegex.value,
      },
    ])
    return saved
  }

  const deletePattern = (id: string) => {
    persistPatterns(savedPatterns.value.filter(pattern => pattern.id !== id))
  }

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(result.value.url)
      error.value = null
    } catch (cause) {
      console.error('Failed to copy the replaced URL.', cause)
      error.value = 'copyFailed'
    }
  }

  return {
    presetPatterns,
    url,
    before,
    after,
    isRegex,
    patternName,
    savedPatterns,
    error,
    result,
    isOpenable,
    loadPatterns,
    usePattern,
    savePattern,
    deletePattern,
    copyResult,
  }
}
