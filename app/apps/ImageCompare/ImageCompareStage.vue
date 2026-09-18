<script setup lang="ts">
import type { CompareFit, CompareOrientation } from './useImageCompare'

const { t } = useI18n()

const props = defineProps<{
  imageAUrl: string | undefined
  imageBUrl: string | undefined
  orientation: CompareOrientation
  fit: CompareFit
  position: number
}>()

const emit = defineEmits<{
  setPosition: [position: number]
}>()

const isVertical = computed(() => props.orientation === 'vertical')
const positionPercent = computed(() => `${props.position * 100}%`)
const imageBStyle = computed(() => ({
  clipPath: isVertical.value
    ? `polygon(${positionPercent.value} 0, 100% 0, 100% 100%, ${positionPercent.value} 100%)`
    : `polygon(0 ${positionPercent.value}, 100% ${positionPercent.value}, 100% 100%, 0 100%)`,
}))
const dividerStyle = computed(() => isVertical.value
  ? { left: positionPercent.value }
  : { top: positionPercent.value })
const handleStyle = computed(() => isVertical.value
  ? { left: positionPercent.value, top: '50%' }
  : { left: '50%', top: positionPercent.value })

const updatePosition = (event: PointerEvent) => {
  const container = event.currentTarget as HTMLElement
  const rect = container.getBoundingClientRect()
  const ratio = isVertical.value
    ? (event.clientX - rect.left) / rect.width
    : (event.clientY - rect.top) / rect.height
  emit('setPosition', Math.min(1, Math.max(0, ratio)))
}

const startDragging = (event: PointerEvent) => {
  const container = event.currentTarget as HTMLElement
  if (typeof container.setPointerCapture === 'function') {
    container.setPointerCapture(event.pointerId)
  }
  updatePosition(event)
}
</script>

<template>
  <div>
    <div
      data-testid="image-compare-stage"
      class="relative aspect-video w-full touch-none overflow-hidden rounded-md border border-default bg-elevated"
      @pointerdown="startDragging"
      @pointermove="event => event.buttons && updatePosition(event)"
    >
      <template v-if="imageAUrl && imageBUrl">
        <img
          :src="imageAUrl"
          :alt="t('imageA')"
          class="pointer-events-none absolute inset-0 size-full"
          :class="fit === 'cover' ? 'object-cover' : 'object-contain'"
        >
        <img
          :src="imageBUrl"
          :alt="t('imageB')"
          class="pointer-events-none absolute inset-0 size-full"
          :class="fit === 'cover' ? 'object-cover' : 'object-contain'"
          :style="imageBStyle"
        >
        <div
          class="pointer-events-none absolute bg-default"
          :class="isVertical ? 'inset-y-0 w-px -translate-x-1/2' : 'inset-x-0 h-px -translate-y-1/2'"
          :style="dividerStyle"
        />
        <div
          class="pointer-events-none absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-default bg-default shadow-sm"
          :style="handleStyle"
        >
          <UIcon
            :name="isVertical ? 'i-lucide-arrow-left-right' : 'i-lucide-arrow-up-down'"
            class="size-4"
          />
        </div>
      </template>
      <div
        v-else
        data-testid="image-compare-empty"
        class="flex size-full flex-col items-center justify-center gap-1 p-4 text-center"
      >
        <p class="text-sm text-muted">
          {{ t('empty.title') }}
        </p>
        <p class="text-xs text-dimmed">
          {{ t('empty.description') }}
        </p>
      </div>
    </div>
    <div class="mt-2 flex justify-between px-1 font-mono text-xs text-dimmed">
      <span>{{ isVertical ? t('labels.left') : t('labels.top') }}</span>
      <span>{{ isVertical ? t('labels.right') : t('labels.bottom') }}</span>
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "imageA": "Image A",
    "imageB": "Image B",
    "empty": {
      "title": "Select two images to compare",
      "description": "Set images A and B from the image library."
    },
    "labels": {
      "left": "Image A (left)",
      "right": "Image B (right)",
      "top": "Image A (top)",
      "bottom": "Image B (bottom)"
    }
  },
  "ja": {
    "imageA": "画像 A",
    "imageB": "画像 B",
    "empty": {
      "title": "比較する画像を2枚選択してください",
      "description": "画像ライブラリから A と B を指定します。"
    },
    "labels": {
      "left": "画像 A（左）",
      "right": "画像 B（右）",
      "top": "画像 A（上）",
      "bottom": "画像 B（下）"
    }
  }
}
</i18n>
