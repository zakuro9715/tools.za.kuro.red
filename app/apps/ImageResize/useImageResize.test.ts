import { describe, expect, it } from 'vitest'

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

  it('recognizes SVG files by MIME type or extension', () => {
    expect(isSvgFile(new File(['<svg/>'], 'icon.svg', { type: 'application/octet-stream' }))).toBe(true)
    expect(isSvgFile(new File(['<svg/>'], 'icon.png', { type: 'image/svg+xml' }))).toBe(true)
  })

  it('resizes SVG dimensions while retaining its viewBox', () => {
    const result = resizeSvg('<svg viewBox="0 0 100 50"><circle cx="50" cy="25" r="20"/></svg>', 200, 100, 100, 50)

    expect(result).not.toBeNull()
    const svg = new DOMParser().parseFromString(result ?? '', 'image/svg+xml').documentElement
    expect(svg.getAttribute('width')).toBe('200px')
    expect(svg.getAttribute('height')).toBe('100px')
    expect(svg.getAttribute('viewBox')).toBe('0 0 100 50')
  })

  it('adds the output background behind SVG artwork', () => {
    const result = resizeSvg('<svg width="100" height="50"><circle cx="50" cy="25" r="20"/></svg>', 200, 100, 100, 50, '#ffffff')

    expect(result).not.toBeNull()
    const svg = new DOMParser().parseFromString(result ?? '', 'image/svg+xml').documentElement
    expect(svg.getAttribute('viewBox')).toBe('0 0 100 50')
    expect(svg.firstElementChild?.localName).toBe('rect')
    expect(svg.firstElementChild?.getAttribute('fill')).toBe('#ffffff')
  })
})
