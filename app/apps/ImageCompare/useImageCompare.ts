import { computed, onUnmounted, ref, shallowRef } from 'vue'

export type CompareOrientation = 'vertical' | 'horizontal'
export type CompareFit = 'cover' | 'contain'

export interface CompareImage {
  id: string
  name: string
  url: string
  isSample: boolean
}

const sampleA = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%25" height="100%25" fill="%23e5e5e5"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" fill="%23737373">IMAGE A (SAMPLE)</text></svg>'
const sampleB = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%25" height="100%25" fill="%23262626"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" fill="%23a3a3a3">IMAGE B (SAMPLE)</text></svg>'

export function clampPosition(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function useImageCompare() {
  const images = ref<CompareImage[]>([
    { id: 'sample-a', name: 'Sample image A.svg', url: sampleA, isSample: true },
    { id: 'sample-b', name: 'Sample image B.svg', url: sampleB, isSample: true },
  ])
  const imageAId = shallowRef<string | null>('sample-a')
  const imageBId = shallowRef<string | null>('sample-b')
  const orientation = shallowRef<CompareOrientation>('vertical')
  const fit = shallowRef<CompareFit>('cover')
  const position = shallowRef(0.5)
  const error = shallowRef('')

  const imageA = computed(() => images.value.find(image => image.id === imageAId.value) ?? null)
  const imageB = computed(() => images.value.find(image => image.id === imageBId.value) ?? null)
  const canCompare = computed(() => Boolean(imageA.value && imageB.value))

  const selectImage = (slot: 'a' | 'b', id: string) => {
    if (!images.value.some(image => image.id === id)) {
      return
    }

    if (slot === 'a') {
      if (imageBId.value === id) {
        imageBId.value = imageAId.value
      }
      imageAId.value = id
    } else {
      if (imageAId.value === id) {
        imageAId.value = imageBId.value
      }
      imageBId.value = id
    }
  }

  const addFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    if (!validFiles.length) {
      error.value = 'invalid'
      return
    }

    error.value = ''
    let added: CompareImage[]
    try {
      added = validFiles.map(file => ({
        id: `image-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`,
        name: file.name,
        url: URL.createObjectURL(file),
        isSample: false,
      }))
    } catch (cause) {
      console.error('Failed to load image files.', cause)
      error.value = 'load'
      return
    }
    images.value.push(...added)

    const userImages = images.value.filter(image => !image.isSample)
    if (userImages.length === 1) {
      imageAId.value = userImages[0]!.id
    } else if (userImages.length === 2) {
      imageAId.value = userImages[0]!.id
      imageBId.value = userImages[1]!.id
    }
  }

  const removeImage = (id: string) => {
    const image = images.value.find(item => item.id === id)
    if (!image) {
      return
    }

    if (!image.isSample) {
      URL.revokeObjectURL(image.url)
    }
    images.value = images.value.filter(item => item.id !== id)

    if (imageAId.value === id) {
      imageAId.value = images.value.find(item => item.id !== imageBId.value)?.id ?? null
    }
    if (imageBId.value === id) {
      imageBId.value = images.value.find(item => item.id !== imageAId.value)?.id ?? null
    }
  }

  const setPosition = (value: number) => {
    position.value = clampPosition(value)
  }

  const toggleFit = () => {
    fit.value = fit.value === 'cover' ? 'contain' : 'cover'
  }

  onUnmounted(() => {
    images.value
      .filter(image => !image.isSample)
      .forEach(image => URL.revokeObjectURL(image.url))
  })

  return {
    images,
    imageA,
    imageAId,
    imageB,
    imageBId,
    orientation,
    fit,
    position,
    error,
    canCompare,
    addFiles,
    removeImage,
    selectImage,
    setPosition,
    toggleFit,
  }
}
