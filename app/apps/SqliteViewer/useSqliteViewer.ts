/* eslint-disable @stylistic/max-statements-per-line */
import { computed, onUnmounted, reactive, shallowRef } from 'vue'

type SqlValue = string | number | null | Uint8Array
interface SqlResult { columns: string[], values: SqlValue[][] }
interface SqlDatabase { exec: (sql: string) => SqlResult[], run: (sql: string) => void, close: () => void }
interface SqlModule { Database: new (data?: Uint8Array) => SqlDatabase }
interface Column { name: string, type: string, pk: boolean }
interface Pragma { label: string, name: string, description: string, value: string }
interface SchemaItem { type: string, name: string, table: string, sql: string }

declare global { interface Window { initSqlJs?: (options: { locateFile: (file: string) => string }) => Promise<SqlModule> } }

const scriptUrl = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js'
const wasmUrl = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/'
const quote = (name: string) => `\`${name.replaceAll('`', '``')}\``
const stringify = (value: SqlValue) => value === null ? 'NULL' : value instanceof Uint8Array ? `[BLOB ${value.length} bytes]` : String(value)
const csv = (columns: string[], values: SqlValue[][]) => {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`
  return `\uFEFF${[columns, ...values.map(row => row.map(value => value === null ? '' : String(value)))].map(row => row.map(escape).join(',')).join('\n')}\n`
}

async function loadSqlJs(): Promise<SqlModule> {
  if (!window.initSqlJs) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = scriptUrl
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('script'))
      document.head.append(script)
    })
  }
  if (!window.initSqlJs) throw new Error('sql.js unavailable')
  return window.initSqlJs({ locateFile: file => `${wasmUrl}${file}` })
}

export function useSqliteViewer(options: { loader?: () => Promise<SqlModule> } = {}) {
  const database = shallowRef<SqlDatabase | null>(null)
  const engineReady = shallowRef(false)
  const loading = shallowRef(false)
  const loadingMessage = shallowRef<'engine' | 'file' | 'sample' | null>(null)
  const error = shallowRef<'engine' | 'file' | 'query' | 'emptyQuery' | null>(null)
  const activeTab = shallowRef<'data' | 'query' | 'info'>('data')
  const file = reactive({ name: '', size: 0 })
  const tables = shallowRef<string[]>([])
  const tableSearch = shallowRef('')
  const activeTable = shallowRef('')
  const columns = shallowRef<Column[]>([])
  const tableRows = shallowRef<Record<string, SqlValue>[]>([])
  const rowFilter = shallowRef('')
  const pageSize = shallowRef(50)
  const page = shallowRef(1)
  const sql = shallowRef('')
  const queryResult = shallowRef<SqlResult | null>(null)
  const queryElapsed = shallowRef<number | null>(null)
  const pragmas = shallowRef<Pragma[]>([])
  const schema = shallowRef<SchemaItem[]>([])
  const filteredTables = computed(() => tables.value.filter(table => table.toLowerCase().includes(tableSearch.value.toLowerCase())))
  const filteredRows = computed(() => !rowFilter.value.trim() ? tableRows.value : tableRows.value.filter(row => Object.values(row).some(value => value !== null && stringify(value).toLowerCase().includes(rowFilter.value.toLowerCase()))))
  const pageCount = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
  const pageRows = computed(() => filteredRows.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
  const displayedQueryRows = computed(() => queryResult.value?.values.slice(0, 1000) || [])

  const refreshMetadata = () => {
    const db = database.value
    if (!db) return
    try {
      const result = db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC`)
      tables.value = result[0]?.values.map(row => String(row[0])) || []
      const definitions: Array<[string, string, string]> = [
        ['journal_mode', 'Journal Mode', 'トランザクションログの管理方法。'],
        ['auto_vacuum', 'Auto Vacuum', '削除データ容量の再利用設定。'],
        ['cache_size', 'Cache Size', 'インメモリキャッシュのページ数。'],
        ['encoding', 'Encoding', 'データベーステキスト文字コード。'],
        ['foreign_keys', 'Foreign Keys', '外部キー制約の有効化状態。'],
        ['page_size', 'Page Size', 'データベースページのバイト単位サイズ。'],
        ['synchronous', 'Synchronous', 'ディスク書き込みの同期強度。'],
      ]
      pragmas.value = definitions.map(([name, label, description]) => {
        try { return { name, label, description, value: stringify(db.exec(`PRAGMA ${name}`)[0]?.values[0]?.[0] ?? null) } } catch { return { name, label, description, value: 'unknown' } }
      })
      const schemaResult = db.exec('SELECT type, name, tbl_name, sql FROM sqlite_master ORDER BY type, name')
      schema.value = (schemaResult[0]?.values || []).map(row => ({ type: String(row[0] || ''), name: String(row[1] || ''), table: String(row[2] || ''), sql: String(row[3] || '') }))
    } catch { error.value = 'file' }
  }
  const loadTable = (table: string) => {
    const db = database.value
    if (!db) return
    try {
      activeTable.value = table; rowFilter.value = ''; page.value = 1
      const info = db.exec(`PRAGMA table_info(${quote(table)})`)[0]
      columns.value = (info?.values || []).map(row => ({ name: String(row[1]), type: String(row[2] || ''), pk: row[5] === 1 }))
      const data = db.exec(`SELECT * FROM ${quote(table)}`)[0]
      tableRows.value = (data?.values || []).map(row => Object.fromEntries((data?.columns || []).map((column, index) => [column, row[index] ?? null])))
    } catch { error.value = 'file' }
  }
  const setDatabase = (db: SqlDatabase, name: string, size: number) => {
    database.value?.close()
    database.value = db; file.name = name; file.size = size; activeTable.value = ''; tableRows.value = []; columns.value = []; queryResult.value = null
    refreshMetadata()
  }
  const initialize = async () => {
    loading.value = true; loadingMessage.value = 'engine'
    try { engine.value = await (options.loader || loadSqlJs)(); engineReady.value = true } catch { error.value = 'engine' } finally { loading.value = false; loadingMessage.value = null }
  }
  const engine = shallowRef<SqlModule | null>(null)
  const loadFile = async (selected: File) => {
    if (!engine.value) return
    loading.value = true; loadingMessage.value = 'file'; error.value = null
    try { setDatabase(new engine.value.Database(new Uint8Array(await selected.arrayBuffer())), selected.name, selected.size) } catch { error.value = 'file' } finally { loading.value = false; loadingMessage.value = null }
  }
  const loadSample = () => {
    if (!engine.value) return
    loading.value = true; loadingMessage.value = 'sample'; error.value = null
    try {
      const db = new engine.value.Database()
      db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE, role TEXT DEFAULT 'User', status TEXT DEFAULT 'Active');
INSERT INTO users (name,email,role,status) VALUES ('佐藤 健二','sato@example.com','Admin','Active'),('鈴木 実','suzuki@example.com','User','Active'),('高橋 瞳','takahashi@example.com','User','Inactive');
CREATE TABLE products (product_id INTEGER PRIMARY KEY, product_name TEXT NOT NULL, category TEXT, price REAL, stock_quantity INTEGER);
INSERT INTO products (product_name,category,price,stock_quantity) VALUES ('ワイヤレスマウス','周辺機器',3200,120),('メカニカルキーボード','周辺機器',12800,45);
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, user_id INTEGER, product_id INTEGER, quantity INTEGER, order_date DATE);
INSERT INTO orders (user_id,product_id,quantity,order_date) VALUES (1,1,1,'2026-06-01'),(2,2,2,'2026-06-02');`)
      setDatabase(db, 'SampleInmemory.db', 45000)
    } catch { error.value = 'file' } finally { loading.value = false; loadingMessage.value = null }
  }
  const runQuery = () => {
    const db = database.value
    if (!db) { error.value = 'file'; return }
    if (!sql.value.trim()) { error.value = 'emptyQuery'; return }
    error.value = null
    try {
      const started = performance.now()
      const result = db.exec(sql.value)
      queryElapsed.value = Number((performance.now() - started).toFixed(2))
      queryResult.value = result[0] || { columns: [], values: [] }
      refreshMetadata()
    } catch { error.value = 'query'; queryResult.value = null }
  }
  const insertSnippet = (snippet: 'select' | 'count' | 'master') => {
    const table = activeTable.value || tables.value[0] || ''
    const value = snippet === 'master' ? 'sqlite_master' : `${snippet === 'select' ? 'SELECT * FROM' : 'SELECT COUNT(*) FROM'} ${table ? `${quote(table)} LIMIT 100;` : ''}`
    sql.value += value
  }
  const setPageSize = (size: number) => { pageSize.value = size; page.value = 1 }
  const downloadTableCsv = () => activeTable.value ? { filename: `${activeTable.value}_export.csv`, content: csv(columns.value.map(column => column.name), filteredRows.value.map(row => columns.value.map(column => row[column.name] ?? null))) } : null
  const downloadQueryCsv = () => queryResult.value ? { filename: 'query_results.csv', content: csv(queryResult.value.columns, queryResult.value.values) } : null
  const queryJson = () => queryResult.value ? JSON.stringify(queryResult.value.values.map(row => Object.fromEntries(queryResult.value!.columns.map((column, index) => [column, row[index]]))), null, 2) : ''
  onUnmounted(() => database.value?.close())
  return { engineReady, loading, loadingMessage, error, activeTab, file, tables, tableSearch, filteredTables, activeTable, columns, rowFilter, filteredRows, page, pageSize, pageCount, pageRows, sql, queryResult, queryElapsed, displayedQueryRows, pragmas, schema, initialize, loadFile, loadSample, loadTable, runQuery, insertSnippet, setPageSize, downloadTableCsv, downloadQueryCsv, queryJson }
}
