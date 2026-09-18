<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  hasAudio: boolean
  isRecording: boolean
}>()

const emit = defineEmits<{
  ready: [canvas: HTMLCanvasElement]
  chooseFile: []
}>()

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

onMounted(() => {
  if (canvas.value) {
    emit('ready', canvas.value)
  }
})
</script>

<template>
  <UCard
    class="relative aspect-video overflow-hidden rounded-lg border border-default"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <canvas
      v-show="props.hasAudio"
      ref="canvas"
      data-testid="audio-video-canvas"
      class="size-full"
    />
    <div
      v-if="!props.hasAudio"
      data-testid="audio-video-placeholder"
      class="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <UIcon
        name="i-lucide-audio-lines"
        class="size-10 text-primary"
      />
      <div>
        <h2 class="text-lg font-semibold text-highlighted">
          {{ t('placeholder.title') }}
        </h2>
        <p class="mt-1 max-w-md text-sm text-muted">
          {{ t('placeholder.description') }}
        </p>
      </div>
      <UButton
        data-testid="audio-video-choose-file"
        icon="i-lucide-file-audio"
        :label="t('placeholder.button')"
        @click="emit('chooseFile')"
      />
    </div>
    <UBadge
      v-if="props.isRecording"
      data-testid="audio-video-recording-badge"
      class="absolute top-4 left-4"
      color="error"
      :label="t('recording')"
    />
  </UCard>
</template>

<i18n lang="json">
{
  "en": {
    "placeholder": {
      "title": "Choose an audio file",
      "description": "Load MP3, WAV, M4A, or another audio file to create a waveform video.",
      "button": "Choose audio file"
    },
    "recording": "Recording video"
  },
  "ja": {
    "placeholder": {
      "title": "音声ファイルを選択してください",
      "description": "MP3、WAV、M4A などの音声ファイルを読み込むと、波形動画を作成できます。",
      "button": "音声ファイルを選択"
    },
    "recording": "動画を収録中"
  }
}
</i18n>
