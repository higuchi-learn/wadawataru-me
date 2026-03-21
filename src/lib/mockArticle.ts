// TODO: replace with real DB fetch
export const MOCK_ARTICLE = {
  title: "Next.js + Cloudflare Workers でポートフォリオサイトを作った話",
  description:
    "Next.js と Cloudflare Workers を組み合わせてポートフォリオサイトを構築した過程で学んだことや詰まったポイントをまとめます。",
  tags: ["Next.js", "Cloudflare", "TypeScript", "React"],
  thumbnail: "",
  slug: "nextjs-cloudflare-portfolio",
  publishedAt: "2026年03月10日",
  updatedAt: "2026年03月15日",
  publishStatus: "published" as const,
  savedAt: "2026/03/15 | 21:01:47",
  content: `# はじめに

この記事では **Next.js** と *Cloudflare Workers* を使ったポートフォリオサイト構築について解説します。

![アーキテクチャ概要](https://picsum.photos/seed/cloudflare/800/400)

## 環境構成

### フレームワーク

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4

### インフラ

1. Cloudflare Workers（エッジランタイム）
2. Cloudflare D1（SQLiteベースのDB）
3. Cloudflare R2（オブジェクトストレージ）

---

## セットアップ手順

### プロジェクト作成

\`create-cloudflare\` CLI を使うと Next.js + Cloudflare の構成を一括で作れます。

\`\`\`bash
pnpm create cloudflare@latest my-app --framework=next
\`\`\`

### wrangler.toml の設定

\`\`\`toml
name = "my-portfolio"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "portfolio"
database_id = "xxxx-xxxx-xxxx"
\`\`\`

---

## D1 でのデータ取得

### 型定義

\`\`\`typescript
type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  published_at: string;
};
\`\`\`

### クエリ例

\`\`\`typescript
const { results } = await db
  .prepare("SELECT * FROM articles WHERE slug = ?")
  .bind(slug)
  .all<Article>();
\`\`\`

---

## 詰まったポイント

### \`next/image\` が動かない

> Cloudflare Workers 環境では Node.js の \`sharp\` が使えないため、\`next/image\` のデフォルト最適化が動作しません。

対処法として \`unoptimized\` フラグを設定します。

\`\`\`javascript
// next.config.js
module.exports = {
  images: { unoptimized: true },
};
\`\`\`

### CSS が本番環境で崩れる

Tailwind v4 は \`@import "tailwindcss"\` の一行で動きますが、Cloudflare へのデプロイ時に PostCSS の設定が必要でした。

---

## Markdown テスト

本文中に \`インラインコード\` を含めることができます。

**太字テキスト** と *斜体テキスト* と ~~打ち消し線~~ も使えます。

リンク: [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)

### ネストリスト

- フロントエンド
  - Next.js
  - Tailwind CSS
- バックエンド
  - Hono
  - Cloudflare D1

### テーブル

| 項目 | 値 | 備考 |
|---|---|---|
| ランタイム | Cloudflare Workers | エッジ実行 |
| DB | Cloudflare D1 | SQLite互換 |
| ストレージ | Cloudflare R2 | S3互換 |

---

## まとめ

- Cloudflare Workers は**コールドスタートがなく**高速
- D1 は SQLite ベースで**馴染みやすい**
- \`create-cloudflare\` CLI で**素早くセットアップ**できる

#### 補足情報

h4 はやや小さめの見出しとして使用します。
`,
};
