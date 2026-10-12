import { beforeEach, describe, expect, it } from 'vitest'
import { presetPatterns, useReplaceURL } from './useReplaceURL'

describe('useReplaceURL', () => {
  beforeEach(() => localStorage.clear())

  it('replaces every literal occurrence without interpreting replacement tokens', () => {
    const replacer = useReplaceURL()
    replacer.url.value = 'https://example.com/a/a'
    replacer.before.value = '/a'
    replacer.after.value = '/$&'

    expect(replacer.result.value).toEqual({
      url: 'https://example.com/$&/$&',
      error: null,
    })
  })

  it('uses a global regular expression when enabled', () => {
    const replacer = useReplaceURL()
    replacer.url.value = 'https://www.example.com/www'
    replacer.before.value = 'www'
    replacer.after.value = 'site'
    replacer.isRegex.value = true

    expect(replacer.result.value.url).toBe('https://site.example.com/site')
  })

  it('reports invalid regular expressions', () => {
    const replacer = useReplaceURL()
    replacer.url.value = 'https://example.com'
    replacer.before.value = '['
    replacer.isRegex.value = true

    expect(replacer.result.value).toEqual({ url: '', error: 'invalidRegex' })
  })

  it('applies the built-in Wayback pattern', () => {
    const replacer = useReplaceURL()
    replacer.url.value = 'https://example.com/page'
    replacer.usePattern(presetPatterns[0]!)

    expect(replacer.result.value.url).toBe('https://web.archive.org/web/https://example.com/page')
    expect(replacer.isOpenable.value).toBe(true)
  })

  it('converts mobile subdomains to the regular site domain', () => {
    const replacer = useReplaceURL()
    replacer.url.value = 'https://mobile.example.com/path?query=value'
    replacer.usePattern(presetPatterns.find(pattern => pattern.id === 'mobile-to-desktop')!)

    expect(replacer.result.value.url).toBe('https://example.com/path?query=value')

    replacer.url.value = 'http://m.example.com/path'
    expect(replacer.result.value.url).toBe('http://example.com/path')
  })

  it('allows Steam links but rejects unsafe URL protocols', () => {
    const replacer = useReplaceURL()
    replacer.url.value = 'https://example.com'
    replacer.usePattern(presetPatterns.find(pattern => pattern.id === 'steam')!)
    expect(replacer.result.value.url).toBe('steam://openurl/https://example.com')
    expect(replacer.isOpenable.value).toBe(true)

    replacer.url.value = 'javascript:alert(1)'
    replacer.before.value = ''
    replacer.after.value = ''
    replacer.isRegex.value = false
    expect(replacer.isOpenable.value).toBe(false)
  })

  it('saves, loads, and deletes named patterns', () => {
    const replacer = useReplaceURL()
    replacer.before.value = 'www.'
    replacer.after.value = ''
    replacer.patternName.value = 'Remove www'
    replacer.savePattern()

    const saved = JSON.parse(localStorage.getItem('tools_replace_url_patterns') ?? '[]') as Array<{ id: string, name: string }>
    expect(saved).toHaveLength(1)
    expect(saved[0]?.name).toBe('Remove www')

    const restored = useReplaceURL()
    restored.loadPatterns()
    expect(restored.savedPatterns.value).toHaveLength(1)
    restored.deletePattern(saved[0]!.id)
    expect(JSON.parse(localStorage.getItem('tools_replace_url_patterns') ?? '[]')).toEqual([])
  })

  it('rejects empty and duplicate pattern names', () => {
    const replacer = useReplaceURL()
    replacer.savePattern()
    expect(replacer.error.value).toBe('invalidName')

    replacer.patternName.value = 'Pattern'
    replacer.savePattern()
    replacer.savePattern()
    expect(replacer.error.value).toBe('duplicateName')
    expect(replacer.savedPatterns.value).toHaveLength(1)
  })
})
