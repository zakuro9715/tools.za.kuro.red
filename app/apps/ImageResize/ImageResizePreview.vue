<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  previewUrl: string
  background: string
  originalWidth: number
  originalHeight: number
  originalSize: string
  width: number
  height: number
  outputSize: string
}>()

const previewAspectRatio = computed(() => `${props.width} / ${props.height}`)
const previewStageStyle = computed(() => ({
  width: `${props.width}px`,
  aspectRatio: previewAspectRatio.value,
}))
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-medium">
          {{ t('title') }}
        </h2>
        <p
          data-testid="image-resize-dimensions"
          class="text-xs text-muted"
        >
          {{ t('source', { width: originalWidth, height: originalHeight, size: originalSize }) }}
          <span aria-hidden="true">→</span>
          {{ t('result', { width, height, size: outputSize }) }}
        </p>
      </div>
    </template>
    <div
      data-testid="image-resize-preview-stage"
      class="preview-stage mx-auto max-w-full overflow-hidden rounded border-2 border-default max-h-144"
      :class="{ 'preview-stage--transparent': background === 'transparent' }"
      :style="previewStageStyle"
    >
      <img
        data-testid="image-resize-preview"
        :src="previewUrl"
        :alt="t('alt')"
      >
    </div>
  </UCard>
</template>

<style scoped>
.preview-stage--transparent {
  background-image: repeating-conic-gradient(rgba(128, 128, 128, 0.2) 0%, rgba(128, 128, 128, 0.2) 25%, transparent 0%, transparent 50%);
  background-size: 16px 16px;
}
</style>

<i18n lang="json">
{
  "en": {
    "title": "Preview",
    "source": "Original: {width} × {height}px ({size})",
    "result": "{width} × {height}px ({size})",
    "alt": "Resized image preview"
  },
  "ja": {
    "title": "プレビュー",
    "source": "元: {width} × {height}px（{size}）",
    "result": "{width} × {height}px（{size}）",
    "alt": "リサイズ後の画像プレビュー"
  }
}
</i18n>
