import { computed, shallowRef, watch } from 'vue'

export type OutputFormat = 'image/svg+xml' | 'image/png' | 'image/jpeg' | 'image/webp'
export type ResizeMode = 'pixel' | 'percent'

const maximumDimension = 8192
const svgNamespace = 'http://www.w3.org/2000/svg'

export function clampDimension(value: number) {
  return Math.min(maximumDimension, Math.max(1, Math.round(Number.isFinite(value) ? value : 1)))
}

export function isSvgFile(file: File) {
  return file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
}

export function resizeSvg(
  source: string,
  width: number,
  height: number,
  originalWidth: number,
  originalHeight: number,
  background: string | null = null,
) {
  const document = new DOMParser().parseFromString(source, 'image/svg+xml')
  const root = document.documentElement
  if (root.localName !== 'svg' || document.querySelector('parsererror')) {
    return null
  }

  if (!root.hasAttribute('viewBox')) {
    root.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`)
  }
  root.setAttribute('xmlns', svgNamespace)
  root.setAttribute('width', `${width}px`)
  root.setAttribute('height', `${height}px`)
  root.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  const existingStyle = root.getAttribute('style')
  root.setAttribute('style', `${existingStyle ? `${existingStyle};` : ''}width:${width}px;height:${height}px`)

  if (background) {
    const rectangle = document.createElementNS(svgNamespace, 'rect')
    rectangle.setAttribute('width', '100%')
    rectangle.setAttribute('height', '100%')
    rectangle.setAttribute('fill', background)
    root.insertBefore(rectangle, root.firstChild)
  }

  return new XMLSerializer().serializeToString(document)
}

export function formatBytes(bytes: number) {
  if (!bytes) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB']
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${Number((bytes / 1024 ** index).toFixed(2))} ${units[index]}`
}

export function useImageResize() {
  const image = shallowRef<HTMLImageElement | null>(null)
  const svgSource = shallowRef<string | null>(null)
  const fileName = shallowRef('image')
  const originalWidth = shallowRef(0)
  const originalHeight = shallowRef(0)
  const originalSize = shallowRef(0)
  const mode = shallowRef<ResizeMode>('pixel')
  const preset = shallowRef('custom')
  const width = shallowRef(0)
  const height = shallowRef(0)
  const percent = shallowRef(100)
  const keepAspectRatio = shallowRef(true)
  const background = shallowRef('transparent')
  const outputFormat = shallowRef<OutputFormat>('image/png')
  const quality = shallowRef(0.9)
  const previewUrl = shallowRef('')
  const outputSize = shallowRef(0)
  const error = shallowRef('')

  const aspectRatio = computed(() => originalWidth.value / originalHeight.value || 1)
  const percentWidth = computed(() => clampDimension(originalWidth.value * percent.value / 100))
  const percentHeight = computed(() => clampDimension(originalHeight.value * percent.value / 100))
  const finalWidth = computed(() => mode.value === 'pixel' ? clampDimension(width.value) : percentWidth.value)
  const finalHeight = computed(() => mode.value === 'pixel' ? clampDimension(height.value) : percentHeight.value)
  const isLoaded = computed(() => image.value !== null)
  const isSvg = computed(() => svgSource.value !== null)

  const render = () => {
    if (!image.value || !import.meta.client) {
      return
    }

    try {
      if (outputFormat.value === 'image/svg+xml') {
        if (!svgSource.value) {
          error.value = 'resize'
          return
        }

        const resizedSvg = resizeSvg(
          svgSource.value,
          finalWidth.value,
          finalHeight.value,
          originalWidth.value,
          originalHeight.value,
          mode.value === 'pixel' && !keepAspectRatio.value && background.value !== 'transparent'
            ? background.value
            : null,
        )
        if (!resizedSvg) {
          error.value = 'resize'
          return
        }

        previewUrl.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(resizedSvg)}`
        outputSize.value = new Blob([resizedSvg], { type: 'image/svg+xml' }).size
        error.value = ''
        return
      }

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) {
        error.value = 'canvas'
        return
      }

      const targetWidth = finalWidth.value
      const targetHeight = finalHeight.value
      canvas.width = targetWidth
      canvas.height = targetHeight
      context.clearRect(0, 0, targetWidth, targetHeight)

      if (mode.value === 'pixel' && !keepAspectRatio.value) {
        if (background.value !== 'transparent') {
          context.fillStyle = background.value
          context.fillRect(0, 0, targetWidth, targetHeight)
        }

        const targetRatio = targetWidth / targetHeight
        const drawWidth = aspectRatio.value > targetRatio ? targetWidth : targetHeight * aspectRatio.value
        const drawHeight = aspectRatio.value > targetRatio ? targetWidth / aspectRatio.value : targetHeight
        context.drawImage(image.value, (targetWidth - drawWidth) / 2, (targetHeight - drawHeight) / 2, drawWidth, drawHeight)
      } else {
        if (background.value !== 'transparent' && outputFormat.value !== 'image/png') {
          context.fillStyle = background.value
          context.fillRect(0, 0, targetWidth, targetHeight)
        }
        context.drawImage(image.value, 0, 0, targetWidth, targetHeight)
      }

      const result = canvas.toDataURL(outputFormat.value, quality.value)
      previewUrl.value = result
      outputSize.value = Math.round((result.length - result.indexOf(',') - 1) * 3 / 4)
      error.value = ''
    } catch (cause) {
      console.error('Failed to resize image.', cause)
      error.value = 'resize'
    }
  }

  const loadFile = (file: File | undefined) => {
    if (!file || (!file.type.startsWith('image/') && !isSvgFile(file))) {
      error.value = 'invalid'
      return
    }

    const isSvg = isSvgFile(file)
    const reader = new FileReader()
    reader.onerror = () => {
      error.value = 'read'
    }
    reader.onload = () => {
      const source = new Image()
      let sourceUrl: string | undefined
      source.onerror = () => {
        if (sourceUrl) {
          URL.revokeObjectURL(sourceUrl)
        }
        error.value = 'read'
      }
      source.onload = () => {
        if (sourceUrl) {
          URL.revokeObjectURL(sourceUrl)
        }
        image.value = source
        svgSource.value = isSvg ? String(reader.result) : null
        fileName.value = file.name.replace(/\.[^.]+$/, '') || 'image'
        originalWidth.value = source.naturalWidth
        originalHeight.value = source.naturalHeight
        originalSize.value = file.size
        width.value = clampDimension(source.naturalWidth)
        height.value = clampDimension(source.naturalHeight)
        percent.value = 100
        preset.value = 'custom'
        keepAspectRatio.value = true
        outputFormat.value = isSvg ? 'image/svg+xml' : 'image/png'
        render()
      }
      if (isSvg) {
        sourceUrl = URL.createObjectURL(new Blob([String(reader.result)], { type: 'image/svg+xml' }))
        source.src = sourceUrl
      } else {
        source.src = String(reader.result)
      }
    }
    if (isSvg) {
      reader.readAsText(file)
    } else {
      reader.readAsDataURL(file)
    }
  }

  const setWidth = (value: number) => {
    width.value = clampDimension(value)
    preset.value = 'custom'
    if (keepAspectRatio.value) {
      height.value = clampDimension(width.value / aspectRatio.value)
    }
  }

  const setHeight = (value: number) => {
    height.value = clampDimension(value)
    preset.value = 'custom'
    if (keepAspectRatio.value) {
      width.value = clampDimension(height.value * aspectRatio.value)
    }
  }

  const applyPreset = (value: string) => {
    preset.value = value
    if (value === 'custom') {
      return
    }
    const [presetWidth, presetHeight] = value.split('x').map(Number)
    if (!presetWidth || !presetHeight) {
      return
    }
    keepAspectRatio.value = presetWidth === presetHeight
    width.value = clampDimension(presetWidth)
    height.value = clampDimension(presetHeight)
  }

  const download = () => {
    if (!previewUrl.value || !import.meta.client) {
      return
    }
    const extension = outputFormat.value === 'image/jpeg'
      ? 'jpg'
      : outputFormat.value === 'image/svg+xml'
        ? 'svg'
        : outputFormat.value.split('/')[1]
    const link = document.createElement('a')
    link.download = `${fileName.value}_resized.${extension}`
    link.href = previewUrl.value
    link.click()
  }

  watch(keepAspectRatio, (isKept) => {
    if (isKept) {
      height.value = clampDimension(width.value / aspectRatio.value)
    }
  })
  watch([mode, width, height, percent, keepAspectRatio, background, outputFormat, quality], render)

  return {
    mode,
    preset,
    width,
    height,
    percent,
    keepAspectRatio,
    background,
    outputFormat,
    isSvg,
    quality,
    previewUrl,
    error,
    isLoaded,
    originalWidth,
    originalHeight,
    originalSize,
    outputSize,
    percentWidth,
    percentHeight,
    finalWidth,
    finalHeight,
    loadFile,
    setWidth,
    setHeight,
    applyPreset,
    download,
  }
}
