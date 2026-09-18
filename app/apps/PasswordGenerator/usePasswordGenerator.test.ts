import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePasswordGenerator } from './usePasswordGenerator'

async function mountPasswordGeneratorComposable() {
  let passwordGenerator: ReturnType<typeof usePasswordGenerator> | undefined

  await mountSuspended(defineComponent({
    setup() {
      passwordGenerator = usePasswordGenerator()
      return () => null
    },
  }))

  return passwordGenerator!
}

describe('usePasswordGenerator', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((values) => {
      if (values instanceof Uint32Array) values[0] = 0
      return values
    })
  })

  it('generates a password that includes every selected character type', async () => {
    const { generatePassword, password } = await mountPasswordGeneratorComposable()

    generatePassword()

    expect(password.value).toHaveLength(32)
    expect(password.value).toMatch(/[0-9]/)
    expect(password.value).toMatch(/[a-z]/)
    expect(password.value).toMatch(/[A-Z]/)
    expect(password.value).toMatch(/[-_!@#$%]/)
  })

  it('applies built-in presets', async () => {
    const { applyBuiltinPreset, charSets, length, requireAllTypes } = await mountPasswordGeneratorComposable()

    applyBuiltinPreset('simple')

    expect(length.value).toBe(12)
    expect(charSets).toEqual({ numbers: true, letters: true, symbols: false })
    expect(requireAllTypes.value).toBe(false)
  })

  it('saves, applies, and deletes custom presets', async () => {
    const {
      activePreset,
      applyCustomPreset,
      charSets,
      customChars,
      customPresets,
      deleteCustomPreset,
      length,
      newPresetName,
      requireAllTypes,
      savePreset,
    } = await mountPasswordGeneratorComposable()

    length.value = 16
    charSets.symbols = false
    customChars.value = '+'
    requireAllTypes.value = false
    newPresetName.value = 'Personal'
    savePreset()

    expect(customPresets.value).toHaveLength(1)
    expect(JSON.parse(localStorage.getItem('zakuro_pw_generator_custom_presets') ?? '[]')).toHaveLength(1)

    length.value = 32
    applyCustomPreset(customPresets.value[0]!)
    expect(length.value).toBe(16)
    expect(activePreset.value).toBe('Personal')

    deleteCustomPreset('Personal')
    expect(customPresets.value).toEqual([])
    expect(activePreset.value).toBe('custom')
  })
})
