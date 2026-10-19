<script setup lang="ts">
import type { DiffLine } from './useMarkdownFormatter'

defineProps<{ lines: DiffLine[] }>()

const { t } = useI18n()

const markers = { same: ' ', add: '+', remove: '-' } as const
const classes = {
  same: 'text-muted',
  add: 'bg-success/10 text-success',
  remove: 'bg-error/10 text-error',
} as const
</script>

<template>
  <div class="space-y-2">
    <p class="text-sm font-medium text-highlighted">
      {{ t('title') }}
    </p>
    <div class="overflow-x-auto rounded-md border border-default font-mono text-sm">
      <div
        v-for="(line, index) in lines"
        :key="index"
        :data-testid="`markdown-formatter-diff-${line.type}`"
        class="flex whitespace-pre px-2"
        :class="classes[line.type]"
      >
        <span class="w-4 shrink-0 select-none">{{ markers[line.type] }}</span>
        <span>{{ line.text }}</span>
      </div>
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "title": "Diff"
  },
  "ja": {
    "title": "差分"
  }
}
</i18n>
