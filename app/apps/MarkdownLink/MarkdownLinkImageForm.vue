<script setup lang="ts">
const { t } = useI18n()

const alt = defineModel<string>('alt', { required: true })
const imageUrl = defineModel<string>('imageUrl', { required: true })
const linkUrl = defineModel<string>('linkUrl', { required: true })
const { isHttpUrl } = useMarkdownLink()

const previewUrl = computed(() => isHttpUrl(imageUrl.value.trim()) ? imageUrl.value.trim() : '')
</script>

<template>
  <div class="space-y-4">
    <UFormField :label="t('labels.imageUrl')">
      <UInput
        v-model="imageUrl"
        data-testid="markdown-link-image-url"
        class="w-full"
        autofocus
        inputmode="url"
        placeholder="https://example.com/image.png"
      />
    </UFormField>
    <UFormField :label="t('labels.alt')">
      <UInput
        v-model="alt"
        data-testid="markdown-link-alt"
        class="w-full"
      />
    </UFormField>
    <UFormField :label="t('labels.linkUrl')">
      <UInput
        v-model="linkUrl"
        data-testid="markdown-link-link-url"
        class="w-full"
        inputmode="url"
        placeholder="https://example.com"
      />
    </UFormField>
    <img
      v-if="previewUrl"
      data-testid="markdown-link-preview"
      class="max-h-48 max-w-full rounded"
      :src="previewUrl"
      :alt="alt"
    >
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "labels": {
      "imageUrl": "Image URL",
      "alt": "Alt text",
      "linkUrl": "Link URL"
    }
  },
  "ja": {
    "labels": {
      "imageUrl": "画像URL",
      "alt": "代替テキスト",
      "linkUrl": "リンク先URL"
    }
  }
}
</i18n>
