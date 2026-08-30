<script setup lang="ts">
const {
  memos,
  currentId,
  currentContent,
  statusMessage,
  createNewMemo,
  selectMemo,
  saveMemo,
  deleteMemo,
  clearCurrentContent,
  clearAllMemos,
  formatMemoDate
} = useNotepad()

const isListOpen = ref(true)
const isClearAllConfirmationOpen = ref(false)

const confirmClearAll = async () => {
  await clearAllMemos()
  isClearAllConfirmationOpen.value = false
}
</script>

<template>
  <UCard
    class="min-h-[36rem]"
    :ui="{ body: 'flex min-h-[36rem] flex-col gap-0 p-0 sm:p-0' }"
  >
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-file-plus-2"
            label="新規作成"
            @click="createNewMemo"
          />
          <UButton
            icon="i-lucide-save"
            label="保存"
            color="neutral"
            variant="outline"
            @click="saveMemo"
          />
          <span
            v-if="statusMessage"
            class="text-sm text-muted"
            role="status"
          >
            {{ statusMessage }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-list"
            :label="`一覧 (${memos.length})`"
            color="neutral"
            variant="outline"
            @click="isListOpen = !isListOpen"
          />
          <UButton
            v-if="memos.length"
            icon="i-lucide-trash-2"
            label="全削除"
            color="error"
            variant="outline"
            @click="isClearAllConfirmationOpen = true"
          />
        </div>
      </div>
    </template>

    <UAlert
      v-if="isClearAllConfirmationOpen"
      class="mx-4 mt-4"
      color="error"
      icon="i-lucide-triangle-alert"
      title="すべてのメモを削除しますか？"
    >
      <template #actions>
        <UButton
          label="キャンセル"
          color="neutral"
          variant="outline"
          @click="isClearAllConfirmationOpen = false"
        />
        <UButton
          label="すべて削除"
          color="error"
          @click="confirmClearAll"
        />
      </template>
    </UAlert>

    <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
      <main class="relative flex min-h-96 flex-1 flex-col">
        <UButton
          v-if="currentContent"
          class="absolute top-3 right-3 z-10"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          aria-label="テキストをクリア"
          @click="clearCurrentContent"
        />
        <UTextarea
          v-model="currentContent"
          class="flex min-h-0 flex-1"
          placeholder="ここにメモを入力..."
          :ui="{
            root: 'h-full',
            base: 'h-full min-h-0 resize-none bg-transparent p-4 pr-12 font-mono leading-relaxed'
          }"
        />
      </main>

      <aside
        v-if="isListOpen"
        class="flex w-full flex-col border-t border-default lg:w-80 lg:border-t-0 lg:border-l"
        aria-label="保存済みメモ"
      >
        <div class="flex items-center justify-between border-b border-default px-4 py-3">
          <span class="text-sm font-medium">保存済みメモ</span>
          <UButton
            class="lg:hidden"
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            aria-label="メモ一覧を閉じる"
            @click="isListOpen = false"
          />
        </div>

        <div
          v-if="memos.length === 0"
          class="p-4 text-center text-sm text-muted"
        >
          保存されたメモはありません
        </div>

        <div
          v-else
          class="divide-y divide-default"
        >
          <div
            v-for="memo in memos"
            :key="memo.id"
            class="flex items-start gap-2 px-4 py-3"
            :class="{ 'bg-elevated': currentId === memo.id }"
          >
            <button
              type="button"
              class="min-w-0 flex-1 text-left"
              @click="selectMemo(memo.id)"
            >
              <span class="block truncate text-sm font-medium">{{ memo.title }}</span>
              <span class="mt-1 block text-xs text-muted">{{ formatMemoDate(memo.updatedAt) }}</span>
            </button>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              aria-label="メモを削除"
              @click.stop="deleteMemo(memo.id)"
            />
          </div>
        </div>
      </aside>
    </div>
  </UCard>
</template>
