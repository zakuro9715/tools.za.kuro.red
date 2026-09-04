type Lang = 'en' | 'ja'
type AppMeta = { title: string, description: string }
const data: { apps: { [key: string]: { [key in Lang]: AppMeta } } } = {
  apps: {
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
  },
} as const

type Key = keyof typeof data.apps
export const messages = Object.entries(data.apps).map(([key, value]) => ({
  en: { apps: { [key as Key]: value.en } },
  ja: { apps: { [key as Key]: value.ja } },
}))[0]!
