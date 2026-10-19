<script setup lang="ts">
const { t } = useI18n()

const url = defineModel<string>('url', { required: true })
const title = defineModel<string>('title', { required: true })
</script>

<template>
  <div class="space-y-4">
    <UFormField :label="t('labels.url')">
      <UInput
        v-model="url"
        data-testid="markdown-link-url"
        class="w-full"
        autofocus
        inputmode="url"
        placeholder="https://example.com"
      />
    </UFormField>
    <UFormField :label="t('labels.title')">
      <UInput
        v-model="title"
        data-testid="markdown-link-title"
        class="w-full"
      />
    </UFormField>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "labels": {
      "url": "URL",
      "title": "Title"
    }
  },
  "ja": {
    "labels": {
      "url": "URL",
      "title": "タイトル"
    }
  }
}
</i18n>
