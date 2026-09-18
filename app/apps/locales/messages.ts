type Lang = 'en' | 'ja'
type AppMeta = { title: string, description: string }
const data: { [key: string]: { [key in Lang]: AppMeta } } = {
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
      description: 'Resize images in your browser and download them as PNG, JPEG, or WebP.',
    },
    ja: {
      title: '画像リサイズ',
      description: '画像をブラウザ内でリサイズし、PNG、JPEG、WebP としてダウンロードできます。',
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
} as const

export const messages = {
  en: { apps: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.en])) },
  ja: { apps: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.ja])) },
}
