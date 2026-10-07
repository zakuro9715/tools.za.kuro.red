<script setup lang="ts">
const { t } = useI18n()
const {
  info,
  fileName,
  sampleRate,
  status,
  error,
  wavUrl,
  fontProgress,
  renderProgress,
  loadFile,
  convert,
  download,
} = useMidiToAudio()
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <MidiToAudioFileInput @select="loadFile" />
      <UAlert
        v-if="error"
        data-testid="midi-to-audio-error"
        class="mt-4"
        color="error"
        icon="i-lucide-circle-alert"
        :title="t(`errors.${error}`)"
      />
    </UCard>

    <UCard v-if="info">
      <div class="space-y-6">
        <MidiToAudioInfo
          :file-name="fileName"
          :info="info"
        />
        <MidiToAudioRenderControls
          v-model:sample-rate="sampleRate"
          :status="status"
          :font-progress="fontProgress"
          :render-progress="renderProgress"
          :audio-url="wavUrl"
          @convert="convert"
          @download="download"
        />
        <p class="text-xs text-muted">
          {{ t('credit') }}
        </p>
      </div>
    </UCard>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "errors": {
      "invalid-midi": "Could not read this MIDI file.",
      "convert-failed": "Conversion failed. Check your connection and try again."
    },
    "credit": "Sound: GeneralUser GS (downloaded on first use)"
  },
  "ja": {
    "errors": {
      "invalid-midi": "このMIDIファイルを読み込めませんでした。",
      "convert-failed": "変換に失敗しました。接続を確認して再試行してください。"
    },
    "credit": "音源: GeneralUser GS (初回のみダウンロード)"
  }
}
</i18n>
