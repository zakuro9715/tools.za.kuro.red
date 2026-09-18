/* eslint-disable @stylistic/max-statements-per-line */
import { computed, shallowRef } from 'vue'

export type ParameterType = 'bool' | 'float' | 'int' | 'color' | 'vector' | 'string'
export interface PresetData { techniques: string[], techniqueSorting: string[], preprocessors: string, shaders: Record<string, Record<string, string>> }

const presets = {
  cinematic: `Techniques=AdaptiveSharpen@AdaptiveSharpen.fx,AmbientLight@AmbientLight.fx,Clarity@Clarity.fx,Colourfulness@Colourfulness.fx,Vibrance@Vibrance.fx
TechniqueSorting=AdaptiveSharpen@AdaptiveSharpen.fx,AmbientLight@AmbientLight.fx,Clarity@Clarity.fx,Colourfulness@Colourfulness.fx,Vibrance@Vibrance.fx
PreprocessorDefinitions=

[AdaptiveSharpen.fx]
curve_height=1.200000
D_comp=0.250000
L_comp=0.150000
L_tilt=1.000000
sharpness=1.500000

[AmbientLight.fx]
AL_Adaptation=0.700000
AL_ColorBG=0.000000,0.000000,0.000000,1.000000
AL_Intensity=1.150000
AL_Threshold=12.000000
AL_Vibrance=2.500000
AL_Warmth=0.500000
UseAL_Debug=0

[Clarity.fx]
ClarityRadius=20
ClarityStrength=0.400000
ClarityDarkIntensity=0.200000
ClarityLightIntensity=0.100000
ClarityOffset=1.500000

[Colourfulness.fx]
col_strength=0.350000
col_saturation=1.100000

[Vibrance.fx]
Vibrance=0.150000
VibranceRGBBalance=1.000000,0.850000,1.150000`,
  anime: `Techniques=Colourfulness@Colourfulness.fx,Vibrance@Vibrance.fx,HDR@HDR.fx,Levels@Levels.fx
TechniqueSorting=Levels@Levels.fx,HDR@HDR.fx,Colourfulness@Colourfulness.fx,Vibrance@Vibrance.fx
PreprocessorDefinitions=USE_HDR=1

[Levels.fx]
BlackPoint=16
WhitePoint=235

[HDR.fx]
HDRPower=1.350000
radius2=0.850000

[Colourfulness.fx]
col_strength=0.600000
col_saturation=1.500000

[Vibrance.fx]
Vibrance=0.450000
VibranceRGBBalance=1.000000,1.000000,1.000000`,
  performance: `Techniques=AdaptiveSharpen@AdaptiveSharpen.fx,Vibrance@Vibrance.fx
TechniqueSorting=AdaptiveSharpen@AdaptiveSharpen.fx,Vibrance@Vibrance.fx
PreprocessorDefinitions=

[AdaptiveSharpen.fx]
curve_height=0.800000
sharpness=1.000000

[Vibrance.fx]
Vibrance=0.100000`,
} as const

const emptyPreset = (): PresetData => ({ techniques: [], techniqueSorting: [], preprocessors: '', shaders: {} })
export const getShaderFilename = (technique: string) => technique.includes('@') ? technique.slice(technique.indexOf('@') + 1) : technique
export function guessParameterType(key: string, value: string): ParameterType {
  const parts = value.split(',')
  if ((parts.length === 3 || parts.length === 4) && parts.every(part => !Number.isNaN(Number(part)))) return /color|bg|fg|tint|diffuse|ambient/i.test(key) ? 'color' : 'vector'
  if ((value === '0' || value === '1') && /use|enable|toggle|debug|active|on|show|draw|blur/i.test(key)) return 'bool'
  if (value.includes('.') && !Number.isNaN(Number(value))) return 'float'
  if (Number.isInteger(Number(value))) return 'int'
  return 'string'
}
export const colorToHex = (value: string) => `#${value.split(',').slice(0, 3).map(part => Math.max(0, Math.min(255, Math.round(Number(part) * 255))).toString(16).padStart(2, '0')).join('')}`
export const hexToColor = (value: string, alpha: boolean) => `${[value.slice(1, 3), value.slice(3, 5), value.slice(5, 7)].map(part => (Number.parseInt(part, 16) / 255).toFixed(6)).join(',')}${alpha ? ',1.000000' : ''}`

export function parsePreset(text: string): PresetData {
  const parsed = emptyPreset()
  let shader: string | null = null
  for (const originalLine of text.split(/\r?\n/)) {
    const line = originalLine.trim()
    if (!line || line.startsWith(';') || line.startsWith('#')) continue
    if (line.startsWith('[') && line.endsWith(']')) {
      shader = line.slice(1, -1)
      parsed.shaders[shader] = {}
      continue
    }
    const index = line.indexOf('=')
    if (index === -1) continue
    const key = line.slice(0, index).trim()
    const value = line.slice(index + 1).trim()
    if (shader) parsed.shaders[shader]![key] = value
    else if (key === 'Techniques') parsed.techniques = value ? value.split(',') : []
    else if (key === 'TechniqueSorting') parsed.techniqueSorting = value ? value.split(',') : []
    else if (key === 'PreprocessorDefinitions') parsed.preprocessors = value
  }
  if (!parsed.techniqueSorting.length) parsed.techniqueSorting = [...parsed.techniques]
  const included = new Set(parsed.techniqueSorting.map(getShaderFilename))
  Object.keys(parsed.shaders).forEach((name) => { if (!included.has(name)) parsed.techniqueSorting.push(name) })
  return parsed
}

export function serializePreset(data: PresetData): string {
  const lines = [`Techniques=${data.techniques.join(',')}`, `TechniqueSorting=${data.techniqueSorting.join(',')}`, `PreprocessorDefinitions=${data.preprocessors}`, '']
  const written = new Set<string>()
  for (const technique of [...data.techniqueSorting, ...Object.keys(data.shaders)]) {
    const filename = getShaderFilename(technique)
    if (written.has(filename)) continue
    written.add(filename)
    const parameters = data.shaders[filename]
    if (!parameters || !Object.keys(parameters).length) continue
    lines.push(`[${filename}]`, ...Object.entries(parameters).map(([key, value]) => `${key}=${value}`), '')
  }
  return `${lines.join('\n').trim()}\n`
}

export function useReshadePresetViewer() {
  const preset = shallowRef<PresetData>(parsePreset(presets.cinematic))
  const filename = shallowRef('cinematic_preset.ini')
  const selectedEffect = shallowRef(preset.value.techniqueSorting[0] || '')
  const filter = shallowRef('')
  const activeFirst = shallowRef(false)
  const performanceMode = shallowRef(false)
  const source = shallowRef<keyof typeof presets | 'custom'>('cinematic')
  const fileError = shallowRef<'invalid' | 'read' | null>(null)
  const effects = computed(() => [...preset.value.techniqueSorting]
    .sort((first, second) => activeFirst.value ? Number(preset.value.techniques.includes(second)) - Number(preset.value.techniques.includes(first)) : 0)
    .filter((effect) => {
      const lower = filter.value.toLowerCase()
      return !lower || effect.toLowerCase().includes(lower) || Object.keys(preset.value.shaders[getShaderFilename(effect)] || {}).some(key => key.toLowerCase().includes(lower))
    }))
  const selectedParameters = computed(() => preset.value.shaders[getShaderFilename(selectedEffect.value)] || {})
  const preview = computed(() => serializePreset(preset.value))
  const load = (text: string, nextFilename: string) => {
    preset.value = parsePreset(text); filename.value = nextFilename; selectedEffect.value = preset.value.techniqueSorting[0] || ''
  }
  const loadDemo = (name = source.value) => {
    const demo = name === 'custom' ? presets.cinematic : presets[name]
    load(demo, `${name === 'custom' ? 'cinematic' : name}_preset.ini`)
  }
  const selectEffect = (effect: string) => { selectedEffect.value = effect }
  const toggleEffect = (effect: string, enabled: boolean) => {
    const techniques = new Set(preset.value.techniques)
    if (enabled) techniques.add(effect)
    else techniques.delete(effect)
    preset.value = { ...preset.value, techniques: [...techniques] }
    if (enabled) selectedEffect.value = effect
  }
  const toggleAll = (enabled: boolean) => { preset.value = { ...preset.value, techniques: enabled ? [...preset.value.techniqueSorting] : [] } }
  const moveEffect = (effect: string, direction: number) => {
    const order = [...preset.value.techniqueSorting]
    const index = order.indexOf(effect)
    if (index < 0 || !order[index + direction]) return
    ;[order[index], order[index + direction]] = [order[index + direction]!, order[index]!]
    preset.value = { ...preset.value, techniqueSorting: order }
  }
  const updateParameter = (key: string, value: string) => {
    const shader = getShaderFilename(selectedEffect.value)
    preset.value = { ...preset.value, shaders: { ...preset.value.shaders, [shader]: { ...preset.value.shaders[shader], [key]: value } } }
  }
  const readFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.ini')) { fileError.value = 'invalid'; return }
    try { load(await file.text(), file.name); source.value = 'custom'; fileError.value = null } catch { fileError.value = 'read' }
  }
  return { preset, filename, selectedEffect, filter, activeFirst, performanceMode, source, fileError, effects, selectedParameters, preview, load, loadDemo, selectEffect, toggleEffect, toggleAll, moveEffect, updateParameter, readFile }
}
