<script setup lang="ts">
defineProps<{
  presets: PresetPattern[]
  savedPatterns: SavedPattern[]
}>()

const emit = defineEmits<{
  use: [pattern: PresetPattern | SavedPattern]
  delete: [id: string]
}>()

const { t } = useI18n()
</script>

<template>
  <UCard>
    <div class="space-y-5">
      <section>
        <h2 class="mb-2 text-sm font-semibold text-highlighted">
          {{ t('sections.presets') }}
        </h2>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="pattern in presets"
            :key="pattern.id"
            :data-testid="`replace-url-use-pattern-${pattern.id}`"
            :label="t(`presets.${pattern.id}`)"
            color="neutral"
            variant="outline"
            size="sm"
            @click="emit('use', pattern)"
          />
        </div>
      </section>

      <section>
        <h2 class="mb-2 text-sm font-semibold text-highlighted">
          {{ t('sections.saved') }}
        </h2>
        <p
          v-if="savedPatterns.length === 0"
          data-testid="replace-url-empty-patterns"
          class="text-sm text-muted"
        >
          {{ t('messages.empty') }}
        </p>
        <ul
          v-else
          class="divide-y divide-default"
        >
          <li
            v-for="pattern in savedPatterns"
            :key="pattern.id"
            class="flex items-center gap-2 py-2"
          >
            <UButton
              :data-testid="`replace-url-use-saved-${pattern.id}`"
              class="min-w-0 flex-1 justify-start"
              :label="pattern.name"
              color="neutral"
              variant="ghost"
              @click="emit('use', pattern)"
            />
            <UBadge
              v-if="pattern.isRegex"
              :label="t('labels.regex')"
              color="info"
              variant="subtle"
            />
            <UButton
              :data-testid="`replace-url-delete-saved-${pattern.id}`"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              :aria-label="t('actions.deletePattern', { name: pattern.name })"
              @click="emit('delete', pattern.id)"
            />
          </li>
        </ul>
      </section>
    </div>
  </UCard>
</template>

<i18n lang="json">
{
  "en": {
    "sections": {
      "presets": "Built-in patterns",
      "saved": "Saved patterns"
    },
    "messages": {
      "empty": "Saved patterns will appear here."
    },
    "labels": {
      "regex": "Regex"
    },
    "actions": {
      "deletePattern": "Delete {name}"
    },
    "presets": {
      "wayback": "Wayback Machine",
      "steam": " Open with Steam App",
      "gyo-tc": "Open with gyo.tc",
      "remove-www": "Remove www",
      "mobile-to-desktop": "Desktop site",
      "remove-fragment": "Remove URL fragment"
    }
  },
  "ja": {
    "sections": {
      "presets": "組み込みパターン",
      "saved": "保存したパターン"
    },
    "messages": {
      "empty": "保存したパターンがここに表示されます。"
    },
    "labels": {
      "regex": "正規表現"
    },
    "actions": {
      "deletePattern": "{name}を削除"
    },
    "presets": {
      "wayback": "Wayback Machine",
      "steam": "Steamアプリで開く",
      "gyo-tc": "gyo.tcで開く",
      "remove-www": "wwwを除去",
      "mobile-to-desktop": "PC版URLに変換",
      "remove-fragment": "URLフラグメントを除去"
    }
  }
}
</i18n>
