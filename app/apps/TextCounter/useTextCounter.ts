import { computed, shallowRef } from 'vue'

interface TextStats {
  charCountWithSpaces: number
  charCountWithoutSpaces: number
  lineCountWithEmpty: number
  emptyLineCount: number
  maxLineLength: number
  manuscriptPages: number
  bookPages: number
  readingMinutes: number
}

export function useTextCounter() {
  const text = shallowRef('')
  const debouncedText = refDebounced(text, 200)

  const stats = computed<TextStats>(() => {
    const value = debouncedText.value

    if (!value) {
      return {
        charCountWithSpaces: 0,
        charCountWithoutSpaces: 0,
        lineCountWithEmpty: 0,
        emptyLineCount: 0,
        maxLineLength: 0,
        manuscriptPages: 0,
        bookPages: 0,
        readingMinutes: 0,
      }
    }

    const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const charsWithSpaces = [...normalized]
    const charsWithoutSpaces = [...normalized.replace(/\s/g, '')]
    const lines = normalized.split('\n')
    const emptyLineCount = lines.filter(line => line.trim() === '').length
    let maxLineLength = 0
    let manuscriptLinesTotal = 0

    for (const line of lines) {
      const lineLength = [...line].length
      maxLineLength = Math.max(maxLineLength, lineLength)
      manuscriptLinesTotal += Math.ceil(lineLength / 20) || 1
    }

    return {
      charCountWithSpaces: charsWithSpaces.length,
      charCountWithoutSpaces: charsWithoutSpaces.length,
      lineCountWithEmpty: lines.length,
      emptyLineCount,
      maxLineLength,
      manuscriptPages: Math.ceil(manuscriptLinesTotal / 20),
      bookPages: Math.ceil(charsWithSpaces.length / 600),
      readingMinutes: Math.round(charsWithSpaces.length / 400),
    }
  })

  const clearText = () => {
    text.value = ''
  }

  return {
    text,
    stats,
    clearText,
  }
}
