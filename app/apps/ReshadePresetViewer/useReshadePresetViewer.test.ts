import { describe, expect, it } from 'vitest'
import { parsePreset, serializePreset, useReshadePresetViewer } from './useReshadePresetViewer'

describe('useReshadePresetViewer', () => {
  it('parses and serializes presets including unsorted sections', () => {
    const preset = parsePreset('Techniques=Test@Test.fx\n\n[Test.fx]\nEnabled=1\n\n[Other.fx]\nValue=2')

    expect(preset.techniqueSorting).toEqual(['Test@Test.fx', 'Other.fx'])
    expect(serializePreset(preset)).toContain('[Other.fx]\nValue=2')
  })

  it('toggles effects and edits the selected value', () => {
    const viewer = useReshadePresetViewer()
    const effect = viewer.selectedEffect.value
    viewer.toggleEffect(effect, false)
    viewer.updateParameter('sharpness', '2.000000')

    expect(viewer.preset.value.techniques).not.toContain(effect)
    expect(viewer.preview.value).toContain('sharpness=2.000000')
  })
})
