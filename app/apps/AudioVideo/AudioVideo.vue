<script setup lang="ts">
const { t } = useI18n()
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const isDraggingOver = shallowRef(false)
const {
  fileName,
  title,
  artist,
  duration,
  currentTime,
  volume,
  isPlaying,
  isRecording,
  downloadUrl,
  status,
  error,
  canRecord,
  isDecoding,
  formattedCurrentTime,
  formattedDuration,
  compatibility,
  loadFile,
  play,
  pause,
  stop,
  seek,
  setVolume,
  toggleMute,
  startRecording,
  stopRecording,
  setCanvas,
} = useAudioVideo()

const openFilePicker = () => {
  fileInput.value?.click()
}

const handleFile = (file: File | undefined) => {
  loadFile(file)
}
</script>

<template>
  <div
    class="grid gap-6 lg:grid-cols-12"
    @dragover.prevent="isDraggingOver = true"
    @dragleave.prevent="isDraggingOver = false"
    @drop.prevent="isDraggingOver = false; handleFile($event.dataTransfer?.files[0])"
  >
    <section class="space-y-6 lg:col-span-8">
      <AudioVideoCanvas
        :has-audio="Boolean(fileName)"
        :is-recording="isRecording"
        @ready="setCanvas"
        @choose-file="openFilePicker"
      />

      <UCard>
        <div class="flex flex-col gap-4 md:flex-row md:items-center">
          <div class="flex items-center gap-2">
            <UButton
              data-testid="audio-video-play"
              :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
              :aria-label="isPlaying ? t('controls.pause') : t('controls.play')"
              :disabled="!fileName || isDecoding"
              @click="isPlaying ? pause() : play()"
            />
            <UButton
              data-testid="audio-video-stop"
              icon="i-lucide-square"
              :aria-label="t('controls.stop')"
              color="neutral"
              variant="outline"
              :disabled="!fileName || isDecoding"
              @click="stop"
            />
            <div class="min-w-32">
              <p class="truncate text-sm font-medium">
                {{ fileName || t('controls.noTrack') }}
              </p>
              <p class="font-mono text-xs text-muted">
                {{ formattedCurrentTime }} / {{ formattedDuration }}
              </p>
            </div>
          </div>

          <input
            data-testid="audio-video-seek"
            class="min-w-0 flex-1 accent-primary"
            type="range"
            min="0"
            :max="duration || 1"
            step="0.1"
            :value="currentTime"
            :disabled="!fileName || isDecoding"
            :aria-label="t('controls.seek')"
            @input="seek(Number(($event.target as HTMLInputElement).value))"
          >

          <div class="flex items-center gap-2">
            <UButton
              data-testid="audio-video-mute"
              :icon="volume === 0 ? 'i-lucide-volume-x' : 'i-lucide-volume-2'"
              :aria-label="t('controls.mute')"
              color="neutral"
              variant="ghost"
              @click="toggleMute"
            />
            <input
              data-testid="audio-video-volume"
              class="w-24 accent-primary"
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="volume"
              :aria-label="t('controls.volume')"
              @input="setVolume(Number(($event.target as HTMLInputElement).value))"
            >
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-sm font-medium">
              {{ t('export.title') }}
            </h2>
            <UBadge
              :color="compatibility ? 'success' : 'warning'"
              variant="subtle"
              :label="compatibility ? t('export.supported') : t('export.unsupported')"
            />
          </div>
        </template>
        <p class="text-sm text-muted">
          {{ t('export.description') }}
        </p>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <UButton
            v-if="!isRecording"
            data-testid="audio-video-record"
            icon="i-lucide-clapperboard"
            :label="t('export.start')"
            :disabled="!canRecord || isDecoding"
            @click="startRecording"
          />
          <UButton
            v-else
            data-testid="audio-video-stop-record"
            icon="i-lucide-octagon"
            :label="t('export.stop')"
            color="error"
            @click="stopRecording"
          />
          <UProgress
            v-if="isRecording"
            class="min-w-48 flex-1"
            :model-value="duration ? currentTime / duration * 100 : 0"
          />
        </div>
        <UAlert
          v-if="downloadUrl"
          class="mt-4"
          color="success"
          icon="i-lucide-circle-check"
          :title="t('export.done')"
        >
          <template #actions>
            <UButton
              data-testid="audio-video-download"
              :to="downloadUrl"
              :download="`${title || 'audio'}_AudioVideo.webm`"
              icon="i-lucide-download"
              :label="t('export.download')"
              size="sm"
            />
          </template>
        </UAlert>
      </UCard>
    </section>

    <aside class="space-y-6 lg:col-span-4">
      <UCard>
        <template #header>
          <h2 class="text-sm font-medium">
            {{ t('upload.heading') }}
          </h2>
        </template>
        <label
          data-testid="audio-video-upload"
          class="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-default p-6 text-center"
          :class="{ 'bg-elevated': isDraggingOver }"
        >
          <UIcon
            name="i-lucide-file-audio"
            class="size-8 text-muted"
          />
          <span class="text-sm">{{ t('upload.action') }}</span>
          <span class="text-xs text-muted">{{ t('upload.description') }}</span>
          <input
            ref="fileInput"
            data-testid="audio-video-file-input"
            class="sr-only"
            type="file"
            accept="audio/*"
            @change="handleFile(($event.target as HTMLInputElement).files?.[0])"
          >
        </label>
        <div
          v-if="fileName"
          data-testid="audio-video-file-info"
          class="mt-3 rounded-md bg-elevated p-3"
        >
          <p class="truncate text-sm font-medium">
            {{ fileName }}
          </p>
          <p class="text-xs text-muted">
            {{ t('upload.ready') }}
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-sm font-medium">
            {{ t('metadata.heading') }}
          </h2>
        </template>
        <div class="space-y-3">
          <UFormField :label="t('metadata.title')">
            <UInput
              v-model="title"
              data-testid="audio-video-title"
              :placeholder="t('metadata.titlePlaceholder')"
            />
          </UFormField>
          <UFormField :label="t('metadata.artist')">
            <UInput
              v-model="artist"
              data-testid="audio-video-artist"
              :placeholder="t('metadata.artistPlaceholder')"
            />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-sm font-medium">
            {{ t('convert.heading') }}
          </h2>
        </template>
        <code class="block overflow-x-auto rounded bg-elevated p-3 text-xs text-muted">ffmpeg -i input.webm -r 60 out.mp4</code>
      </UCard>

      <UAlert
        v-if="isDecoding"
        data-testid="audio-video-decoding"
        color="info"
        icon="i-lucide-loader-circle"
        :title="t('status.decoding')"
      />
      <UAlert
        v-else-if="status"
        data-testid="audio-video-status"
        color="success"
        icon="i-lucide-circle-check"
        :title="t('status.loaded')"
      />
      <UAlert
        v-if="error"
        data-testid="audio-video-error"
        color="error"
        icon="i-lucide-circle-alert"
        :title="t(`errors.${error}`)"
      />
    </aside>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "controls": {
      "play": "Play",
      "pause": "Pause",
      "stop": "Stop",
      "noTrack": "No audio selected",
      "seek": "Seek",
      "mute": "Mute",
      "volume": "Volume"
    },
    "export": {
      "title": "High-quality export",
      "supported": "WebM export supported",
      "unsupported": "WebM export unavailable",
      "description": "Create a WebM video with the displayed waveform and audio. Playback starts from the beginning and the download becomes available when it finishes.",
      "start": "Start video export",
      "stop": "Stop and save",
      "done": "Video export is ready.",
      "download": "Download video"
    },
    "upload": {
      "heading": "1. Load an audio file",
      "action": "Choose a file or drop it here",
      "description": "MP3, WAV, AAC, M4A, and OGG",
      "ready": "Ready to play and export."
    },
    "metadata": {
      "heading": "2. Enter track details",
      "title": "Track title",
      "artist": "Artist",
      "titlePlaceholder": "My awesome track",
      "artistPlaceholder": "Unknown artist"
    },
    "convert": {
      "heading": "3. Convert to MP4"
    },
    "status": {
      "decoding": "Decoding audio…",
      "loaded": "Audio is ready to play and export."
    },
    "errors": {
      "invalid": "Choose an audio file.",
      "unsupported": "Web Audio is not available in this browser.",
      "read": "The audio file could not be read.",
      "decode": "The audio file could not be decoded. Try another format.",
      "record": "Video export is not available in this browser."
    }
  },
  "ja": {
    "controls": {
      "play": "再生",
      "pause": "一時停止",
      "stop": "停止",
      "noTrack": "オーディオ未選択",
      "seek": "再生位置",
      "mute": "ミュート",
      "volume": "音量"
    },
    "export": {
      "title": "高画質エクスポート",
      "supported": "WebM 動画出力に対応",
      "unsupported": "WebM 動画出力は利用できません",
      "description": "表示中の波形と音声を含む WebM 動画を作成します。開始すると先頭から再生され、終了後にダウンロードできます。",
      "start": "動画の書き出しを開始",
      "stop": "停止して保存",
      "done": "動画の書き出しが完了しました。",
      "download": "動画をダウンロード"
    },
    "upload": {
      "heading": "1. 音声ファイルをロード",
      "action": "ファイルを選択、またはドロップ",
      "description": "MP3、WAV、AAC、M4A、OGG",
      "ready": "再生・書き出しの準備ができました。"
    },
    "metadata": {
      "heading": "2. 曲情報の入力",
      "title": "曲名",
      "artist": "アーティスト名",
      "titlePlaceholder": "曲名を入力",
      "artistPlaceholder": "アーティスト名を入力"
    },
    "convert": {
      "heading": "3. MP4 へ変換"
    },
    "status": {
      "decoding": "音声をデコード中…",
      "loaded": "音声を再生・書き出しできます。"
    },
    "errors": {
      "invalid": "音声ファイルを選択してください。",
      "unsupported": "このブラウザでは Web Audio を利用できません。",
      "read": "音声ファイルを読み込めませんでした。",
      "decode": "音声をデコードできませんでした。別の形式をお試しください。",
      "record": "このブラウザでは動画を書き出せません。"
    }
  }
}
</i18n>
