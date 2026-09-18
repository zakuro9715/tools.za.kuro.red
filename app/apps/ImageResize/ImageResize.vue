<script setup lang="ts">
const { t } = useI18n()
const {
  mode,
  preset,
  width,
  height,
  percent,
  keepAspectRatio,
  background,
  outputFormat,
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
} = useImageResize()

const isDraggingOver = shallowRef(false)
const presetItems = computed(() => [
  { label: t('presets.custom'), value: 'custom' },
  { label: '1920 × 1080 (16:9 FHD)', value: '1920x1080' },
  { label: '1280 × 720 (16:9 HD)', value: '1280x720' },
  { label: '1200 × 630 (OGP / Web)', value: '1200x630' },
  { label: '1080 × 1080 (1:1 SNS)', value: '1080x1080' },
  { label: '800 × 600 (4:3)', value: '800x600' },
])
const formatItems = [
  { label: 'PNG', value: 'image/png' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'WebP', value: 'image/webp' },
]

const handleFile = (file: File | undefined) => {
  loadFile(file)
}
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <label
        data-testid="image-resize-upload"
        class="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-default p-8 text-center"
        :class="{ 'bg-elevated': isDraggingOver }"
        @dragover.prevent="isDraggingOver = true"
        @dragleave.prevent="isDraggingOver = false"
        @drop.prevent="isDraggingOver = false; handleFile($event.dataTransfer?.files[0])"
      >
        <UIcon
          name="i-lucide-image-up"
          class="size-10 text-muted"
        />
        <span class="text-sm font-medium">{{ t('upload.title') }}</span>
        <span class="text-xs text-muted">{{ t('upload.description') }}</span>
        <input
          data-testid="image-resize-file-input"
          class="sr-only"
          type="file"
          accept="image/*"
          @change="handleFile(($event.target as HTMLInputElement).files?.[0])"
        >
      </label>
      <UAlert
        v-if="error"
        data-testid="image-resize-error"
        class="mt-4"
        color="error"
        icon="i-lucide-circle-alert"
        :title="t(`errors.${error}`)"
      />
    </UCard>

    <div
      v-if="isLoaded"
      class="grid gap-6 lg:grid-cols-3"
    >
      <UCard class="lg:col-span-1">
        <div class="space-y-5">
          <div>
            <p class="mb-2 text-sm font-medium">
              {{ t('mode.label') }}
            </p>
            <div class="grid grid-cols-2 gap-2">
              <UButton
                data-testid="image-resize-pixel-mode"
                :label="t('mode.pixel')"
                :color="mode === 'pixel' ? 'primary' : 'neutral'"
                :variant="mode === 'pixel' ? 'solid' : 'outline'"
                @click="mode = 'pixel'"
              />
              <UButton
                data-testid="image-resize-percent-mode"
                :label="t('mode.percent')"
                :color="mode === 'percent' ? 'primary' : 'neutral'"
                :variant="mode === 'percent' ? 'solid' : 'outline'"
                @click="mode = 'percent'"
              />
            </div>
          </div>

          <template v-if="mode === 'pixel'">
            <UFormField :label="t('presets.label')">
              <USelect
                data-testid="image-resize-preset"
                :model-value="preset"
                :items="presetItems"
                @update:model-value="applyPreset(String($event))"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-3">
              <UFormField :label="t('dimensions.width')">
                <UInput
                  data-testid="image-resize-width"
                  type="number"
                  :model-value="width"
                  min="1"
                  max="8192"
                  @update:model-value="setWidth(Number($event))"
                />
              </UFormField>
              <UFormField :label="t('dimensions.height')">
                <UInput
                  data-testid="image-resize-height"
                  type="number"
                  :model-value="height"
                  min="1"
                  max="8192"
                  @update:model-value="setHeight(Number($event))"
                />
              </UFormField>
            </div>

            <UCheckbox
              v-model="keepAspectRatio"
              data-testid="image-resize-aspect-ratio"
              :label="t('dimensions.keepAspectRatio')"
            />

            <UFormField
              v-if="!keepAspectRatio"
              :label="t('dimensions.background')"
            >
              <URadioGroup
                v-model="background"
                :items="[
                  { label: t('background.transparent'), value: 'transparent' },
                  { label: t('background.white'), value: '#ffffff' },
                  { label: t('background.black'), value: '#000000' },
                ]"
                orientation="horizontal"
              />
            </UFormField>
          </template>

          <UFormField
            v-else
            :label="t('scale.label', { percent })"
          >
            <input
              v-model.number="percent"
              data-testid="image-resize-percent"
              class="w-full accent-primary"
              type="range"
              min="1"
              max="200"
            >
            <template #hint>
              {{ t('scale.result', { width: percentWidth, height: percentHeight }) }}
            </template>
          </UFormField>

          <USeparator />

          <UFormField :label="t('output.format')">
            <USelect
              v-model="outputFormat"
              data-testid="image-resize-format"
              :items="formatItems"
            />
          </UFormField>
          <UFormField
            v-if="outputFormat !== 'image/png'"
            :label="t('output.quality', { quality: Math.round(quality * 100) })"
          >
            <input
              v-model.number="quality"
              class="w-full accent-primary"
              type="range"
              min="0.1"
              max="1"
              step="0.05"
            >
          </UFormField>

          <UButton
            data-testid="image-resize-download"
            icon="i-lucide-download"
            :label="t('output.download')"
            block
            @click="download"
          />
        </div>
      </UCard>

      <ImageResizePreview
        class="lg:col-span-2"
        :preview-url="previewUrl"
        :background="background"
        :original-width="originalWidth"
        :original-height="originalHeight"
        :original-size="formatBytes(originalSize)"
        :width="finalWidth"
        :height="finalHeight"
        :output-size="formatBytes(outputSize)"
      />
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "upload": {
      "title": "Drop an image or choose a file",
      "description": "PNG, JPEG, and WebP are supported."
    },
    "errors": {
      "invalid": "Choose an image file.",
      "read": "This image could not be read.",
      "canvas": "Canvas is not available in this browser.",
      "resize": "The image could not be resized."
    },
    "mode": {
      "label": "Sizing method",
      "pixel": "Pixels",
      "percent": "Percentage"
    },
    "presets": {
      "label": "Preset resolution",
      "custom": "Custom"
    },
    "dimensions": {
      "width": "Width (px)",
      "height": "Height (px)",
      "keepAspectRatio": "Keep aspect ratio",
      "background": "Padding color"
    },
    "background": {
      "transparent": "Transparent",
      "white": "White",
      "black": "Black"
    },
    "scale": {
      "label": "Scale: {percent}%",
      "result": "New size: {width} × {height}px"
    },
    "output": {
      "format": "Output format",
      "quality": "Quality: {quality}%",
      "download": "Download image"
    }
  },
  "ja": {
    "upload": {
      "title": "画像をドロップ、またはファイルを選択",
      "description": "PNG、JPEG、WebP に対応しています。"
    },
    "errors": {
      "invalid": "画像ファイルを選択してください。",
      "read": "画像を読み込めませんでした。",
      "canvas": "このブラウザでは Canvas を利用できません。",
      "resize": "画像をリサイズできませんでした。"
    },
    "mode": {
      "label": "サイズ指定方法",
      "pixel": "ピクセル",
      "percent": "比率"
    },
    "presets": {
      "label": "プリセット解像度",
      "custom": "カスタム"
    },
    "dimensions": {
      "width": "幅 (px)",
      "height": "高さ (px)",
      "keepAspectRatio": "アスペクト比を維持する",
      "background": "余白の色"
    },
    "background": {
      "transparent": "透明",
      "white": "白",
      "black": "黒"
    },
    "scale": {
      "label": "拡大・縮小率: {percent}%",
      "result": "変更後のサイズ: {width} × {height}px"
    },
    "output": {
      "format": "保存形式",
      "quality": "品質: {quality}%",
      "download": "画像をダウンロード"
    }
  }
}
</i18n>
