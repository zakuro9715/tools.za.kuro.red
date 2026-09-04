<script setup lang="ts">
const { locale, t } = useI18n()
const toast = useToast()
const { clearText, stats, text } = useTextCounter()

const numberFormatter = computed(() => new Intl.NumberFormat(locale.value))

const formatNumber = (value: number) => numberFormatter.value.format(value)

const pasteText = async () => {
  try {
    text.value = await navigator.clipboard.readText()
  } catch (error) {
    console.error('Failed to read text from the clipboard.', error)
    toast.add({
      title: t('clipboard.errorTitle'),
      description: t('clipboard.errorDescription'),
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
}
</script>

<template>
  <div class="space-y-6">
    <UFormField
      name="text"
      :label="t('editor.label')"
      class=""
    >
      <template #hint>
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-clipboard-paste"
            :label="t('actions.paste')"
            color="neutral"
            variant="outline"
            size="sm"
            @click="pasteText"
          />
          <UButton
            v-if="text"
            icon="i-lucide-trash-2"
            :label="t('actions.clear')"
            color="neutral"
            variant="outline"
            size="sm"
            @click="clearText"
          />
        </div>
      </template>

      <UTextarea
        v-model="text"
        :placeholder="t('editor.placeholder')"
        :rows="10"
        class="w-full"
        autoresize
        autofocus
        :ui="{ base: 'resize-y' }"
      />
    </UFormField>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      <TextCounterMetric
        :label="t('metrics.charactersWithSpaces')"
        :value="formatNumber(stats.charCountWithSpaces)"
      />
      <TextCounterMetric
        :label="t('metrics.characters')"
        :value="formatNumber(stats.charCountWithoutSpaces)"
      />
      <TextCounterMetric
        :label="t('metrics.linesWithEmpty')"
        :value="formatNumber(stats.lineCountWithEmpty)"
      />
      <TextCounterMetric
        :label="t('metrics.emptyLines')"
        :value="formatNumber(stats.emptyLineCount)"
      />
      <TextCounterMetric
        :label="t('metrics.maxLineLength')"
        :value="formatNumber(stats.maxLineLength)"
      />
      <TextCounterMetric
        :label="t('metrics.manuscriptPages')"
        :value="formatNumber(stats.manuscriptPages)"
        :unit="t('units.sheets')"
      />
      <TextCounterMetric
        :label="t('metrics.bookPages')"
        :value="formatNumber(stats.bookPages)"
        :unit="t('units.pages')"
      />
      <TextCounterMetric
        :label="t('metrics.readingTime')"
        :value="t('readingTime', { minutes: stats.readingMinutes })"
      />
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "actions": {
      "paste": "Paste",
      "clear": "Clear"
    },
    "clipboard": {
      "errorTitle": "Could not paste text",
      "errorDescription": "Allow clipboard access and try again."
    },
    "editor": {
      "label": "Enter or paste text",
      "placeholder": "Enter text here..."
    },
    "metrics": {
      "charactersWithSpaces": "Characters (with spaces)",
      "characters": "Characters",
      "linesWithEmpty": "Lines (with empty lines)",
      "emptyLines": "Empty lines",
      "maxLineLength": "Longest line",
      "manuscriptPages": "Manuscript pages",
      "bookPages": "Paperback pages (about 600 chars/page)",
      "readingTime": "Estimated reading time (400 chars/min)"
    },
    "units": {
      "sheets": "sheets",
      "pages": "pages"
    },
    "readingTime": "About {minutes} min"
  },
  "ja": {
    "actions": {
      "paste": "貼り付け",
      "clear": "クリア"
    },
    "clipboard": {
      "errorTitle": "テキストを貼り付けできませんでした",
      "errorDescription": "クリップボードへのアクセスを許可して、もう一度お試しください。"
    },
    "editor": {
      "label": "テキストを入力またはペースト",
      "placeholder": "ここにテキストを入力してください..."
    },
    "metrics": {
      "charactersWithSpaces": "文字数（空白込み）",
      "characters": "文字数",
      "linesWithEmpty": "行数（空白込み）",
      "emptyLines": "空白行数",
      "maxLineLength": "1行最大文字数",
      "manuscriptPages": "原稿用紙換算",
      "bookPages": "文庫本（約600字/P）",
      "readingTime": "読了時間（400字/分）"
    },
    "units": {
      "sheets": "枚",
      "pages": "ページ"
    },
    "readingTime": "約 {minutes} 分"
  }
}
</i18n>
