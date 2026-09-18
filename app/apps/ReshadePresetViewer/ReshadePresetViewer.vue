<script setup lang="ts">
import { reactive, useTemplateRef } from 'vue'

const { t } = useI18n()
const viewer = reactive(useReshadePresetViewer())
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const sourceItems = computed(() => [
  { label: t('presets.cinematic'), value: 'cinematic' },
  { label: t('presets.anime'), value: 'anime' },
  { label: t('presets.performance'), value: 'performance' },
  { label: t('presets.custom'), value: 'custom' },
])
const errorText = computed(() => viewer.fileError ? t(`errors.${viewer.fileError}`) : '')
const fileSelected = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) await viewer.readFile(file)
}
const exportIni = () => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([viewer.preview], { type: 'text/plain;charset=utf-8' }))
  link.download = viewer.filename
  link.click()
  URL.revokeObjectURL(link.href)
}
const copyPreview = async () => {
  await navigator.clipboard.writeText(viewer.preview)
}
const range = (value: string) => {
  const numeric = Number(value)
  return { min: numeric < 0 ? numeric * 2 : 0, max: numeric > 2 ? numeric * 1.5 : 2, step: Math.abs(numeric) > 100 ? 1 : Math.abs(numeric) > 10 ? 0.1 : 0.01 }
}
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex flex-wrap items-center gap-3">
        <UFormField :label="t('labels.preset')">
          <USelect
            v-model="viewer.source"
            :items="sourceItems"
            data-testid="reshade-preset-select"
            @change="viewer.loadDemo()"
          />
        </UFormField>
        <UButton
          data-testid="reshade-reload"
          icon="i-lucide-refresh-cw"
          :label="t('actions.reload')"
          color="neutral"
          variant="outline"
          @click="viewer.loadDemo()"
        />
        <UButton
          icon="i-lucide-upload"
          :label="t('actions.import')"
          color="neutral"
          variant="outline"
          @click="fileInput?.click()"
        />
        <UButton
          data-testid="reshade-export"
          icon="i-lucide-download"
          :label="t('actions.export')"
          @click="exportIni"
        />
        <input
          ref="fileInput"
          data-testid="reshade-file"
          class="hidden"
          type="file"
          accept=".ini"
          @change="fileSelected"
        >
        <span class="ml-auto text-sm text-muted">{{ viewer.filename }}</span>
      </div>
      <UAlert
        v-if="errorText"
        class="mt-3"
        color="error"
        :title="errorText"
      />
    </UCard>
    <div class="grid gap-4 lg:grid-cols-5">
      <UCard
        class="lg:col-span-2"
        :title="t('sections.effects')"
      >
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span>{{ t('sections.effects') }}</span><span class="text-sm text-muted">{{ t('labels.activeCount', { active: viewer.preset.techniques.length, total: viewer.preset.techniqueSorting.length }) }}</span>
          </div>
        </template>
        <div class="space-y-3">
          <UInput
            v-model="viewer.filter"
            data-testid="reshade-filter"
            icon="i-lucide-search"
            :placeholder="t('placeholders.filter')"
          />
          <div class="flex gap-2">
            <UButton
              size="xs"
              :label="t('actions.enableAll')"
              @click="viewer.toggleAll(true)"
            /><UButton
              size="xs"
              color="neutral"
              variant="outline"
              :label="t('actions.disableAll')"
              @click="viewer.toggleAll(false)"
            /><UCheckbox
              v-model="viewer.activeFirst"
              :label="t('labels.activeFirst')"
            />
          </div>
          <div class="max-h-80 space-y-1 overflow-auto">
            <p
              v-if="!viewer.effects.length"
              class="py-6 text-center text-sm text-muted"
            >
              {{ t('empty.effects') }}
            </p>
            <button
              v-for="effect in viewer.effects"
              :key="effect"
              type="button"
              data-testid="reshade-effect"
              class="flex w-full items-center gap-2 rounded p-2 text-left hover:bg-elevated"
              :class="{ 'bg-elevated': viewer.selectedEffect === effect }"
              @click="viewer.selectEffect(effect)"
            >
              <UCheckbox
                data-testid="reshade-toggle"
                :model-value="viewer.preset.techniques.includes(effect)"
                @click.stop
                @update:model-value="viewer.toggleEffect(effect, Boolean($event))"
              />
              <span class="min-w-0 flex-1 truncate">{{ effect.split('@')[0] }} <small class="text-muted">({{ getShaderFilename(effect) }})</small></span>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-chevron-up"
                :aria-label="t('actions.moveUp')"
                @click.stop="viewer.moveEffect(effect, -1)"
              />
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-chevron-down"
                :aria-label="t('actions.moveDown')"
                @click.stop="viewer.moveEffect(effect, 1)"
              />
            </button>
          </div>
        </div>
      </UCard>
      <UCard
        class="lg:col-span-3"
        :title="t('sections.parameters')"
      >
        <template #header>
          <div class="flex justify-between">
            <span>{{ t('sections.parameters') }}</span><UCheckbox
              v-model="viewer.performanceMode"
              :label="t('labels.performance')"
            />
          </div>
        </template>
        <p
          v-if="!viewer.selectedEffect"
          class="text-sm text-muted"
        >
          {{ t('empty.parameters') }}
        </p>
        <div
          v-else
          class="space-y-3"
        >
          <div class="flex justify-between text-sm">
            <strong>{{ viewer.selectedEffect }}</strong><span class="text-muted">{{ Object.keys(viewer.selectedParameters).length }} {{ t('labels.parameters') }}</span>
          </div>
          <div
            v-for="(value, key) in viewer.selectedParameters"
            :key="key"
            class="rounded border border-default p-3"
          >
            <div class="mb-2 flex justify-between">
              <label class="font-mono text-sm">{{ key }}</label><UBadge
                :label="guessParameterType(key, value)"
                color="neutral"
                variant="subtle"
              />
            </div>
            <USwitch
              v-if="guessParameterType(key, value) === 'bool'"
              :model-value="value === '1'"
              @update:model-value="viewer.updateParameter(key, $event ? '1' : '0')"
            />
            <div
              v-else-if="guessParameterType(key, value) === 'float' || guessParameterType(key, value) === 'int'"
              class="flex gap-2"
            >
              <input
                class="w-full accent-primary"
                type="range"
                :value="value"
                :min="range(value).min"
                :max="range(value).max"
                :step="range(value).step"
                @input="viewer.updateParameter(key, guessParameterType(key, value) === 'float' ? Number(($event.target as HTMLInputElement).value).toFixed(6) : ($event.target as HTMLInputElement).value)"
              ><UInput
                class="w-28"
                type="number"
                :model-value="value"
                @update:model-value="viewer.updateParameter(key, String($event))"
              />
            </div>
            <div
              v-else-if="guessParameterType(key, value) === 'color'"
              class="flex gap-2"
            >
              <input
                type="color"
                :value="colorToHex(value)"
                @input="viewer.updateParameter(key, hexToColor(($event.target as HTMLInputElement).value, value.split(',').length === 4))"
              ><UInput
                class="flex-1 font-mono"
                :model-value="value"
                @update:model-value="viewer.updateParameter(key, String($event))"
              />
            </div>
            <UInput
              v-else
              class="font-mono"
              :model-value="value"
              @update:model-value="viewer.updateParameter(key, String($event))"
            />
          </div>
        </div>
      </UCard>
    </div>
    <UCard :title="t('sections.preview')">
      <template #header>
        <div class="flex justify-between">
          <span>{{ t('sections.preview') }}</span><UButton
            data-testid="reshade-copy"
            size="xs"
            color="neutral"
            variant="outline"
            icon="i-lucide-copy"
            :label="t('actions.copy')"
            @click="copyPreview"
          />
        </div>
      </template><UTextarea
        data-testid="reshade-preview"
        :model-value="viewer.preview"
        readonly
        :rows="12"
        :ui="{ base: 'font-mono text-xs' }"
      />
    </UCard>
  </div>
</template>

<i18n lang="json">
{
  "en": { "actions": { "reload": "Reload", "import": "Import INI", "export": "Export INI", "enableAll": "Enable all", "disableAll": "Disable all", "moveUp": "Move up", "moveDown": "Move down", "copy": "Copy" }, "labels": { "preset": "Demo preset", "activeCount": "{active} / {total} effects active", "activeFirst": "Active first", "performance": "Performance mode", "parameters": "parameters" }, "sections": { "effects": "Effects", "parameters": "Effect parameters", "preview": "Generated INI text" }, "placeholders": { "filter": "Filter effects or parameters..." }, "empty": { "effects": "No matching effects.", "parameters": "Select an effect to edit its parameters." }, "errors": { "invalid": "Only INI files can be imported.", "read": "Could not read the selected file." }, "presets": { "cinematic": "Cinematic", "anime": "Anime", "performance": "Performance", "custom": "Custom" } },
  "ja": { "actions": { "reload": "再読み込み", "import": "INIを読み込む", "export": "INIを出力", "enableAll": "すべて有効", "disableAll": "すべて無効", "moveUp": "上へ移動", "moveDown": "下へ移動", "copy": "コピー" }, "labels": { "preset": "デモプリセット", "activeCount": "{active} / {total} effects active", "activeFirst": "有効を上に表示", "performance": "パフォーマンスモード", "parameters": "個のパラメータ" }, "sections": { "effects": "エフェクト", "parameters": "エフェクトパラメータ値の調整", "preview": "リアルタイム生成 INI テキスト" }, "placeholders": { "filter": "エフェクトまたはパラメータを検索..." }, "empty": { "effects": "一致するエフェクトが見つかりません", "parameters": "左側からエフェクトを選択してください。" }, "errors": { "invalid": "INIファイルのみアップロード可能です。", "read": "ファイルを読み込めませんでした。" }, "presets": { "cinematic": "シネマティック", "anime": "アニメ", "performance": "パフォーマンス", "custom": "カスタム" } }
}
</i18n>
