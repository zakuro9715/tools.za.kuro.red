<script setup lang="ts">
const rules = defineModel<MarkdownFormatRules>({ required: true })
const open = ref(false)
const { t } = useI18n()
const { markdownFormatRuleIds } = useMarkdownFormatter()

const groups: { key: string, ids: MarkdownFormatRuleId[] }[] = [
  {
    key: 'general',
    ids: ['indent', 'trailingSpaces', 'extraSpaces', 'blankLines', 'headingBlank', 'headingHashSpace', 'listMarker', 'bulletChar', 'hr', 'finalNewline'],
  },
  {
    key: 'autoFix',
    ids: ['olNumber', 'urlLink', 'imageUrl', 'inlineSpaces'],
  },
]

const activeCount = computed(() => markdownFormatRuleIds.filter(id => rules.value[id]).length)
const allEnabled = computed(() => markdownFormatRuleIds.every(id => rules.value[id]))

const setRule = (id: MarkdownFormatRuleId, value: boolean | 'indeterminate') => {
  rules.value = { ...rules.value, [id]: value === true }
}

const setAll = (value: boolean) => {
  rules.value = Object.fromEntries(markdownFormatRuleIds.map(id => [id, value])) as MarkdownFormatRules
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UButton
          data-testid="markdown-formatter-rules-toggle"
          :label="t('title')"
          :trailing-icon="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          color="neutral"
          variant="soft"
          size="md"
          @click="open = !open"
        />
        <span
          data-testid="markdown-formatter-rules-count"
          class="text-sm text-muted"
        >
          {{ activeCount }}/{{ markdownFormatRuleIds.length }}
        </span>
      </div>
      <UButton
        data-testid="markdown-formatter-toggle-all"
        :label="allEnabled ? t('actions.disableAll') : t('actions.enableAll')"
        color="neutral"
        variant="outline"
        size="sm"
        @click="setAll(!allEnabled)"
      />
    </div>

    <UCollapsible v-model:open="open">
      <template #content>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-for="group in groups"
            :key="group.key"
            class="space-y-2"
          >
            <p class="text-sm text-muted">
              {{ t(`groups.${group.key}`) }}
            </p>
            <div
              v-for="id in group.ids"
              :key="id"
              :data-testid="`markdown-formatter-rule-${id}`"
            >
              <UCheckbox
                :model-value="rules[id]"
                :label="t(`rules.${id}`)"
                @update:model-value="setRule(id, $event)"
              />
            </div>
          </div>
        </div>
      </template>
    </UCollapsible>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "title": "Rules",
    "actions": {
      "enableAll": "Enable all",
      "disableAll": "Disable all"
    },
    "groups": {
      "general": "General formatting",
      "autoFix": "Auto fix"
    },
    "rules": {
      "indent": "Normalize indent to 4 spaces",
      "trailingSpaces": "Remove trailing spaces",
      "extraSpaces": "Remove extra spaces after list and heading markers",
      "blankLines": "Collapse consecutive blank lines",
      "headingBlank": "Add blank lines around headings",
      "headingHashSpace": "Add space after # in headings",
      "listMarker": "Use - for bullet lists",
      "bulletChar": "Convert ・ and • to - lists",
      "hr": "Use --- for horizontal rules",
      "finalNewline": "End with a single newline",
      "olNumber": "Renumber ordered lists from 1",
      "urlLink": "Convert URLs to links",
      "imageUrl": "Convert image URLs to images",
      "inlineSpaces": "Fix spaces in broken inlines"
    }
  },
  "ja": {
    "title": "ルール",
    "actions": {
      "enableAll": "すべてON",
      "disableAll": "すべてOFF"
    },
    "groups": {
      "general": "基本の整形",
      "autoFix": "自動修正"
    },
    "rules": {
      "indent": "インデントを4スペースに統一",
      "trailingSpaces": "行末の空白を削除",
      "extraSpaces": "リスト・見出しマーカー後の余分な空白を削除",
      "blankLines": "連続する空行を1つに",
      "headingBlank": "見出しの前後に空行を追加",
      "headingHashSpace": "見出しの # の後に空白を追加",
      "listMarker": "箇条書きを - に統一",
      "bulletChar": "・や • を - のリストに変換",
      "hr": "水平線を --- に統一",
      "finalNewline": "末尾の改行を1つに",
      "olNumber": "番号付きリストを1から振り直し",
      "urlLink": "URLをリンクに変換",
      "imageUrl": "画像URLを画像に変換",
      "inlineSpaces": "壊れたインラインの空白を修正"
    }
  }
}
</i18n>
