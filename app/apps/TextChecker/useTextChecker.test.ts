import { describe, expect, it } from 'vitest'
import { useTextChecker } from './useTextChecker'

describe('useTextChecker', () => {
  it('creates grouped insertion diff chunks', () => {
    const checker = useTextChecker()
    checker.input.value = '今日は晴れ'
    checker.result.value = '今日はとても晴れ'

    expect(checker.diff.value).toEqual([
      { text: '今日は', isMarked: false },
      { text: 'とても', isMarked: true },
      { text: '晴れ', isMarked: false },
    ])
  })

  it('rejects a check without an API key', async () => {
    const checker = useTextChecker()
    checker.input.value = '文章'
    await checker.check()

    expect(checker.error.value).toBe('missingKey')
  })
})
