<script setup lang="ts">
const { t } = useI18n()
const md = useMarkdownLink()
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <div class="space-y-4">
        <UFieldGroup>
          <UButton
            data-testid="markdown-link-mode-link"
            :label="t('modes.link')"
            icon="i-lucide-link"
            :aria-pressed="md.mode.value === 'link'"
            :color="md.mode.value === 'link' ? 'primary' : 'neutral'"
            :variant="md.mode.value === 'link' ? 'soft' : 'outline'"
            @click="md.mode.value = 'link'"
          />
          <UButton
            data-testid="markdown-link-mode-image"
            :label="t('modes.image')"
            icon="i-lucide-image"
            :aria-pressed="md.mode.value === 'image'"
            :color="md.mode.value === 'image' ? 'primary' : 'neutral'"
            :variant="md.mode.value === 'image' ? 'soft' : 'outline'"
            @click="md.mode.value = 'image'"
          />
        </UFieldGroup>

        <MarkdownLinkUrlForm
          v-if="md.mode.value === 'link'"
          v-model:url="md.url.value"
          v-model:title="md.title.value"
        />
        <MarkdownLinkImageForm
          v-else
          v-model:alt="md.alt.value"
          v-model:image-url="md.imageUrl.value"
          v-model:link-url="md.linkUrl.value"
        />
      </div>
    </UCard>

    <UCard :ui="{ body: 'break-all font-mono text-sm' }">
      <div class="flex items-start justify-between gap-2">
        <pre
          v-if="md.result.value"
          data-testid="markdown-link-result"
          class="whitespace-pre-wrap"
        >{{ md.result.value }}</pre>
        <p
          v-else
          data-testid="markdown-link-result-placeholder"
          class="font-sans text-muted"
        >
          {{ t('messages.resultPlaceholder') }}
        </p>
        <UButton
          v-if="md.result.value"
          data-testid="markdown-link-copy"
          :label="t('actions.copy')"
          icon="i-lucide-copy"
          color="neutral"
          variant="outline"
          size="sm"
          @click="md.copyResult"
        />
      </div>
      <UAlert
        v-if="md.error.value"
        class="mt-4"
        data-testid="markdown-link-error"
        color="error"
        :title="t(`errors.${md.error.value}`)"
      />
    </UCard>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "modes": {
      "link": "Link",
      "image": "Image"
    },
    "messages": {
      "resultPlaceholder": "The Markdown will appear here."
    },
    "actions": {
      "copy": "Copy"
    },
    "errors": {
      "copyFailed": "The result could not be copied."
    }
  },
  "ja": {
    "modes": {
      "link": "リンク",
      "image": "画像"
    },
    "messages": {
      "resultPlaceholder": "Markdownがここに表示されます。"
    },
    "actions": {
      "copy": "コピー"
    },
    "errors": {
      "copyFailed": "結果をコピーできませんでした。"
    }
  }
}
</i18n>
