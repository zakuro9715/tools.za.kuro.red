単独で表示できるHTMLを作成する

- Reactやjsx, TypeScript は使用しない
- 指示しない限りAIサービスは使用しない
- cdn 経由ならVueなどのライブラリを使用してもよい

## Design
- シンプルなデザインにする
- グラデーションは使わない
- 装飾を少なくする
- DarkMode に対応。初期テーマはブラウザのダークモードの状態を尊重する
- 説明テキストは少なく

## 共通構造

### URL
- XのURL: "https://x.com/zakuro9715"
- GitHubのURL: "https://github.com/zakuro9715/tools.za.kuro.red"
- ホームURL: "/"
- Author: zakuro

### Header
#### Left 
-「"ホームアイコン"  Tools」。 ホームへのリンクを設定。
- そのあと "|" で区切って 「アプリの名前」 というタイトル
#### Right
-Xへのリンクアイコン
- GitHub へのリンクアイコン

# Footer

中央に copyright 表示。テンプレート: `&copy; <year> zakuro. All rights reserved.`

内容を更新した場合、Copyrightの<year>も更新する。2025のファイルを2026年になってから編集した場合は、`2026-2026` と変更する 

### メタタグとOGP

以下のテンプレートを参考にして、メタタグを埋め込む。

このテンプレートは、「Hello App」というサンプルの場合を表す

- title はそのまま埋める
- url は単語を小文字にしてハイフンで繋ぐ
- ogp 画像は空白を削除する以外はタイトルそのままのファイル名

```
<link rel="shortcut icon" href="/favicon.ico">
<meta name="description" content="Sample app">
<meta property="og:title" content="Hello App">
<meta property="og:type" content="website">
<meta property="og:url" content="https://tools.za.kuro.red/hello-app.html">
<meta property="og:image" content="https://tools.za.kuro.red/og-images/HelloApp.png">
<meta property="og:site_name" content="tools.za.kuro.red">
<meta property="og:description" content="Sample app">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:title" content="Hello App">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@zakuro9715">
<meta name="twitter:url" content="https://tools.za.kuro.red/hello-app.html">
<meta name="twitter:image" content="https://tools.za.kuro.red/og-images/HelloApp.png">
<meta name="twitter:description" content="Sample app">
```
