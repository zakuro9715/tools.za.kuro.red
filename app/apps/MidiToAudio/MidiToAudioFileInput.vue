<script setup lang="ts">
const emit = defineEmits<{ select: [file: File | undefined] }>()
const { t } = useI18n()

const isDraggingOver = shallowRef(false)
</script>

<template>
  <label
    data-testid="midi-file-input-upload"
    class="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-default p-8 text-center"
    :class="{ 'bg-elevated': isDraggingOver }"
    @dragover.prevent="isDraggingOver = true"
    @dragleave.prevent="isDraggingOver = false"
    @drop.prevent="isDraggingOver = false; emit('select', $event.dataTransfer?.files[0])"
  >
    <UIcon
      name="i-lucide-music"
      class="size-10 text-muted"
    />
    <span class="text-sm font-medium">{{ t('title') }}</span>
    <span class="text-xs text-muted">{{ t('description') }}</span>
    <input
      data-testid="midi-file-input"
      class="sr-only"
      type="file"
      accept=".mid,.midi,audio/midi,audio/x-midi"
      @change="emit('select', ($event.target as HTMLInputElement).files?.[0])"
    >
  </label>
</template>

<i18n lang="json">
{
  "en": {
    "title": "Select or drop a MIDI file",
    "description": ".mid / .midi"
  },
  "ja": {
    "title": "MIDIファイルを選択またはドロップ",
    "description": ".mid / .midi"
  }
}
</i18n>
