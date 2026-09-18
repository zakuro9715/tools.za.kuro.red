<script setup lang="ts">
import { onMounted, reactive } from 'vue'

const { t } = useI18n()
const checker = reactive(useTextChecker())
const errorText = computed(() => checker.error ? t(`errors.${checker.error}`) : '')

onMounted(checker.loadSettings)
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex flex-wrap items-end gap-3">
        <UFormField
          class="min-w-52 flex-1"
          :label="t('labels.apiKey')"
        >
          <UInput
            v-model="checker.apiKey"
            data-testid="text-checker-api-key"
            type="password"
            @change="checker.saveSettings"
          />
        </UFormField>
        <UFormField :label="t('labels.model')">
          <USelect
            v-model="checker.model"
            :items="checker.models"
            @change="checker.saveSettings"
          />
        </UFormField>
        <UButton
          data-testid="text-checker-settings"
          :label="t('actions.promptSettings')"
          icon="i-lucide-settings-2"
          color="neutral"
          variant="outline"
          @click="checker.settingsOpen = !checker.settingsOpen"
        />
        <span class="text-sm text-muted">{{ t('labels.characters', { count: checker.input.length }) }}</span>
      </div>
      <div
        v-if="checker.settingsOpen"
        class="mt-4"
      >
        <UFormField :label="t('labels.systemPrompt')">
          <UTextarea
            v-model="checker.systemPrompt"
            :rows="3"
            @change="checker.saveSettings"
          />
        </UFormField>
        <UButton
          class="mt-2"
          :label="t('actions.resetPrompt')"
          icon="i-lucide-rotate-ccw"
          size="sm"
          color="neutral"
          variant="outline"
          @click="checker.resetPrompt"
        />
      </div>
    </UCard>
    <div class="grid min-h-80 gap-4 md:grid-cols-2">
      <UCard
        :title="t('sections.source')"
        :ui="{ body: 'flex flex-1 p-0 sm:p-0' }"
      >
        <template #header>
          <div class="flex justify-between">
            <span>{{ t('sections.source') }}</span><UButton
              v-if="checker.input"
              data-testid="text-checker-clear"
              :label="t('actions.clear')"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="checker.clear"
            />
          </div>
        </template>
        <UTextarea
          v-model="checker.input"
          data-testid="text-checker-input"
          class="w-full"
          :rows="14"
          :placeholder="t('placeholders.input')"
          :ui="{ base: 'resize-y border-0 ring-0 rounded-none' }"
        />
      </UCard>
      <UCard
        :title="t('sections.result')"
        :ui="{ body: 'min-h-64 whitespace-pre-wrap' }"
      >
        <template #header>
          <div class="flex justify-between">
            <span>{{ t('sections.result') }}</span><div class="flex gap-1">
              <UButton
                v-if="checker.result"
                :label="t('actions.highlight')"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="checker.highlightDiff = !checker.highlightDiff"
              /><UButton
                v-if="checker.result"
                data-testid="text-checker-copy"
                :label="checker.copied ? t('actions.copied') : t('actions.copy')"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="checker.copy"
              />
            </div>
          </div>
        </template>
        <span
          v-if="checker.loading"
          class="text-muted"
        >{{ t('status.checking') }}</span>
        <template v-else-if="checker.result">
          <template
            v-for="(chunk, index) in checker.diff"
            :key="index"
          >
            <mark
              v-if="checker.highlightDiff && chunk.isMarked"
              class="bg-success/20 text-default"
            >{{ chunk.text }}</mark><span v-else>{{ chunk.text }}</span>
          </template>
        </template>
        <span
          v-else
          class="text-muted"
        >{{ t('placeholders.result') }}</span>
      </UCard>
    </div>
    <div class="flex justify-center">
      <UButton
        data-testid="text-checker-submit"
        :label="t('actions.check')"
        icon="i-lucide-wand-sparkles"
        :loading="checker.loading"
        :disabled="!checker.input.trim()"
        @click="checker.check"
      />
    </div>
    <UAlert
      v-if="errorText"
      data-testid="text-checker-error"
      color="error"
      :title="errorText"
      :close="true"
      @update:open="checker.error = null"
    />
    <UCard
      v-if="checker.issues.length"
      :title="t('issues.title', { count: checker.issues.length })"
    >
      <ul class="divide-y divide-default">
        <li
          v-for="(issue, index) in checker.issues"
          :key="index"
          class="py-3 text-sm"
        >
          <UBadge
            :label="issue.type || t('issues.default')"
            color="info"
            variant="subtle"
          /><p class="mt-1">
            <del>{{ issue.original }}</del> → <strong>{{ issue.suggestion }}</strong>
          </p><p class="text-muted">
            {{ issue.reason }}
          </p>
        </li>
      </ul>
    </UCard>
    <UAlert
      v-else-if="checker.hasChecked"
      color="success"
      :title="t('issues.none')"
    />
  </div>
</template>

<i18n lang="json">
{
  "en": { "actions": { "promptSettings": "Prompt settings", "resetPrompt": "Reset prompt", "clear": "Clear", "highlight": "Highlight", "copy": "Copy", "copied": "Copied", "check": "Check writing" }, "labels": { "apiKey": "Gemini API key", "model": "Model", "systemPrompt": "System prompt", "characters": "Characters: {count}" }, "sections": { "source": "Original text", "result": "Corrected text" }, "placeholders": { "input": "Enter text to check...", "result": "The result appears here." }, "status": { "checking": "Checking..." }, "errors": { "missingKey": "Enter a Gemini API key.", "request": "The check failed. Verify the API key and network, then try again.", "copy": "Could not copy the result." }, "issues": { "title": "Issues ({count})", "default": "Issue", "none": "No corrections were found." } },
  "ja": { "actions": { "promptSettings": "プロンプト設定", "resetPrompt": "初期値にリセット", "clear": "クリア", "highlight": "ハイライト", "copy": "コピー", "copied": "コピー完了", "check": "校正を実行" }, "labels": { "apiKey": "Gemini API キー", "model": "モデル", "systemPrompt": "システムプロンプト", "characters": "文字数: {count}" }, "sections": { "source": "元の文章", "result": "修正後の文章" }, "placeholders": { "input": "ここにチェックしたい文章を入力してください...", "result": "チェック結果がここに表示されます。" }, "status": { "checking": "チェック中..." }, "errors": { "missingKey": "Gemini APIキーを入力してください。", "request": "校正中にエラーが発生しました。APIキーとネットワークを確認して再試行してください。", "copy": "コピーに失敗しました。" }, "issues": { "title": "指摘箇所 ({count}件)", "default": "指摘", "none": "誤字脱字・修正が必要な箇所は見つかりませんでした。" } }
}
</i18n>
