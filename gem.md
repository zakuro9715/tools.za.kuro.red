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

### OGP画像

#### 埋め込み

OGPを追加する指示があった場合は、各SNSに対応できるように作成する。イメージのURLは指定されたものを使用
