<script setup lang="ts">
import { onMounted } from 'vue'
import { presetPatterns, useReplaceURL } from './useReplaceURL'

const { t } = useI18n()
const replacer = useReplaceURL()
const isSaveModalOpen = ref(false)
const errorMessage = computed(() => {
  if (replacer.result.value.error === 'invalidRegex') {
    return t('errors.invalidRegex')
  }
  return replacer.error.value ? t(`errors.${replacer.error.value}`) : ''
})
const saveErrorMessage = computed(() => {
  if (replacer.error.value === 'invalidName' || replacer.error.value === 'duplicateName' || replacer.error.value === 'saveFailed') {
    return t(`errors.${replacer.error.value}`)
  }
  return ''
})

const openSaveModal = () => {
  replacer.error.value = null
  isSaveModalOpen.value = true
}

const savePattern = () => {
  if (replacer.savePattern()) {
    isSaveModalOpen.value = false
    replacer.patternName.value = ''
  }
}

onMounted(replacer.loadPatterns)
</script>

<template>
  <div class="space-y-4">
    <ReplaceURLPatternEditor
      v-model:url="replacer.url.value"
      v-model:before="replacer.before.value"
      v-model:after="replacer.after.value"
      v-model:is-regex="replacer.isRegex.value"
      @save="openSaveModal"
    />

    <UModal
      v-model:open="isSaveModalOpen"
      :title="t('saveModal.title')"
    >
      <template #body>
        <UFormField :label="t('saveModal.patternName')">
          <UInput
            v-model="replacer.patternName.value"
            data-testid="replace-url-pattern-name"
            class="w-full"
            autofocus
            :placeholder="t('saveModal.patternNamePlaceholder')"
            @keydown.enter.prevent="savePattern"
          />
        </UFormField>
        <UAlert
          v-if="saveErrorMessage"
          class="mt-4"
          data-testid="replace-url-save-error"
          color="error"
          :title="saveErrorMessage"
        />
      </template>
      <template #footer="{ close }">
        <UButton
          data-testid="replace-url-cancel-save"
          :label="t('actions.cancel')"
          color="neutral"
          variant="outline"
          @click="close"
        />
        <UButton
          data-testid="replace-url-confirm-save"
          :label="t('actions.save')"
          icon="i-lucide-bookmark-plus"
          @click="savePattern"
        />
      </template>
    </UModal>

    <UCard :ui="{ body: 'break-all font-mono text-sm' }">
      <div class="flex justify-between items-center">
        <p
          v-if="errorMessage"
          data-testid="replace-url-error"
          class="text-error"
          role="alert"
        >
          {{ errorMessage }}
        </p>
        <p
          v-else-if="replacer.result.value.url"
          data-testid="replace-url-result"
          class="break-all"
        >
          <a
            v-if="replacer.isOpenable.value"
            :href="replacer.result.value.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary underline-offset-4 hover:underline"
          >{{ replacer.result.value.url }}</a>
          <span v-else>{{ replacer.result.value.url }}</span>
        </p>
        <p
          v-else
          data-testid="replace-url-result-placeholder"
          class="font-sans text-muted"
        >
          {{ t('messages.resultPlaceholder') }}
        </p>
        <div class="flex gap-2">
          <UButton
            v-if="replacer.result.value.url"
            data-testid="replace-url-copy"
            :label="t('actions.copy')"
            icon="i-lucide-copy"
            color="neutral"
            variant="outline"
            size="sm"
            @click="replacer.copyResult"
          />
          <UButton
            v-if="replacer.isOpenable.value"
            data-testid="replace-url-open"
            :label="t('actions.open')"
            icon="i-lucide-external-link"
            size="sm"
            :to="replacer.result.value.url"
            target="_blank"
            rel="noopener noreferrer"
          />
        </div> <!-- Closing the flex justify-between div -->
      </div>
    </UCard>

    <ReplaceURLPatternList
      :presets="presetPatterns"
      :saved-patterns="replacer.savedPatterns.value"
      @use="replacer.usePattern"
      @delete="replacer.deletePattern"
    />
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "sections": {
      "result": "Result"
    },
    "messages": {
      "resultPlaceholder": "The replaced URL will appear here."
    },
    "actions": {
      "copy": "Copy",
      "open": "Open link",
      "cancel": "Cancel",
      "save": "Save"
    },
    "saveModal": {
      "title": "Save pattern",
      "patternName": "Pattern name",
      "patternNamePlaceholder": "e.g. Remove query"
    },
    "errors": {
      "invalidRegex": "The regular expression is invalid.",
      "invalidName": "Enter a name for the pattern.",
      "duplicateName": "A saved pattern already uses that name.",
      "loadFailed": "Saved patterns could not be loaded.",
      "saveFailed": "The pattern could not be saved.",
      "copyFailed": "The result could not be copied."
    }
  },
  "ja": {
    "sections": {
      "result": "置換結果"
    },
    "messages": {
      "resultPlaceholder": "置換後のURLがここに表示されます。"
    },
    "actions": {
      "copy": "コピー",
      "open": "リンクを開く",
      "cancel": "キャンセル",
      "save": "保存"
    },
    "saveModal": {
      "title": "パターンを保存",
      "patternName": "パターン名",
      "patternNamePlaceholder": "例: クエリを除去"
    },
    "errors": {
      "invalidRegex": "正規表現が正しくありません。",
      "invalidName": "パターン名を入力してください。",
      "duplicateName": "同じ名前のパターンがすでに保存されています。",
      "loadFailed": "保存済みパターンを読み込めませんでした。",
      "saveFailed": "パターンを保存できませんでした。",
      "copyFailed": "結果をコピーできませんでした。"
    }
  }
}
</i18n>
