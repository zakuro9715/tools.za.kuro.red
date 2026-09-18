import { describe, expect, it } from 'vitest'
import { clampPosition } from './useImageCompare'

describe('clampPosition', () => {
  it('keeps slider positions inside its valid range', () => {
    expect(clampPosition(-1)).toBe(0)
    expect(clampPosition(0.4)).toBe(0.4)
    expect(clampPosition(2)).toBe(1)
  })
})
