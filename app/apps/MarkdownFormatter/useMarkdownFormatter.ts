import { computed, shallowRef } from 'vue'

export const markdownFormatRuleIds = [
  'indent',
  'trailingSpaces',
  'extraSpaces',
  'blankLines',
  'headingBlank',
  'headingHashSpace',
  'listMarker',
  'bulletChar',
  'hr',
  'finalNewline',
  'olNumber',
  'urlLink',
  'imageUrl',
  'inlineSpaces',
] as const

export type MarkdownFormatRuleId = typeof markdownFormatRuleIds[number]
export type MarkdownFormatRules = Record<MarkdownFormatRuleId, boolean>

export interface DiffLine {
  type: 'same' | 'add' | 'remove'
  text: string
}

export function createDefaultRules(): MarkdownFormatRules {
  return Object.fromEntries(markdownFormatRuleIds.map(id => [id, true])) as MarkdownFormatRules
}

interface Line {
  text: string
  locked: boolean
  heading: boolean
}

interface ListLevel {
  indent: number
  contentCol: number
}

interface ListCounter {
  ordered: boolean
  delim: string
  n: number
}

const IMAGE_EXT = /\.(?:png|jpe?g|gif|webp|svg|avif)$/i
const URL_PATTERN = new RegExp(
  [
    String.raw`!?\[[^\]\n]*\]\([^)\n]*\)`,
    String.raw`\[[^\]\n]*\]\[[^\]\n]*\]`,
    String.raw`<\/?[A-Za-z][^>\n]*>`,
    String.raw`<(?:https?|mailto):[^>\n]*>`,
    String.raw`^[ \t]*\[[^\]\n]+\]:[ \t]*\S+`,
    String.raw`https?:\/\/[A-Za-z0-9\-._~:/?#@!$&'()*+,;=%]+`,
  ].join('|'),
  'g',
)

const indentWidth = (lead: string) => {
  let width = 0
  for (const ch of lead) {
    width += ch === '\t' ? 4 - (width % 4) : 1
  }
  return width
}

const shiftLine = (line: string, shift: number) => {
  if (shift > 0) return ' '.repeat(shift) + line
  if (shift < 0) {
    const spaces = /^ */.exec(line)![0].length
    return line.slice(Math.min(spaces, -shift))
  }
  return line
}

const count = (text: string, char: string) => text.split(char).length - 1

function splitInlineCode(line: string) {
  const parts: { value: string, code: boolean }[] = []
  let buffer = ''
  let i = 0

  while (i < line.length) {
    if (line[i] !== '`') {
      buffer += line[i++]
      continue
    }

    let open = 0
    while (line[i + open] === '`') open++

    let end = -1
    let j = i + open
    while (j < line.length) {
      if (line[j] !== '`') {
        j++
        continue
      }
      let run = 0
      while (line[j + run] === '`') run++
      if (run === open) {
        end = j + run
        break
      }
      j += run
    }

    if (end === -1) {
      buffer += line.slice(i, i + open)
      i += open
      continue
    }

    if (buffer) parts.push({ value: buffer, code: false })
    buffer = ''
    parts.push({ value: line.slice(i, end), code: true })
    i = end
  }

  if (buffer) parts.push({ value: buffer, code: false })
  return parts
}

const isWordChar = (ch: string | undefined) => !!ch && /[\p{L}\p{N}]/u.test(ch)
const isPunctChar = (ch: string | undefined) => !!ch && /[\p{P}\p{S}]/u.test(ch)

function fixEmphasisSpaces(text: string, marker: string) {
  const escaped = marker.replace(/./g, '\\$&')
  const pattern = new RegExp(`${escaped}[ \\t]*((?:(?!${escaped}).)+?)[ \\t]*${escaped}`, 'g')

  return text.replace(pattern, (match, content: string, offset: number, whole: string) => {
    if (!content.trim()) return match

    const before = whole[offset - 1]
    const after = whole[offset + match.length]
    const open = isWordChar(before) && isPunctChar(content[0]) ? ` ${marker}` : marker
    const close = isWordChar(after) && isPunctChar(content[content.length - 1]) ? `${marker} ` : marker
    return open + content + close
  })
}

function fixLinkSpaces(text: string) {
  return text
    .replace(
      /(!?\[[^\]\n]+\])[ \t]+\(((?:https?:\/\/|mailto:|\.{0,2}\/|#)[^)\s]*)\)/g,
      '$1($2)',
    )
    .replace(/\[[ \t]*([^[\]\n]*?)[ \t]*\](?=\()/g, (match, content: string) =>
      content ? `[${content}]` : match)
}

function convertUrls(text: string, rules: MarkdownFormatRules) {
  return text.replace(URL_PATTERN, (match) => {
    if (!match.startsWith('http')) return match

    let url = match
    let tail = ''
    for (;;) {
      const last = url[url.length - 1]
      const unbalanced = last === ')' && count(url, ')') > count(url, '(')
      if (!unbalanced && !/[.,;:!?'*_~]/.test(last!)) break
      tail = last + tail
      url = url.slice(0, -1)
    }
    if (url.length <= 8) return match

    if (rules.imageUrl && IMAGE_EXT.test(url.split(/[?#]/)[0]!)) return `![](${url})${tail}`
    if (rules.urlLink) return `[${url}](${url})${tail}`
    return match
  })
}

export function formatMarkdown(text: string, ruleOverrides: Partial<MarkdownFormatRules> = {}): string {
  const rules: MarkdownFormatRules = { ...createDefaultRules(), ...ruleOverrides }
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const out: Line[] = []
  const stack: ListLevel[] = []
  const counters: ListCounter[] = []

  const push = (value: string, locked = false, heading = false) => {
    out.push({
      text: !locked && rules.trailingSpaces ? value.replace(/[ \t]+$/, '') : value,
      locked,
      heading,
    })
  }

  const inline = (value: string) =>
    splitInlineCode(value).map(({ value: part, code }) => {
      if (code) return part
      let result = part
      if (rules.inlineSpaces) {
        result = fixLinkSpaces(fixEmphasisSpaces(fixEmphasisSpaces(result, '**'), '~~'))
      }
      if (rules.urlLink || rules.imageUrl) result = convertUrls(result, rules)
      return result
    }).join('')

  const resetList = () => {
    stack.length = 0
    counters.length = 0
  }

  let i = 0
  if (lines[0]?.trimEnd() === '---') {
    const close = lines.findIndex((line, index) => index > 0 && /^(?:---|\.\.\.)\s*$/.test(line))
    if (close > 0) {
      for (; i <= close; i++) push(lines[i]!, true)
    }
  }

  let fence: { char: string, len: number, shift: number } | null = null
  let itemDelta = 0
  let prevBlank = true
  let inIndentedCode = false

  for (; i < lines.length; i++) {
    const line = lines[i]!

    if (fence) {
      push(shiftLine(line, fence.shift), true)
      const closing = /^\s*(`{3,}|~{3,})\s*$/.exec(line)
      if (closing && closing[1]![0] === fence.char && closing[1]!.length >= fence.len) fence = null
      prevBlank = false
      continue
    }

    const lead = /^[ \t]*/.exec(line)![0]
    let rest = line.slice(lead.length)
    const indent = indentWidth(lead)

    if (rest.trim() === '') {
      push(line)
      prevBlank = true
      continue
    }

    if (!stack.length && indent >= 4 && (prevBlank || inIndentedCode)) {
      push(line, true)
      inIndentedCode = true
      prevBlank = false
      continue
    }
    inIndentedCode = false
    prevBlank = false

    const fenceOpen = /^(`{3,}|~{3,})(.*)$/.exec(rest)
    if (fenceOpen && !(fenceOpen[1]![0] === '`' && fenceOpen[2]!.includes('`'))) {
      if (indent === 0) resetList()
      const shift = rules.indent && stack.length && indent > 0 ? itemDelta : 0
      push(shiftLine(line, shift), true)
      fence = { char: fenceOpen[1]![0]!, len: fenceOpen[1]!.length, shift }
      continue
    }

    if (rules.bulletChar && /^[・•]/.test(rest)) {
      rest = `- ${rest.replace(/^[・•]\s*/, '')}`
    }

    if ((indent < 4 || stack.length) && /^([-*_])(?:[ \t]*\1){2,}[ \t]*$/.test(rest)) {
      if (indent === 0) resetList()
      const trimmed = rest.trim()
      if (rules.hr && trimmed !== '---') {
        const previous = out[out.length - 1]
        if (!/^-+$/.test(trimmed) && previous && previous.text.trim() !== '') push('')
        push(`${lead}---`)
      } else {
        push(line)
      }
      continue
    }

    if (indent < 4) {
      let heading = rest
      if (rules.headingHashSpace) heading = heading.replace(/^(#{1,6})(?=[^\s#])/, '$1 ')
      if (/^#{1,6}(?:[ \t]|$)/.test(heading)) {
        if (rules.extraSpaces) heading = heading.replace(/^(#{1,6})[ \t]{2,}(?=\S)/, '$1 ')
        if (indent === 0) resetList()
        const [, prefix = '', content = ''] = /^(#{1,6}(?:[ \t]+|$))(.*)$/.exec(heading)!
        push(lead + prefix + inline(content), false, true)
        continue
      }
    }

    const item = /^([-*+]|\d{1,9}[.)])([ \t]+|$)(.*)$/.exec(rest)
    if (item) {
      const [, marker = '', spaces = '', content = ''] = item

      while (stack.length && indent < stack[stack.length - 1]!.indent) stack.pop()
      const top = stack[stack.length - 1]
      if (!top || indent >= top.contentCol) {
        stack.push({ indent, contentCol: indent + marker.length + 1 })
      }
      const depth = stack.length - 1

      counters.length = Math.min(counters.length, depth + 1)
      const ordered = /\d/.test(marker)
      const delim = ordered ? marker.slice(-1) : ''
      const previous = counters[depth]
      const sameList = !!previous && previous.ordered === ordered && previous.delim === delim
      const counter: ListCounter = { ordered, delim, n: sameList ? previous.n + 1 : 1 }
      counters[depth] = counter

      itemDelta = rules.indent ? depth * 4 - indent : 0
      const leadOut = rules.indent ? ' '.repeat(depth * 4) : lead
      let markerOut = marker
      if (ordered && rules.olNumber) markerOut = `${counter.n}${delim}`
      else if (!ordered && rules.listMarker) markerOut = '-'
      const spacesOut = content && rules.extraSpaces && indentWidth(spaces) < 5 ? ' ' : spaces

      push(leadOut + markerOut + spacesOut + inline(content))
      continue
    }

    if (indent === 0) {
      resetList()
      push(inline(rest))
    } else {
      const shifted = stack.length ? shiftLine(lead + inline(rest), itemDelta) : lead + inline(rest)
      push(shifted)
    }
  }

  const isBlank = (line: Line) => !line.locked && line.text.trim() === ''

  let result = out
  if (rules.blankLines) {
    result = result.filter((line, index) => !(isBlank(line) && index > 0 && isBlank(result[index - 1]!)))
  }

  if (rules.headingBlank) {
    const spaced: Line[] = []
    for (const line of result) {
      const previous = spaced[spaced.length - 1]
      if (previous && !isBlank(line) && !isBlank(previous) && (line.heading || previous.heading)) {
        spaced.push({ text: '', locked: false, heading: false })
      }
      spaced.push(line)
    }
    result = spaced
  }

  if (!rules.finalNewline) return result.map(line => line.text).join('\n')

  while (result.length && isBlank(result[result.length - 1]!)) result = result.slice(0, -1)
  if (!result.length) return ''

  const body = result.map(line => line.text).join('\n')
  return body.endsWith('\n') && result[result.length - 1]!.locked ? body : `${body}\n`
}

export function diffLines(before: string, after: string): DiffLine[] {
  const a = before === '' ? [] : before.split('\n')
  const b = after === '' ? [] : after.split('\n')

  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length
  let endB = b.length
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--
    endB--
  }

  const result: DiffLine[] = a.slice(0, start).map(text => ({ type: 'same', text }))
  const midA = a.slice(start, endA)
  const midB = b.slice(start, endB)
  const rows = midA.length + 1
  const cols = midB.length + 1

  if (rows * cols > 4_000_000) {
    result.push(...midA.map((text): DiffLine => ({ type: 'remove', text })))
    result.push(...midB.map((text): DiffLine => ({ type: 'add', text })))
  } else {
    const table = new Int32Array(rows * cols)
    for (let x = midA.length - 1; x >= 0; x--) {
      for (let y = midB.length - 1; y >= 0; y--) {
        table[x * cols + y] = midA[x] === midB[y]
          ? table[(x + 1) * cols + y + 1]! + 1
          : Math.max(table[(x + 1) * cols + y]!, table[x * cols + y + 1]!)
      }
    }

    let x = 0
    let y = 0
    while (x < midA.length && y < midB.length) {
      if (midA[x] === midB[y]) {
        result.push({ type: 'same', text: midA[x]! })
        x++
        y++
      } else if (table[(x + 1) * cols + y]! >= table[x * cols + y + 1]!) {
        result.push({ type: 'remove', text: midA[x++]! })
      } else {
        result.push({ type: 'add', text: midB[y++]! })
      }
    }
    while (x < midA.length) result.push({ type: 'remove', text: midA[x++]! })
    while (y < midB.length) result.push({ type: 'add', text: midB[y++]! })
  }

  result.push(...a.slice(endA).map((text): DiffLine => ({ type: 'same', text })))
  return result
}

export function useMarkdownFormatter() {
  const input = shallowRef('')
  const rules = shallowRef<MarkdownFormatRules>(createDefaultRules())
  const output = computed(() => formatMarkdown(input.value, rules.value))
  const diff = computed(() => diffLines(input.value, output.value))
  const hasChanges = computed(() => diff.value.some(line => line.type !== 'same'))

  return { input, rules, output, diff, hasChanges }
}
