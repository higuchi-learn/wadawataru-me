Neonを使いたいが, PostgreSQLについて何も知らないのでまずは公式ドキュメントを読むところから
[PostgreSQL 9.4.5文書](https://www.postgresql.jp/docs/9.4/index.html)

# DB設計
SQLiteからPostgreSQLになったので, データ型を考え直す.
前の設計
<img width="891" height="1004" alt="image" src="https://github.com/user-attachments/assets/5674336c-9b4a-4ca3-a792-769e070d2b33" />

## 変更点
- 全てのテーブルをblogsテーブルと同じデータ型に統一
	- 投稿一覧や記事作成画面, 関数の再利用性が無く, ファイルが増えすぎたため.
	- URL等はMDで書けば十分と判断
- 更に, テーブルを分けずに, postsテーブルとして列挙型で管理 
- tagを別のテーブルで管理
	- 検索機能を実装する際に, いちいちTagのJSONをmapして中身を読んでフィルタリングは処理が重すぎる.
	- React, reactのような重複したタグの登録を防ぐことができる.
## postsテーブル
### id
- UUIDを使うことには変わりはないが, 型を[UUID型](https://www.postgresql.jp/docs/9.4/datatype-uuid.html)へ
- 自動連番のintを使用しない理由 → 連番だと投稿数から内部のidが予測されるため, 使用を避けた.
### genre
- Blog, Product, BooksInsightを[列挙型](https://www.postgresql.jp/docs/9.4/datatype-enum.html)(blogs, products, books)で管理
### slug
- URLにUUIDを載せても特に問題は無いが, URLに長い文字列を出すのもカッコ悪いので, URL表示用の文字列を用意する.
- 長過ぎるURLになるのも見た目的に嫌なので, 20文字上限とした.
- 日本語を含むURLは共有のときに文字がエンコードされて共有しづらくなるため使用可能文字に制約を設ける.
### title
- ある程度長くても問題ないので, 勘で30文字上限にした.
### descrition
- タイトルの下に表示する, 記事の要約
- こちらも,勘で50文字上限にした.
### content
- マークダウンを平文で保存する.
- どれだけ書くか分からないので, TEXT型.
### thumbnail
- R2に保存したサムネイル用画像のURL. 長さが分からないのでTEXT型.
### status
- 公開, 下書, 削除を[列挙型](https://www.postgresql.jp/docs/9.4/datatype-enum.html)(draft, published, archived)で管理
### created_at
- [日付/時刻データ型](https://www.postgresql.jp/docs/9.4/datatype-datetime.html#DATATYPE-DATETIME-INPUT)の timestamp with time zone (別名: timestamptz) を使用. 企業ではタイムゾーン付きを使うことが多いようなので, そちらに合わせた.
- 記事が最初に保存された時間
### published_at
- 記事が最初に公開された時間
### updated_at
- 記事が最後に編集された時間
## tagsテーブル
### name
- Reactやサークルなど,タグの名前.10字制限でも長いと思うが, 一応20字にしておいた.
- 
### sort_order
- タグ検索をかけるとき, タグの表示順を変更するためのレコード
- 少ない整数しか無いはずなので, [数値データ型](https://www.postgresql.jp/docs/9.4/datatype-numeric.html#DATATYPE-INT)1-32767の範囲のsmallserialを採用
## post_tagsテーブル
- post_idとtag_idが多対多なので, 中間テーブルを導入する.
- [やさしい図解で学ぶ　中間テーブル　多対多　概念編 #Rails - Qiita](https://qiita.com/ramuneru/items/db43589551dd0c00fef9)
## DBML
```
Project portfolio_v2 {
  database_type: 'PostgreSQL'
  Note: 'portfolio-v2 website database'
}
  
Table posts {
  id uuid [pk, note: 'RFC 4122']
  genre articles_genre_enum [not null]
  slug varchar(20) [unique, not null]
  title varchar(30) [not null]
  description varchar(50) [not null]
  content text [not null]
  thumbnail text
  status articles_status_enum [not null]
  created_at timestamptz [not null]
  published_at timestamptz [not null]
  updated_at timestamptz [not null]
}
  
Enum articles_genre_enum {
  blogs
  products
  books
}
  
Enum articles_status_enum {
  draft
  published
  archived
}
  
Table tags {
  id uuid [pk, note: 'RFC 4122']
  name varchar(20) [unique, not null]
  sort_order smallserial [unique, not null, default: 0]
}
  
Table post_tags {
  post_id uuid [ref: > posts.id]
  tag_id uuid [ref: > tags.id]
  indexes {
    (post_id, tag_id) [pk]
  }
}
```

<img width="1099" height="780" alt="image" src="https://github.com/user-attachments/assets/073e1904-f86b-46c7-8c71-587ad9f5ec0a" />



# 環境構築
## ディレクトリ構成
featuresは採用しない. そんなに大規模なものではないから, 逆にごちゃごちゃしてわかりづらくなると感じた.
```
wadawataru-me
├─ .vscode
├─ documents
│  ├─ apis.txt
│  └─ rooting.txt
├─ drizzle
│  └─ migrations
│     └─ meta
├─ public
│  ├─ favicon.ico
│  └─ robots.txt
├─ src
│  ├─ aseets
│  │  ├─ dummy-image.webp
│  │  ├─ logo-long.webp
│  │  └─ logo.webp
│  ├─ app
│  │  ├─ experience
│  │  │  └─ page.tsx
│  │  ├─ posts
│  │  │  ├─ page.tsx
│  │  │  └─ [slug]
│  │  │     └─ page.tsx
│  │  └─ api
│  │     └─ [[...route]]
│  ├─ components
│  │  ├─ ui
│  │  │  └─ card
│  │  │     └─ index.tsx
│  │  └─ base
│  │     ├─ header
│  │     │  └─ index.tsx
│  │     ├─ footer
│  │     │  └─ index.tsx
│  │     └─ card
│  │        └─ index.tsx
│  ├─ db
│  │  └─ schema.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ not-found.tsx
│  └─ page.tsx
├─ types
│     ├─ cloudflare-env.d.ts
│     └─ worker-configuration.d.ts
├─ .gitignore
├─ .env.local
├─ README.md
├─ drizzle.config.ts
├─ eslint.config.mjs
├─ next.config.ts
├─ open-next.config.ts
├─ package.json
├─ pnpm-lock.yaml
├─ postcss.config.mjs
├─ tsconfig.json
└─ wrangler.jsonc
```
## プロジェクト作成
```
pnpm create cloudflare@latest wadawataru-me --framework=next
```
## Neonと接続
Neonでプロジェクト作成後,
```
npx wrangler secret put DATABASE_URL
```
Connection stringをペースト
```
pnpm add @neondatabase/serverless
```
`.env.local`を作成後, 以下を追加
```
DATABASE_URL=postgresql:さっきペーストしたやつ
```
Drizzleのインストール
```
pnpm add drizzle-orm
pnpm add -D drizzle-kit
pnpm add dotenv
```

# スキーマ定義
