import { describe, expect, it } from 'vitest'
import {
  createDefaultRules,
  diffLines,
  formatMarkdown,
  markdownFormatRuleIds,
  useMarkdownFormatter,
} from './useMarkdownFormatter'

const only = (id: MarkdownFormatRuleId, text: string) => {
  const rules = Object.fromEntries(markdownFormatRuleIds.map(rule => [rule, rule === id]))
  return formatMarkdown(text, rules)
}

describe('createDefaultRules', () => {
  it('enables every rule', () => {
    const rules = createDefaultRules()

    expect(markdownFormatRuleIds.every(id => rules[id] === true)).toBe(true)
  })
})

describe('formatMarkdown general formatting', () => {
  it('normalizes nested list indents to 4 spaces', () => {
    expect(only('indent', '- a\n  - b\n    - c\n- d')).toBe('- a\n    - b\n        - c\n- d')
  })

  it('converts tab indents to 4 spaces', () => {
    expect(only('indent', '- a\n\t- b')).toBe('- a\n    - b')
  })

  it('removes trailing spaces', () => {
    expect(only('trailingSpaces', 'a  \nb\t\n')).toBe('a\nb\n')
  })

  it('removes extra spaces after list and heading markers', () => {
    expect(only('extraSpaces', '#   Title\n-   item\n1.   one')).toBe('# Title\n- item\n1. one')
  })

  it('collapses consecutive blank lines into one', () => {
    expect(only('blankLines', 'a\n\n\n\nb')).toBe('a\n\nb')
  })

  it('adds blank lines around headings', () => {
    expect(only('headingBlank', 'text\n# Title\nbody')).toBe('text\n\n# Title\n\nbody')
  })

  it('does not add blank lines at the start or end of the document', () => {
    expect(only('headingBlank', '# Title\nbody\n## End')).toBe('# Title\n\nbody\n\n## End')
  })

  it('adds a space after # in headings', () => {
    expect(only('headingHashSpace', '#Title\n##Sub')).toBe('# Title\n## Sub')
  })

  it('unifies bullet list markers to -', () => {
    expect(only('listMarker', '* a\n+ b\n- c')).toBe('- a\n- b\n- c')
  })

  it('converts bullet characters to - lists', () => {
    expect(only('bulletChar', '・a\n• b')).toBe('- a\n- b')
  })

  it('unifies horizontal rules to ---', () => {
    expect(only('hr', 'a\n\n***\n\n___\n\n* * *')).toBe('a\n\n---\n\n---\n\n---')
  })

  it('keeps a blank line before a converted rule to avoid a setext heading', () => {
    expect(only('hr', 'text\n***')).toBe('text\n\n---')
  })

  it('ends with exactly one newline', () => {
    expect(only('finalNewline', 'a\n\n\n')).toBe('a\n')
    expect(only('finalNewline', 'a')).toBe('a\n')
  })

  it('returns an empty string for empty input', () => {
    expect(formatMarkdown('')).toBe('')
  })

  it('normalizes CRLF line breaks to LF', () => {
    expect(only('trailingSpaces', 'a\r\nb')).toBe('a\nb')
  })
})

describe('formatMarkdown auto fix', () => {
  it('renumbers ordered lists from 1', () => {
    expect(only('olNumber', '3. a\n7. b\n2. c')).toBe('1. a\n2. b\n3. c')
  })

  it('renumbers nested and separate ordered lists independently', () => {
    const input = '5. a\n    9. x\n    9. y\n5. b\n\ntext\n\n4. c\n4. d'

    expect(only('olNumber', input)).toBe('1. a\n    1. x\n    2. y\n2. b\n\ntext\n\n1. c\n2. d')
  })

  it('keeps the ) delimiter when renumbering', () => {
    expect(only('olNumber', '2) a\n2) b')).toBe('1) a\n2) b')
  })

  it('converts URLs in text to markdown links', () => {
    expect(only('urlLink', 'see https://example.com/a?b=1 now'))
      .toBe('see [https://example.com/a?b=1](https://example.com/a?b=1) now')
  })

  it('excludes trailing punctuation and Japanese text from URLs', () => {
    expect(only('urlLink', 'https://example.com。次\nvisit https://example.com.'))
      .toBe('[https://example.com](https://example.com)。次\nvisit [https://example.com](https://example.com).')
  })

  it('keeps balanced parentheses inside URLs', () => {
    expect(only('urlLink', 'https://en.wikipedia.org/wiki/A_(b)'))
      .toBe('[https://en.wikipedia.org/wiki/A_(b)](https://en.wikipedia.org/wiki/A_(b))')
    expect(only('urlLink', '(https://example.com)'))
      .toBe('([https://example.com](https://example.com))')
  })

  it('does not convert URLs that are already links, autolinks, or html', () => {
    const input = '[a](https://example.com) <https://example.com> <a href="https://example.com">x</a> ![i](https://example.com/a.png)'

    expect(only('urlLink', input)).toBe(input)
  })

  it('converts image URLs to markdown images', () => {
    expect(only('imageUrl', 'https://example.com/a.PNG and https://example.com/b.webp?w=100#x'))
      .toBe('![](https://example.com/a.PNG) and ![](https://example.com/b.webp?w=100#x)')
  })

  it('leaves non-image URLs alone when only image conversion is enabled', () => {
    expect(only('imageUrl', 'https://example.com/page')).toBe('https://example.com/page')
  })

  it('converts image URLs to plain links when image conversion is disabled', () => {
    const rules = { ...createDefaultRules(), imageUrl: false }

    expect(formatMarkdown('https://example.com/a.png', rules).trim())
      .toBe('[https://example.com/a.png](https://example.com/a.png)')
  })

  it('removes spaces inside bold and strikethrough markers', () => {
    expect(only('inlineSpaces', '** bold ** and ~~ gone ~~')).toBe('**bold** and ~~gone~~')
  })

  it('removes spaces between link text and destination', () => {
    expect(only('inlineSpaces', '[text] (https://example.com) and [ t ](./a)'))
      .toBe('[text](https://example.com) and [t](./a)')
  })

  it('adds a space when bold ending with punctuation touches following text', () => {
    expect(only('inlineSpaces', '**注意（重要）**です')).toBe('**注意（重要）** です')
  })

  it('does not touch plain parentheses after brackets', () => {
    expect(only('inlineSpaces', '[x] (note)')).toBe('[x] (note)')
  })
})

describe('formatMarkdown protected content', () => {
  const rules = createDefaultRules()

  it('does not change fenced code blocks', () => {
    const input = '```\n*  a  \n\n\n#x\nhttps://example.com\n```\n'

    expect(formatMarkdown(input, rules)).toBe(input)
  })

  it('does not change tilde fences or longer fences', () => {
    const input = '~~~\n#x  \n~~~\n\n````\n```\n#y\n```\n````\n'

    expect(formatMarkdown(input, rules)).toBe(input)
  })

  it('does not change inline code', () => {
    expect(formatMarkdown('use `https://example.com` and `** x **`\n', rules))
      .toBe('use `https://example.com` and `** x **`\n')
  })

  it('does not change indented code blocks', () => {
    const input = 'text\n\n        code  \n        more\n'

    expect(formatMarkdown(input, rules)).toBe(input)
  })

  it('does not change front matter', () => {
    const input = '---\ntitle:   x  \n\n\n---\n\n# Title\n'

    expect(formatMarkdown(input, rules)).toBe(input)
  })
})

describe('formatMarkdown with all rules', () => {
  it('formats a mixed document', () => {
    const input = '#Title  \ntext https://example.com\n*   a\n  * b\n\n\n\n3. x\n9. y\n'
    const expected = '# Title\n\ntext [https://example.com](https://example.com)\n- a\n    - b\n\n1. x\n2. y\n'

    expect(formatMarkdown(input)).toBe(expected)
  })

  it('is idempotent', () => {
    const once = formatMarkdown('#Title\n* a\n  * b\n\n\n3. x\nhttps://example.com/a.png\n')

    expect(formatMarkdown(once)).toBe(once)
  })

  it('returns the input unchanged when every rule is disabled', () => {
    const rules = Object.fromEntries(markdownFormatRuleIds.map(id => [id, false]))
    const input = '#Title  \n*   a\n\n\n\nhttps://example.com'

    expect(formatMarkdown(input, rules)).toBe(input)
  })
})

describe('diffLines', () => {
  it('marks identical text as same', () => {
    expect(diffLines('a\nb', 'a\nb')).toEqual([
      { type: 'same', text: 'a' },
      { type: 'same', text: 'b' },
    ])
  })

  it('marks removed and added lines', () => {
    expect(diffLines('a\nb\nc', 'a\nx\nc')).toEqual([
      { type: 'same', text: 'a' },
      { type: 'remove', text: 'b' },
      { type: 'add', text: 'x' },
      { type: 'same', text: 'c' },
    ])
  })

  it('handles insertions and deletions', () => {
    expect(diffLines('a', 'a\nb')).toEqual([
      { type: 'same', text: 'a' },
      { type: 'add', text: 'b' },
    ])
    expect(diffLines('a\nb', 'b')).toEqual([
      { type: 'remove', text: 'a' },
      { type: 'same', text: 'b' },
    ])
  })

  it('returns no lines for two empty strings', () => {
    expect(diffLines('', '')).toEqual([])
  })
})

describe('useMarkdownFormatter', () => {
  it('starts with empty input and all rules enabled', () => {
    const { input, output, rules, hasChanges } = useMarkdownFormatter()

    expect(input.value).toBe('')
    expect(output.value).toBe('')
    expect(hasChanges.value).toBe(false)
    expect(markdownFormatRuleIds.every(id => rules.value[id])).toBe(true)
  })

  it('formats the input and reports changes', () => {
    const { input, output, diff, hasChanges } = useMarkdownFormatter()

    input.value = '#Title'

    expect(output.value).toBe('# Title\n')
    expect(hasChanges.value).toBe(true)
    expect(diff.value.some(line => line.type === 'add')).toBe(true)
  })

  it('reflects rule changes in the output', () => {
    const { input, output, rules } = useMarkdownFormatter()

    input.value = '#Title'
    rules.value = { ...rules.value, headingHashSpace: false }

    expect(output.value).toBe('#Title\n')
  })
})
