<script setup lang="ts">
import { onMounted, reactive, useTemplateRef } from 'vue'

const { t } = useI18n()
const viewer = reactive(useSqliteViewer())
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const tabItems = computed(() => [
  { label: t('tabs.data'), value: 'data' as const, slot: 'data' },
  { label: t('tabs.query'), value: 'query' as const, slot: 'query' },
  { label: t('tabs.info'), value: 'info' as const, slot: 'info' },
])
const pageItems = computed(() => [20, 50, 100, 500].map(value => ({ label: t('labels.rowsPerPage', { count: value }), value })))
const errorText = computed(() => viewer.error ? t(`errors.${viewer.error}`) : '')
const loadingText = computed(() => viewer.loadingMessage ? t(`loading.${viewer.loadingMessage}`) : '')
const upload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) await viewer.loadFile(file)
}
const download = (file: { filename: string, content: string } | null) => {
  if (!file) return
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([file.content], { type: 'text/csv;charset=utf-8' }))
  link.download = file.filename
  link.click()
  URL.revokeObjectURL(link.href)
}
const copyJson = async () => {
  await navigator.clipboard.writeText(viewer.queryJson())
}
const submitQuery = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    viewer.runQuery()
  }
}
const displayValue = (value: unknown) => value instanceof Uint8Array ? `[BLOB ${value.length} bytes]` : value === null ? 'NULL' : String(value)
onMounted(viewer.initialize)
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex flex-wrap items-center gap-3">
        <UButton
          data-testid="sqlite-upload"
          icon="i-lucide-upload"
          :label="t('actions.open')"
          :disabled="!viewer.engineReady"
          @click="fileInput?.click()"
        />
        <UButton
          data-testid="sqlite-sample"
          icon="i-lucide-database"
          color="neutral"
          variant="outline"
          :label="t('actions.sample')"
          :disabled="!viewer.engineReady"
          @click="viewer.loadSample"
        />
        <input
          ref="fileInput"
          data-testid="sqlite-file"
          class="hidden"
          type="file"
          accept=".db,.sqlite,.sqlite3,.sqlite3-shm,.sqlite3-wal"
          @change="upload"
        >
        <span
          data-testid="sqlite-filename"
          class="text-sm text-muted"
        >{{ viewer.file.name || t('status.noDatabase') }}</span>
      </div>
      <UAlert
        v-if="loadingText"
        class="mt-3"
        color="info"
        :title="loadingText"
      />
      <UAlert
        v-if="errorText"
        class="mt-3"
        color="error"
        :title="errorText"
      />
    </UCard>
    <UTabs
      v-model="viewer.activeTab"
      :items="tabItems"
      variant="link"
    >
      <template #data>
        <div class="mt-4 grid gap-4 lg:grid-cols-4">
          <UCard
            class="lg:col-span-1"
            :title="t('sections.tables')"
          >
            <UInput
              v-model="viewer.tableSearch"
              data-testid="sqlite-table-search"
              icon="i-lucide-search"
              :placeholder="t('placeholders.table')"
            />
            <p
              v-if="!viewer.filteredTables.length"
              class="py-6 text-center text-sm text-muted"
            >
              {{ t('empty.tables') }}
            </p>
            <div class="mt-3 space-y-1">
              <UButton
                v-for="table in viewer.filteredTables"
                :key="table"
                data-testid="sqlite-table"
                block
                class="justify-between"
                :label="table"
                :color="viewer.activeTable === table ? 'primary' : 'neutral'"
                :variant="viewer.activeTable === table ? 'soft' : 'ghost'"
                @click="viewer.loadTable(table)"
              />
            </div>
          </UCard>
          <UCard class="overflow-hidden lg:col-span-3">
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-2">
                <strong>{{ viewer.activeTable || t('status.selectTable') }}</strong><div class="flex gap-2">
                  <UInput
                    v-model="viewer.rowFilter"
                    data-testid="sqlite-row-filter"
                    :placeholder="t('placeholders.rows')"
                    :disabled="!viewer.activeTable"
                  /><USelect
                    :model-value="viewer.pageSize"
                    :items="pageItems"
                    :disabled="!viewer.activeTable"
                    @update:model-value="viewer.setPageSize(Number($event))"
                  /><UButton
                    data-testid="sqlite-export-table"
                    size="sm"
                    icon="i-lucide-download"
                    color="neutral"
                    variant="outline"
                    :disabled="!viewer.activeTable"
                    :label="t('actions.csv')"
                    @click="download(viewer.downloadTableCsv())"
                  />
                </div>
              </div>
            </template>
            <div class="overflow-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-default">
                    <th class="p-2">
                      #
                    </th><th
                      v-for="column in viewer.columns"
                      :key="column.name"
                      class="p-2 font-mono"
                    >
                      {{ column.name }} <UBadge
                        v-if="column.pk"
                        label="PK"
                        size="xs"
                        color="warning"
                        variant="subtle"
                      /><small
                        v-if="column.type"
                        class="text-muted"
                      >({{ column.type }})</small>
                    </th>
                  </tr>
                </thead><tbody>
                  <tr v-if="!viewer.activeTable">
                    <td
                      :colspan="100"
                      class="p-16 text-center text-muted"
                    >
                      {{ t('empty.data') }}
                    </td>
                  </tr><tr v-else-if="!viewer.pageRows.length">
                    <td
                      :colspan="viewer.columns.length + 1"
                      class="p-16 text-center text-muted"
                    >
                      {{ t('empty.rows') }}
                    </td>
                  </tr><tr
                    v-for="(row, index) in viewer.pageRows"
                    :key="index"
                    class="border-b border-default"
                  >
                    <td class="p-2 text-muted">
                      {{ (viewer.page - 1) * viewer.pageSize + index + 1 }}
                    </td><td
                      v-for="column in viewer.columns"
                      :key="column.name"
                      class="max-w-xs truncate p-2 font-mono"
                      :title="String(row[column.name])"
                    >
                      {{ displayValue(row[column.name]) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <template #footer>
              <div class="flex items-center justify-end gap-2">
                <span class="text-sm text-muted">{{ viewer.page }} / {{ viewer.pageCount }} ({{ viewer.filteredRows.length }})</span><UButton
                  size="xs"
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-chevron-left"
                  :disabled="viewer.page === 1"
                  :aria-label="t('actions.previous')"
                  @click="viewer.page--"
                /><UButton
                  size="xs"
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-chevron-right"
                  :disabled="viewer.page === viewer.pageCount"
                  :aria-label="t('actions.next')"
                  @click="viewer.page++"
                />
              </div>
            </template>
          </UCard>
        </div>
      </template>
      <template #query>
        <div class="mt-4 space-y-4">
          <UCard :title="t('sections.query')">
            <template #header>
              <div class="flex flex-wrap justify-between gap-2">
                <span>{{ t('sections.query') }}</span><div class="flex gap-1">
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="outline"
                    label="SELECT *"
                    @click="viewer.insertSnippet('select')"
                  /><UButton
                    size="xs"
                    color="neutral"
                    variant="outline"
                    label="COUNT(*)"
                    @click="viewer.insertSnippet('count')"
                  /><UButton
                    size="xs"
                    color="neutral"
                    variant="outline"
                    :label="t('actions.tables')"
                    @click="viewer.insertSnippet('master')"
                  />
                </div>
              </div>
            </template>
            <UTextarea
              v-model="viewer.sql"
              data-testid="sqlite-sql"
              :rows="6"
              :disabled="!viewer.file.name"
              :placeholder="t('placeholders.sql')"
              :ui="{ base: 'font-mono' }"
              @keydown="submitQuery"
            />
            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton
                  color="neutral"
                  variant="outline"
                  :label="t('actions.clear')"
                  @click="viewer.sql = ''"
                /><UButton
                  data-testid="sqlite-run"
                  icon="i-lucide-play"
                  :label="t('actions.run')"
                  :disabled="!viewer.file.name"
                  @click="viewer.runQuery"
                />
              </div>
            </template>
          </UCard>
          <UCard :title="t('sections.results')">
            <template #header>
              <div class="flex justify-between">
                <span>{{ t('sections.results') }}</span><div
                  v-if="viewer.queryResult?.columns.length"
                  class="flex gap-2"
                >
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-copy"
                    :label="t('actions.copyJson')"
                    @click="copyJson"
                  /><UButton
                    size="xs"
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-download"
                    :label="t('actions.csv')"
                    @click="download(viewer.downloadQueryCsv())"
                  />
                </div>
              </div>
            </template>
            <p
              v-if="!viewer.queryResult"
              class="py-10 text-center text-sm text-muted"
            >
              {{ t('empty.query') }}
            </p>
            <p
              v-else-if="!viewer.queryResult.columns.length"
              class="py-10 text-center text-sm text-success"
            >
              {{ t('status.queryDone', { elapsed: viewer.queryElapsed }) }}
            </p>
            <div
              v-else
              class="overflow-auto"
            >
              <p class="mb-2 text-sm text-muted">
                {{ t('status.rows', { count: viewer.queryResult.values.length, elapsed: viewer.queryElapsed }) }}
              </p><table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-default">
                    <th class="p-2">
                      #
                    </th><th
                      v-for="column in viewer.queryResult.columns"
                      :key="column"
                      class="p-2 font-mono"
                    >
                      {{ column }}
                    </th>
                  </tr>
                </thead><tbody>
                  <tr
                    v-for="(row, index) in viewer.displayedQueryRows"
                    :key="index"
                    class="border-b border-default"
                  >
                    <td class="p-2 text-muted">
                      {{ index + 1 }}
                    </td><td
                      v-for="(value, columnIndex) in row"
                      :key="columnIndex"
                      class="max-w-xs truncate p-2 font-mono"
                    >
                      {{ displayValue(value) }}
                    </td>
                  </tr>
                </tbody>
              </table><p
                v-if="viewer.queryResult.values.length > 1000"
                class="p-3 text-center text-sm text-muted"
              >
                {{ t('status.limited', { count: viewer.queryResult.values.length }) }}
              </p>
            </div>
          </UCard>
        </div>
      </template>
      <template #info>
        <div class="mt-4 space-y-4">
          <UCard :title="t('sections.info')">
            <dl class="grid gap-3 sm:grid-cols-3">
              <div>
                <dt class="text-muted">
                  {{ t('labels.filename') }}
                </dt><dd>{{ viewer.file.name || '--' }}</dd>
              </div><div>
                <dt class="text-muted">
                  {{ t('labels.size') }}
                </dt><dd>{{ viewer.file.size ? `${Math.round(viewer.file.size / 1024)} KB` : '--' }}</dd>
              </div><div>
                <dt class="text-muted">
                  {{ t('labels.tableCount') }}
                </dt><dd>{{ viewer.tables.length }}</dd>
              </div>
            </dl>
          </UCard><UCard :title="t('sections.pragmas')">
            <table class="w-full text-left text-sm">
              <tbody>
                <tr
                  v-for="pragma in viewer.pragmas"
                  :key="pragma.name"
                  class="border-b border-default"
                >
                  <td class="p-2 font-medium">
                    {{ pragma.label }} <small class="font-mono text-muted">({{ pragma.name }})</small>
                  </td><td class="p-2 font-mono">
                    {{ pragma.value }}
                  </td><td class="p-2 text-muted">
                    {{ pragma.description }}
                  </td>
                </tr>
              </tbody>
            </table>
          </UCard><UCard :title="t('sections.schema')">
            <div class="overflow-auto">
              <table class="w-full text-left text-xs">
                <thead><tr><th>Type</th><th>Name</th><th>Table</th><th>SQL</th></tr></thead><tbody>
                  <tr
                    v-for="item in viewer.schema"
                    :key="`${item.type}-${item.name}`"
                    class="border-t border-default"
                  >
                    <td class="p-2">
                      {{ item.type }}
                    </td><td class="p-2">
                      {{ item.name }}
                    </td><td class="p-2">
                      {{ item.table }}
                    </td><td
                      class="max-w-md truncate p-2 font-mono"
                      :title="item.sql"
                    >
                      {{ item.sql || 'N/A' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<i18n lang="json">
{
  "en": { "actions": { "open": "Open database", "sample": "Load sample", "csv": "Export CSV", "previous": "Previous page", "next": "Next page", "tables": "Tables", "clear": "Clear", "run": "Run query", "copyJson": "Copy JSON" }, "tabs": { "data": "Data", "query": "SQL query", "info": "Database info" }, "sections": { "tables": "Tables", "query": "SQL query editor", "results": "Results", "info": "Database basics", "pragmas": "System PRAGMA settings", "schema": "Schema metadata" }, "labels": { "rowsPerPage": "{count} rows", "filename": "File name", "size": "File size", "tableCount": "Tables" }, "placeholders": { "table": "Search tables...", "rows": "Filter displayed rows...", "sql": "Example: SELECT * FROM users WHERE active = 1 LIMIT 50;" }, "loading": { "engine": "Loading the WebAssembly SQLite engine...", "file": "Loading database file...", "sample": "Creating sample database..." }, "errors": { "engine": "Could not initialize SQLite. Reload and try again.", "file": "Could not load the database file.", "query": "The SQL query failed.", "emptyQuery": "Enter a SQL query." }, "status": { "noDatabase": "No database loaded", "selectTable": "Select a table", "queryDone": "Query completed in {elapsed} ms with no returned rows.", "rows": "{count} rows ({elapsed} ms)", "limited": "Only the first 1000 rows are displayed (of {count})." }, "empty": { "tables": "No tables found.", "data": "Select a table to display data.", "rows": "No matching rows.", "query": "Run a query to display results." } },
  "ja": { "actions": { "open": "データベースを開く", "sample": "サンプルを読み込む", "csv": "CSV出力", "previous": "前のページ", "next": "次のページ", "tables": "テーブル一覧", "clear": "クリア", "run": "クエリを実行", "copyJson": "JSONをコピー" }, "tabs": { "data": "データ", "query": "SQLクエリ", "info": "データベース情報" }, "sections": { "tables": "テーブル", "query": "SQLクエリエディタ", "results": "実行結果", "info": "データベース基本特性", "pragmas": "システム PRAGMA 設定", "schema": "スキーマメタデータ" }, "labels": { "rowsPerPage": "{count}件", "filename": "ファイル名", "size": "ファイルサイズ", "tableCount": "総テーブル数" }, "placeholders": { "table": "テーブルを検索...", "rows": "表示データを検索...", "sql": "例: SELECT * FROM users WHERE active = 1 LIMIT 50;" }, "loading": { "engine": "WebAssembly SQLiteエンジンを読み込み中...", "file": "データベースファイルを読み込み中...", "sample": "サンプルデータベースを作成中..." }, "errors": { "engine": "SQLiteエンジンの初期化に失敗しました。再読み込みしてください。", "file": "データベースファイルを読み込めませんでした。", "query": "SQLクエリの実行に失敗しました。", "emptyQuery": "SQLクエリを入力してください。" }, "status": { "noDatabase": "データベース未読込", "selectTable": "テーブルを選択してください", "queryDone": "{elapsed} ms でクエリが完了しました。返却データはありません。", "rows": "全 {count} 件 ({elapsed} ms)", "limited": "先頭1000件のみ表示しています（全{count}件）。" }, "empty": { "tables": "テーブルが見つかりません。", "data": "表示するデータがありません。テーブルを選択してください。", "rows": "該当するデータが見つかりません。", "query": "クエリを実行すると、結果がここに表示されます。" } }
}
</i18n>
