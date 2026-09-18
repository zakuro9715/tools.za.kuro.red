/* eslint-disable @stylistic/max-statements-per-line */
import { computed, reactive, shallowRef } from 'vue'

export interface TextIssue {
  original: string
  suggestion: string
  reason: string
  type: string
}

interface DiffChunk { text: string, isMarked: boolean }

const defaultPrompt = 'あなたは日本語の文章校正の専門家です。与えられた文章の誤字、脱字、不自然な文法、不適切な表現を分析・修正してください。'

export function useTextChecker() {
  const input = shallowRef('')
  const result = shallowRef('')
  const issues = shallowRef<TextIssue[]>([])
  const apiKey = shallowRef('')
  const model = shallowRef('gemini-3.5-flash-lite')
  const systemPrompt = shallowRef(defaultPrompt)
  const loading = shallowRef(false)
  const error = shallowRef<'missingKey' | 'request' | 'copy' | null>(null)
  const hasChecked = shallowRef(false)
  const highlightDiff = shallowRef(true)
  const copied = shallowRef(false)
  const settingsOpen = shallowRef(false)
  const models = reactive([
    { label: 'Gemini 3.7 Flash', value: 'gemini-3.7-flash' },
    { label: 'Gemini 3.6 Flash', value: 'gemini-3.6-flash' },
    { label: 'Gemini 3.5 Flash', value: 'gemini-3.5-flash' },
    { label: 'Gemini 3.5 Flash Lite', value: 'gemini-3.5-flash-lite' },
    { label: 'Gemini 3.1 Flash Lite', value: 'gemini-3.1-flash-lite' },
    { label: 'Gemma 4 31B', value: 'gemma-4-31b-it' },
  ])

  const diff = computed<DiffChunk[]>(() => {
    const source = Array.from(input.value)
    const corrected = Array.from(result.value)
    const matrix = Array.from({ length: source.length + 1 }, () => new Int32Array(corrected.length + 1))
    for (let index = 0; index < source.length; index++) {
      for (let correctionIndex = 0; correctionIndex < corrected.length; correctionIndex++) {
        matrix[index + 1]![correctionIndex + 1] = source[index] === corrected[correctionIndex]
          ? matrix[index]![correctionIndex]! + 1
          : Math.max(matrix[index]![correctionIndex + 1]!, matrix[index + 1]![correctionIndex]!)
      }
    }
    const chars: Array<{ char: string, added: boolean }> = []
    let index = source.length
    let correctionIndex = corrected.length
    while (index > 0 || correctionIndex > 0) {
      if (index > 0 && correctionIndex > 0 && source[index - 1] === corrected[correctionIndex - 1]) {
        chars.unshift({ char: corrected[--correctionIndex]!, added: false }); index--
      } else if (correctionIndex > 0 && (index === 0 || matrix[index]![correctionIndex - 1]! >= matrix[index - 1]![correctionIndex]!)) {
        chars.unshift({ char: corrected[--correctionIndex]!, added: true })
      } else index--
    }
    return chars.reduce<DiffChunk[]>((chunks, char) => {
      const previous = chunks.at(-1)
      if (previous && previous.isMarked === char.added) previous.text += char.char
      else chunks.push({ text: char.char, isMarked: char.added })
      return chunks
    }, [])
  })

  const saveSettings = () => {
    localStorage.setItem('gemini_api_key', apiKey.value)
    localStorage.setItem('text_checker_model', model.value)
    localStorage.setItem('text_checker_prompt', systemPrompt.value)
  }
  const loadSettings = () => {
    apiKey.value = localStorage.getItem('gemini_api_key') || ''
    model.value = localStorage.getItem('text_checker_model') || model.value
    systemPrompt.value = localStorage.getItem('text_checker_prompt') || defaultPrompt
  }
  const resetPrompt = () => {
    systemPrompt.value = defaultPrompt
    localStorage.removeItem('text_checker_prompt')
  }
  const clear = () => {
    input.value = ''; result.value = ''; issues.value = []; hasChecked.value = false; error.value = null
  }
  const check = async () => {
    if (!input.value.trim()) return
    if (!apiKey.value.trim()) { error.value = 'missingKey'; return }
    loading.value = true; error.value = null; hasChecked.value = false; issues.value = []; result.value = ''
    const payload = {
      contents: [{ parts: [{ text: `以下の文章を校正してください:\n\n${input.value}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt.value }] },
      generationConfig: { responseMimeType: 'application/json' },
    }
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.value}:generateContent?key=${apiKey.value}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!response.ok) throw new Error(String(response.status))
        const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!content) throw new Error('Invalid response')
        const parsed = JSON.parse(content) as { correctedText?: string, issues?: TextIssue[] }
        result.value = parsed.correctedText || ''
        issues.value = Array.isArray(parsed.issues) ? parsed.issues : []
        hasChecked.value = true
        break
      } catch {
        if (attempt === 2) error.value = 'request'
        else await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000))
      }
    }
    loading.value = false
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.value)
      copied.value = true
      setTimeout(() => { copied.value = false }, 2000)
    } catch { error.value = 'copy' }
  }

  return { input, result, issues, apiKey, model, systemPrompt, loading, error, hasChecked, highlightDiff, copied, settingsOpen, models, diff, loadSettings, saveSettings, resetPrompt, clear, check, copy }
}
