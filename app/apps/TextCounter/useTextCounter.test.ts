import { describe, expect, it } from 'vitest'
import { useTextCounter } from './useTextCounter'

const waitForDebounce = () => new Promise(resolve => setTimeout(resolve, 250))

describe('TextCounter', () => {
  it('returns zeroed statistics for empty text', () => {
    const { stats } = useTextCounter()

    expect(stats.value).toEqual({
      charCountWithSpaces: 0,
      charCountWithoutSpaces: 0,
      lineCountWithEmpty: 0,
      emptyLineCount: 0,
      maxLineLength: 0,
      manuscriptPages: 0,
      bookPages: 0,
      readingMinutes: 0,
    })
  })

  it('counts Unicode characters, whitespace, and normalized lines', async () => {
    const { stats, text } = useTextCounter()

    text.value = 'あい\r\nabc\n\n'
    await waitForDebounce()

    expect(stats.value).toEqual({
      charCountWithSpaces: 8,
      charCountWithoutSpaces: 5,
      lineCountWithEmpty: 4,
      emptyLineCount: 2,
      maxLineLength: 3,
      manuscriptPages: 1,
      bookPages: 1,
      readingMinutes: 0,
    })
  })

  it('calculates page and reading-time estimates', async () => {
    const { stats, text } = useTextCounter()

    text.value = 'a'.repeat(800)
    await waitForDebounce()

    expect(stats.value).toMatchObject({
      manuscriptPages: 2,
      bookPages: 2,
      readingMinutes: 2,
    })
  })

  it('clears the text', () => {
    const { clearText, text } = useTextCounter()

    text.value = 'Text to clear'
    clearText()

    expect(text.value).toBe('')
  })
})
