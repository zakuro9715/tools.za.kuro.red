type Lang = 'en' | 'ja'
type AppMeta = { title: string, description: string }
type AppMessages = { [key: string]: { [key in Lang]: AppMeta } }
const apps: AppMessages = {
  'notepad': {
    en: {
      title: 'Notepad',
      description: 'A simple notepad app that saves notes in your browser.',
    },
    ja: {
      title: 'メモ帳',
      description: 'ブラウザにメモを保存できるシンプルなメモ帳アプリです。',
    },
  },
  'text-counter': {
    en: {
      title: 'Text counter',
      description: 'A simple tool that counts characters, lines, manuscript pages, book pages, and estimated reading time in real time.',
    },
    ja: {
      title: 'テキストカウンター',
      description: 'テキストの文字数、行数、原稿用紙換算枚数、文庫本ページ数、読了時間などをリアルタイムで計測するシンプルなテキストカウンターツールです。',
    },
  },
  'text-checker': {
    en: {
      title: 'Text checker',
      description: 'Proofread Japanese writing with the Gemini API.',
    },
    ja: {
      title: '文章チェッカー',
      description: 'Gemini APIを使って日本語文章を校正するツールです。',
    },
  },
  'password-generator': {
    en: {
      title: 'Password generator',
      description: 'Generate secure, customizable passwords.',
    },
    ja: {
      title: 'パスワード生成器',
      description: '安全でカスタマイズ可能なパスワード生成ツールです。',
    },
  },
  'audio-video': {
    en: {
      title: 'Audio waveform video generator',
      description: 'Create a waveform video from an audio file directly in your browser.',
    },
    ja: {
      title: '音声波形動画ジェネレーター',
      description: '音声ファイルから波形動画をブラウザ内で作成できます。',
    },
  },
  'sqlite-viewer': {
    en: {
      title: 'SQLite viewer',
      description: 'Open SQLite databases, browse tables, run SQL queries, and export results locally.',
    },
    ja: {
      title: 'SQLite ビューア',
      description: 'SQLiteデータベースをブラウザで開き、テーブル表示、SQL実行、結果出力ができるツールです。',
    },
  },
  'reshade-preset-viewer': {
    en: {
      title: 'ReShade preset viewer',
      description: 'View, edit, and export ReShade INI presets in your browser.',
    },
    ja: {
      title: 'ReShade プリセットビューア',
      description: 'ReShadeのINIプリセットをブラウザで表示、編集、出力できるツールです。',
    },
  },
  'image-compare': {
    en: {
      title: 'Image comparison slider',
      description: 'Compare two images in your browser with an interactive slider.',
    },
    ja: {
      title: '画像比較スライダー',
      description: '2枚の画像をインタラクティブなスライダーでブラウザ内比較できます。',
    },
  },
  'image-resize': {
    en: {
      title: 'Image resizer',
      description: 'Resize images in your browser, then download SVG, PNG, JPEG, or WebP files.',
    },
    ja: {
      title: '画像リサイズ',
      description: '画像をブラウザ内でリサイズし、SVG、PNG、JPEG、WebP としてダウンロードできます。',
    },
  },
  'midi-to-audio': {
    en: {
      title: 'MIDI to audio',
      description: 'Convert MIDI files to WAV in your browser with the GeneralUser GS sound font.',
    },
    ja: {
      title: 'MIDI音声変換',
      description: 'MIDIファイルを GeneralUser GS 音源でブラウザ内で WAV に変換できます。',
    },
  },
  'walking-calc': {
    en: {
      title: 'Walking calculator',
      description: 'Convert walking speed and pace, or calculate distance, pace, and time.',
    },
    ja: {
      title: 'ウォーキング計算機',
      description: '歩行速度とペースの変換、距離・ペース・時間の計算ができるツールです。',
    },
  },
  'network-info-checker': {
    en: {
      title: 'Network information checker',
      description: 'Check your public IP address, connection information, ping, and browser environment.',
    },
    ja: {
      title: 'ネットワーク情報チェッカー',
      description: 'パブリックIP、回線情報、Ping、ブラウザ環境を確認できるツールです。',
    },
  },
  'replace-url': {
    en: {
      title: 'Replace URL',
      description: 'Replace parts of a URL with text or regular expressions, and save reusable patterns.',
    },
    ja: {
      title: 'URL置換',
      description: 'URLの一部をテキストや正規表現で置換し、よく使うパターンを保存できます。',
    },
  },
  'markdown-formatter': {
    en: {
      title: 'Markdown formatter',
      description: 'Format Markdown text: normalize indents, lists and headings, renumber ordered lists, and convert URLs to links or images.',
    },
    ja: {
      title: 'Markdownフォーマッター',
      description: 'Markdownのインデント、リスト、見出しを整え、番号付きリストの振り直しやURLのリンク・画像化ができます。',
    },
  },
} as const

const home = {
  en: {
    title: 'Home',
    description: 'A collection of tools by zakuro.',
  },
  ja: {
    title: 'Home',
    description: 'zakuro のツール集。',
  },
}

const p = (m: AppMessages, lang: Lang) =>
  Object.fromEntries(Object.entries(m).map(([key, value]) => [key, value[lang]]))

const build = (lang: Lang) => ({
  apps: p(apps, lang),
  home: home[lang],
})

export const messages = {
  en: build('en'),
  ja: build('ja'),
}
