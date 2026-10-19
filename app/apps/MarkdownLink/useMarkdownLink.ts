import { computed, shallowRef, watch } from 'vue'

export type MarkdownLinkMode = 'link' | 'image'
type MarkdownLinkError = 'copyFailed'

const fetchTimeoutMs = 5000

function isHttpUrl(value: string) {
  return /^https?:\/\/\S+$/i.test(value)
}

async function fetchPageTitle(url: string): Promise<string | null> {
  if (!isHttpUrl(url)) {
    return null
  }

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(fetchTimeoutMs) })
    if (!response.ok) {
      return null
    }
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html')
    return doc.title.replace(/\s+/g, ' ').trim() || null
  } catch {
    return null
  }
}

export function useMarkdownLink() {
  const mode = shallowRef<MarkdownLinkMode>('link')
  const url = shallowRef('')
  const title = shallowRef('')
  const alt = shallowRef('')
  const imageUrl = shallowRef('')
  const linkUrl = shallowRef('')
  const fetchedTitles = shallowRef<Record<string, string>>({})
  const error = shallowRef<MarkdownLinkError | null>(null)
  const requested = new Set<string>()

  const trimmedUrl = computed(() => url.value.trim())
  const manualTitle = computed(() => title.value.trim())

  const result = computed(() => {
    if (mode.value === 'image') {
      const image = imageUrl.value.trim()
      const link = linkUrl.value.trim()
      if (!image) {
        return ''
      }
      const markdown = `![${alt.value.trim()}](${image})`
      return link ? `[${markdown}](${link})` : markdown
    }

    if (!trimmedUrl.value) {
      return ''
    }
    return `[${manualTitle.value || fetchedTitles.value[trimmedUrl.value] || trimmedUrl.value}](${trimmedUrl.value})`
  })

  watch([mode, trimmedUrl, manualTitle], ([currentMode, target, manual]) => {
    if (currentMode !== 'link' || manual || !target || requested.has(target)) {
      return
    }
    requested.add(target)
    void fetchPageTitle(target).then((fetched) => {
      if (fetched) {
        fetchedTitles.value = { ...fetchedTitles.value, [target]: fetched }
      }
    })
  })

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(result.value)
      error.value = null
    } catch (cause) {
      console.error('Failed to copy the Markdown.', cause)
      error.value = 'copyFailed'
    }
  }

  return {
    mode,
    url,
    title,
    alt,
    imageUrl,
    linkUrl,
    result,
    error,
    copyResult,
    isHttpUrl,
    fetchPageTitle,
  }
}
