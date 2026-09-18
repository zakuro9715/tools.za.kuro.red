import { onMounted, reactive, shallowRef, watch } from 'vue'

interface CharacterSets {
  numbers: boolean
  letters: boolean
  symbols: boolean
}

export interface PasswordPreset {
  name: string
  length: number
  charSets: CharacterSets
  requireAllTypes: boolean
  customChars: string
}

const numbers = '0123456789'
const lowercase = 'abcdefghijklmnopqrstuvwxyz'
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const symbols = '-_!@#$%'
const storageKey = 'zakuro_pw_generator_custom_presets'

function randomInt(max: number): number {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)
  return values[0]! % max
}

export function usePasswordGenerator() {
  const password = shallowRef('')
  const length = shallowRef(32)
  const activePreset = shallowRef('strong')
  const copied = shallowRef(false)
  const newPresetName = shallowRef('')
  const customChars = shallowRef('')
  const requireAllTypes = shallowRef(true)
  const charSets = reactive<CharacterSets>({
    numbers: true,
    letters: true,
    symbols: true,
  })
  const customPresets = shallowRef<PasswordPreset[]>([])
  let copiedTimeout: ReturnType<typeof setTimeout> | undefined

  const generatePassword = () => {
    let pool = ''
    const requiredChars: string[] = []

    if (charSets.numbers) {
      pool += numbers
      if (requireAllTypes.value) requiredChars.push(numbers[randomInt(numbers.length)]!)
    }
    if (charSets.letters) {
      pool += lowercase + uppercase
      if (requireAllTypes.value) {
        requiredChars.push(lowercase[randomInt(lowercase.length)]!)
        requiredChars.push(uppercase[randomInt(uppercase.length)]!)
      }
    }
    if (charSets.symbols) {
      pool += symbols
      if (requireAllTypes.value) requiredChars.push(symbols[randomInt(symbols.length)]!)
    }
    if (customChars.value) {
      pool += customChars.value
      if (requireAllTypes.value) requiredChars.push(customChars.value[randomInt(customChars.value.length)]!)
    }

    if (!pool) {
      password.value = ''
      return
    }

    const result = requireAllTypes.value && requiredChars.length <= length.value
      ? [...requiredChars]
      : []

    while (result.length < length.value) {
      result.push(pool[randomInt(pool.length)]!)
    }

    for (let index = result.length - 1; index > 0; index--) {
      const randomIndex = randomInt(index + 1)
      ;[result[index], result[randomIndex]] = [result[randomIndex]!, result[index]!]
    }

    password.value = result.join('')
  }

  const applyBuiltinPreset = (preset: 'strong' | 'simple') => {
    activePreset.value = preset
    customChars.value = ''

    if (preset === 'strong') {
      length.value = 32
      charSets.numbers = true
      charSets.letters = true
      charSets.symbols = true
      requireAllTypes.value = true
      return
    }

    length.value = 12
    charSets.numbers = true
    charSets.letters = true
    charSets.symbols = false
    requireAllTypes.value = false
  }

  const applyCustomPreset = (preset: PasswordPreset) => {
    activePreset.value = preset.name
    length.value = preset.length
    charSets.numbers = preset.charSets.numbers
    charSets.letters = preset.charSets.letters
    charSets.symbols = preset.charSets.symbols
    requireAllTypes.value = preset.requireAllTypes
    customChars.value = preset.customChars || ''
  }

  const savePresets = () => {
    localStorage.setItem(storageKey, JSON.stringify(customPresets.value))
  }

  const savePreset = () => {
    const name = newPresetName.value.trim()
    if (!name) return

    const preset: PasswordPreset = {
      name,
      length: length.value,
      charSets: { ...charSets },
      requireAllTypes: requireAllTypes.value,
      customChars: customChars.value,
    }

    customPresets.value = [
      ...customPresets.value.filter(item => item.name !== preset.name),
      preset,
    ]
    savePresets()
    activePreset.value = preset.name
    newPresetName.value = ''
  }

  const deleteCustomPreset = (name: string) => {
    customPresets.value = customPresets.value.filter(item => item.name !== name)
    savePresets()
    if (activePreset.value === name) {
      activePreset.value = 'custom'
    }
  }

  const copyPassword = () => {
    if (!password.value) return

    if (navigator.clipboard && window.isSecureContext) {
      void navigator.clipboard.writeText(password.value)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = password.value
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
      } catch (error) {
        console.error('Failed to copy password.', error)
      }
      document.body.removeChild(textArea)
    }

    copied.value = true
    if (copiedTimeout) clearTimeout(copiedTimeout)
    copiedTimeout = setTimeout(() => {
      copied.value = false
    }, 2000)
  }

  const loadCustomPresets = () => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        customPresets.value = JSON.parse(saved) as PasswordPreset[]
      }
    } catch (error) {
      console.error('Failed to load custom password presets.', error)
    }
  }

  watch([length, charSets, requireAllTypes, customChars], generatePassword, { deep: true })

  onMounted(() => {
    loadCustomPresets()
    applyBuiltinPreset('strong')
    generatePassword()
  })

  return {
    password,
    length,
    activePreset,
    copied,
    newPresetName,
    customChars,
    requireAllTypes,
    charSets,
    customPresets,
    generatePassword,
    applyBuiltinPreset,
    applyCustomPreset,
    savePreset,
    deleteCustomPreset,
    copyPassword,
  }
}
