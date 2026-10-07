<script setup lang="ts">
import type { ConvertStatus } from './useMidiToAudio'

const props = defineProps<{
  status: ConvertStatus
  fontProgress: number
  renderProgress: number
  audioUrl?: string
}>()
const emit = defineEmits<{ convert: [], download: [] }>()
const sampleRate = defineModel<number>('sampleRate', { required: true })
const { t } = useI18n()

const rateItems = [
  { label: '44.1 kHz', value: 44100 },
  { label: '48 kHz', value: 48000 },
]
const isBusy = computed(() => props.status === 'loading-font' || props.status === 'rendering')
const progress = computed(() => Math.round((props.status === 'loading-font' ? props.fontProgress : props.renderProgress) * 100))
</script>

<template>
  <div class="space-y-4">
    <UFormField :label="t('sampleRate')">
      <USelect
        v-model="sampleRate"
        data-testid="render-controls-sample-rate"
        :items="rateItems"
        :disabled="isBusy"
        class="w-40"
      />
    </UFormField>
    <div class="flex flex-wrap gap-2">
      <UButton
        data-testid="render-controls-convert"
        icon="i-lucide-audio-waveform"
        :label="t('convert')"
        :loading="isBusy"
        @click="emit('convert')"
      />
      <UButton
        v-if="status === 'done'"
        data-testid="render-controls-download"
        color="neutral"
        variant="outline"
        icon="i-lucide-download"
        :label="t('download')"
        @click="emit('download')"
      />
    </div>
    <audio
      v-if="status === 'done' && audioUrl"
      data-testid="render-controls-player"
      class="w-full"
      controls
      :src="audioUrl"
    />
    <div
      v-if="isBusy"
      class="space-y-1"
    >
      <p
        data-testid="render-controls-status"
        class="text-sm text-muted"
      >
        {{ t(`status.${status}`, { percent: progress }) }}
      </p>
      <UProgress
        data-testid="render-controls-progress"
        :model-value="progress"
      />
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "sampleRate": "Sample rate",
    "convert": "Convert to WAV",
    "download": "Download WAV",
    "status": {
      "loading-font": "Loading sound font: {percent}%",
      "rendering": "Rendering: {percent}%"
    }
  },
  "ja": {
    "sampleRate": "サンプルレート",
    "convert": "WAVに変換",
    "download": "WAVをダウンロード",
    "status": {
      "loading-font": "音源を読み込み中: {percent}%",
      "rendering": "変換中: {percent}%"
    }
  }
}
</i18n>
