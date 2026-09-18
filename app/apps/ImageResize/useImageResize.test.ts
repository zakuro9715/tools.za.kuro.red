import { describe, expect, it } from 'vitest'
import { clampDimension, formatBytes } from './useImageResize'

describe('image resize utilities', () => {
  it('bounds dimensions to a safe canvas range', () => {
    expect(clampDimension(0)).toBe(1)
    expect(clampDimension(12.6)).toBe(13)
    expect(clampDimension(9000)).toBe(8192)
  })

  it('formats byte sizes for the preview', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1024)).toBe('1 KB')
  })
})
