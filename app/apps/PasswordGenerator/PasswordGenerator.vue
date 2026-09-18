<script setup lang="ts">
const { t } = useI18n()
const {
  password,
  length,
  activePreset,
  copied,
  newPresetName,
  customChars,
  requireAllTypes,
  charSets,
  customPresets,
  generatePassword,
  applyBuiltinPreset,
  applyCustomPreset,
  savePreset,
  deleteCustomPreset,
  copyPassword,
} = usePasswordGenerator()

const quickLengths = [8, 12, 16, 32, 64]
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <section>
      <p class="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">
        {{ t('presets.label') }}
      </p>
      <div class="flex flex-wrap gap-2">
        <UButton
          data-testid="password-preset-strong"
          :label="t('presets.strong')"
          :color="activePreset === 'strong' ? 'primary' : 'neutral'"
          :variant="activePreset === 'strong' ? 'solid' : 'outline'"
          @click="applyBuiltinPreset('strong')"
        />
        <UButton
          data-testid="password-preset-simple"
          :label="t('presets.simple')"
          :color="activePreset === 'simple' ? 'primary' : 'neutral'"
          :variant="activePreset === 'simple' ? 'solid' : 'outline'"
          @click="applyBuiltinPreset('simple')"
        />
        <div
          v-for="preset in customPresets"
          :key="preset.name"
          class="flex items-center gap-1"
        >
          <UButton
            :data-testid="`password-preset-${preset.name}`"
            :label="preset.name"
            :color="activePreset === preset.name ? 'primary' : 'neutral'"
            :variant="activePreset === preset.name ? 'solid' : 'outline'"
            @click="applyCustomPreset(preset)"
          />
          <UButton
            :data-testid="`password-delete-preset-${preset.name}`"
            icon="i-lucide-x"
            color="error"
            variant="ghost"
            size="xs"
            :aria-label="t('actions.deletePreset', { name: preset.name })"
            @click="deleteCustomPreset(preset.name)"
          />
        </div>
      </div>
    </section>

    <UCard>
      <div class="space-y-3">
        <UFormField :label="t('password.label')">
          <UInput
            :model-value="password"
            data-testid="password-output"
            readonly
            :placeholder="t('password.placeholder')"
            class="w-full"
            :ui="{ base: 'font-mono text-lg' }"
          />
        </UFormField>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            data-testid="password-regenerate"
            icon="i-lucide-refresh-cw"
            :label="t('actions.regenerate')"
            @click="generatePassword"
          />
          <UButton
            data-testid="password-copy"
            :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            :label="t('actions.copy')"
            color="neutral"
            variant="outline"
            @click="copyPassword"
          />
          <span
            v-if="copied"
            data-testid="password-copy-status"
            class="text-sm text-success"
            role="status"
          >
            {{ t('password.copied') }}
          </span>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold">
          {{ t('settings.title') }}
        </h2>
      </template>

      <div class="space-y-6">
        <UFormField :label="t('settings.characterSets')">
          <div class="grid gap-3 sm:grid-cols-3">
            <UCheckbox
              v-model="charSets.numbers"
              data-testid="password-numbers"
              :label="t('settings.numbers')"
            />
            <UCheckbox
              v-model="charSets.letters"
              data-testid="password-letters"
              :label="t('settings.letters')"
            />
            <UCheckbox
              v-model="charSets.symbols"
              data-testid="password-symbols"
              :label="t('settings.symbols')"
            />
          </div>
        </UFormField>

        <UFormField :label="t('settings.options')">
          <UCheckbox
            v-model="requireAllTypes"
            data-testid="password-require-all"
            :label="t('settings.requireAll')"
          />
        </UFormField>

        <UFormField
          name="custom-characters"
          :label="t('settings.customCharacters')"
        >
          <UInput
            v-model="customChars"
            data-testid="password-custom-characters"
            :placeholder="t('settings.customPlaceholder')"
          />
        </UFormField>

        <UFormField
          name="length"
          :label="t('settings.length')"
          :hint="t('settings.lengthValue', { length })"
        >
          <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="quickLength in quickLengths"
                :key="quickLength"
                :data-testid="`password-length-${quickLength}`"
                :label="String(quickLength)"
                :color="length === quickLength ? 'primary' : 'neutral'"
                :variant="length === quickLength ? 'solid' : 'outline'"
                size="sm"
                @click="length = quickLength"
              />
            </div>
            <input
              v-model.number="length"
              data-testid="password-length"
              class="w-full accent-primary"
              type="range"
              min="4"
              max="64"
            >
          </div>
        </UFormField>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold">
          {{ t('savePreset.title') }}
        </h2>
      </template>

      <form
        class="flex flex-col gap-3 sm:flex-row"
        @submit.prevent="savePreset"
      >
        <UInput
          v-model="newPresetName"
          data-testid="password-preset-name"
          class="flex-1"
          :placeholder="t('savePreset.placeholder')"
          required
        />
        <UButton
          data-testid="password-save-preset"
          type="submit"
          :label="t('actions.save')"
        />
      </form>
    </UCard>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "presets": {
      "label": "Presets",
      "strong": "Strong (32 characters, all types)",
      "simple": "Simple (12 characters, no symbols)"
    },
    "password": {
      "label": "Generated password",
      "placeholder": "Your password appears here",
      "copied": "Copied to clipboard."
    },
    "settings": {
      "title": "Password settings",
      "characterSets": "Character sets",
      "numbers": "Numbers (0-9)",
      "letters": "Letters (a-z, A-Z)",
      "symbols": "Symbols",
      "options": "Character set options",
      "requireAll": "Require every selected character type",
      "customCharacters": "Additional custom characters",
      "customPlaceholder": "Example: &*+?=",
      "length": "Length",
      "lengthValue": "{length} characters"
    },
    "savePreset": {
      "title": "Save as preset",
      "placeholder": "Enter a preset name"
    },
    "actions": {
      "regenerate": "Regenerate",
      "copy": "Copy",
      "save": "Save",
      "deletePreset": "Delete {name}"
    }
  },
  "ja": {
    "presets": {
      "label": "プリセット",
      "strong": "Strong（32文字・全文字種）",
      "simple": "Simple（12文字・記号なし）"
    },
    "password": {
      "label": "生成されたパスワード",
      "placeholder": "ここにパスワードが表示されます",
      "copied": "クリップボードにコピーしました。"
    },
    "settings": {
      "title": "パラメータ設定",
      "characterSets": "文字セット",
      "numbers": "数字（0-9）",
      "letters": "アルファベット（a-z, A-Z）",
      "symbols": "記号",
      "options": "文字セットオプション",
      "requireAll": "選択文字種を必ず含める",
      "customCharacters": "追加のカスタム文字",
      "customPlaceholder": "例: &*+?=",
      "length": "長さ",
      "lengthValue": "{length} 文字"
    },
    "savePreset": {
      "title": "プリセットに保存",
      "placeholder": "プリセット名を入力"
    },
    "actions": {
      "regenerate": "再生成",
      "copy": "コピー",
      "save": "保存する",
      "deletePreset": "{name} を削除"
    }
  }
}
</i18n>
