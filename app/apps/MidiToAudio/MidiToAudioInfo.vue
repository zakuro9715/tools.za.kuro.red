<script setup lang="ts">
import type { MidiInfo } from './useMidiToAudio'

defineProps<{ fileName: string, info: MidiInfo }>()
const { t } = useI18n()
</script>

<template>
  <dl
    data-testid="midi-info"
    class="grid grid-cols-3 gap-4 text-sm"
  >
    <div>
      <dt class="text-muted">
        {{ t('file') }}
      </dt>
      <dd
        data-testid="midi-info-file"
        class="truncate font-medium"
      >
        {{ fileName }}
      </dd>
    </div>
    <div>
      <dt class="text-muted">
        {{ t('duration') }}
      </dt>
      <dd
        data-testid="midi-info-duration"
        class="font-medium"
      >
        {{ formatDuration(info.duration) }}
      </dd>
    </div>
    <div>
      <dt class="text-muted">
        {{ t('tracks') }}
      </dt>
      <dd
        data-testid="midi-info-tracks"
        class="font-medium"
      >
        {{ info.tracks }}
      </dd>
    </div>
  </dl>
</template>

<i18n lang="json">
{
  "en": {
    "file": "File",
    "duration": "Length",
    "tracks": "Tracks"
  },
  "ja": {
    "file": "ファイル",
    "duration": "長さ",
    "tracks": "トラック数"
  }
}
</i18n>
