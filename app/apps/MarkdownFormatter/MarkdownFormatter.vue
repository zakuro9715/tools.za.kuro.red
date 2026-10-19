<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()
const { input, rules, output, diff, hasChanges } = useMarkdownFormatter()

const pasteText = async () => {
  try {
    input.value = await navigator.clipboard.readText()
  } catch (error) {
    console.error('Failed to read text from the clipboard.', error)
    toast.add({
      title: t('clipboard.pasteErrorTitle'),
      description: t('clipboard.errorDescription'),
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
}

const insertSample = () => {
  input.value = t('sample')
}

const copyOutput = async () => {
  try {
    await navigator.clipboard.writeText(output.value)
    toast.add({ title: t('clipboard.copied'), icon: 'i-lucide-check' })
  } catch (error) {
    console.error('Failed to write text to the clipboard.', error)
    toast.add({
      title: t('clipboard.copyErrorTitle'),
      description: t('clipboard.errorDescription'),
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
}
</script>

<template>
  <div class="space-y-6">
    <MarkdownFormatterRules v-model="rules" />

    <div class="grid gap-4 md:grid-cols-2">
      <UFormField
        name="input"
        :label="t('input.label')"
      >
        <template #hint>
          <div class="flex items-center gap-2">
            <UButton
              data-testid="markdown-formatter-sample"
              icon="i-lucide-file-text"
              :label="t('actions.sample')"
              color="neutral"
              variant="outline"
              size="sm"
              @click="insertSample"
            />
            <UButton
              data-testid="markdown-formatter-paste"
              icon="i-lucide-clipboard-paste"
              :label="t('actions.paste')"
              color="neutral"
              variant="outline"
              size="sm"
              @click="pasteText"
            />
            <UButton
              v-if="input"
              data-testid="markdown-formatter-clear"
              icon="i-lucide-trash-2"
              :label="t('actions.clear')"
              color="neutral"
              variant="outline"
              size="sm"
              @click="input = ''"
            />
          </div>
        </template>
        <UTextarea
          v-model="input"
          data-testid="markdown-formatter-input"
          :placeholder="t('input.placeholder')"
          :rows="14"
          class="w-full"
          autofocus
          :ui="{ base: 'resize-y font-mono' }"
        />
      </UFormField>

      <UFormField
        name="output"
        :label="t('output.label')"
      >
        <template #hint>
          <UButton
            data-testid="markdown-formatter-copy"
            icon="i-lucide-copy"
            :label="t('actions.copy')"
            color="neutral"
            variant="outline"
            size="sm"
            :disabled="!output"
            @click="copyOutput"
          />
        </template>
        <UTextarea
          :model-value="output"
          data-testid="markdown-formatter-output"
          readonly
          :rows="14"
          class="w-full"
          :ui="{ base: 'resize-y font-mono' }"
        />
      </UFormField>
    </div>

    <MarkdownFormatterDiff
      v-if="hasChanges"
      data-testid="markdown-formatter-diff"
      :lines="diff"
    />
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "actions": {
      "paste": "Paste",
      "sample": "Sample",
      "clear": "Clear",
      "copy": "Copy"
    },
    "clipboard": {
      "pasteErrorTitle": "Could not paste text",
      "copyErrorTitle": "Could not copy text",
      "copied": "Copied",
      "errorDescription": "Allow clipboard access and try again."
    },
    "sample": "#Sample\n\nSee https://example.com for details.\nhttps://example.com/image.png\n\n\n*   item one\n  * nested item\n・bullet item\n\n3. first\n9. second\n\nThis is ** bold ** and [link] (https://example.com).  \n",
    "input": {
      "label": "Input",
      "placeholder": "Paste Markdown here..."
    },
    "output": {
      "label": "Output"
    }
  },
  "ja": {
    "actions": {
      "paste": "貼り付け",
      "sample": "サンプル",
      "clear": "クリア",
      "copy": "コピー"
    },
    "clipboard": {
      "pasteErrorTitle": "テキストを貼り付けできませんでした",
      "copyErrorTitle": "テキストをコピーできませんでした",
      "copied": "コピーしました",
      "errorDescription": "クリップボードへのアクセスを許可して、もう一度お試しください。"
    },
    "sample": "#サンプル\n\n詳細は https://example.com を参照してください。\nhttps://example.com/image.png\n\n\n*   項目1\n  * 入れ子の項目\n・箇条書き\n\n3. 最初\n9. 次\n\nこれは ** 太字 ** と [リンク] (https://example.com) です。  \n",
    "input": {
      "label": "入力",
      "placeholder": "ここにMarkdownを貼り付けてください..."
    },
    "output": {
      "label": "出力"
    }
  }
}
</i18n>
