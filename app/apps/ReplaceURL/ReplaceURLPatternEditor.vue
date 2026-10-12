<script setup lang="ts">
const { t } = useI18n()

const url = defineModel<string>('url', { required: true })
const before = defineModel<string>('before', { required: true })
const after = defineModel<string>('after', { required: true })
const isRegex = defineModel<boolean>('isRegex', { required: true })

const emit = defineEmits<{
  save: []
}>()
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <UFormField :label="t('labels.url')">
        <UInput
          v-model="url"
          data-testid="replace-url-url"
          class="w-full"
          autofocus
          inputmode="url"
          :placeholder="t('placeholders.url')"
        />
      </UFormField>

      <div
        data-testid="replace-url-controls"
        class="grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]"
      >
        <UFormField :label="t('labels.before')">
          <UInput
            v-model="before"
            data-testid="replace-url-before"
            class="w-full"
            :placeholder="t('placeholders.before')"
          />
        </UFormField>
        <UFormField :label="t('labels.after')">
          <UInput
            v-model="after"
            data-testid="replace-url-after"
            class="w-full"
            :placeholder="t('placeholders.after')"
          />
        </UFormField>
        <UButton
          data-testid="replace-url-regex"
          :label="t('actions.regex')"
          :aria-pressed="isRegex"
          :color="isRegex ? 'primary' : 'neutral'"
          :variant="isRegex ? 'soft' : 'outline'"
          icon="i-lucide-regex"
          @click="isRegex = !isRegex"
        />
        <UButton
          class="whitespace-nowrap"
          data-testid="replace-url-save-pattern"
          :label="t('actions.savePattern')"
          icon="i-lucide-bookmark-plus"
          color="primary"
          @click="emit('save')"
        />
      </div>
    </div>
  </UCard>
</template>

<i18n lang="json">
{
  "en": {
    "labels": {
      "url": "URL",
      "before": "Before",
      "after": "After"
    },
    "placeholders": {
      "url": "https://example.com/page",
      "before": "Text or regular expression",
      "after": "Replacement text"
    },
    "actions": {
      "regex": "Regex",
      "savePattern": "Save"
    }
  },
  "ja": {
    "labels": {
      "url": "URL",
      "before": "置換前",
      "after": "置換後"
    },
    "placeholders": {
      "url": "https://example.com/page",
      "before": "文字列または正規表現",
      "after": "置換後の文字列"
    },
    "actions": {
      "regex": "正規表現",
      "savePattern": "保存"
    }
  }
}
</i18n>
