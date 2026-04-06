# Project: wadawataru-me

個人ポートフォリオ兼ブログサイト。

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Cloudflare Workers via `@opennextjs/cloudflare`
- **DB**: Neon (PostgreSQL) + Drizzle ORM
- **Storage**: Cloudflare R2（画像）
- **Auth**: Auth.js v5 beta（GitHub OAuth）
- **Validation**: Zod v4
- **Styling**: Tailwind CSS v4
- **Markdown Editor**: react-simplemde-editor（EasyMDE）
- **Package Manager**: pnpm

## 開発コマンド

```bash
pnpm preview   # ローカル開発（Cloudflare Workers, port 8787）
pnpm run deploy    # 本番デプロイ
```

**`pnpm dev` は使わない。** 必ず `pnpm preview` を使うこと。

## 環境変数

- ローカル: `.dev.vars`（`.env.local` ではない）
- 本番: `wrangler secret put <KEY>`

## 主要ファイル

| ファイル | 役割 |
|---|---|
| `src/components/BlogEditor.tsx` | 記事作成・編集エディタ（メインコンポーネント）|
| `src/app/admin/actions.ts` | Server Actions（保存・公開・アーカイブ・画像アップロード）|
| `src/lib/schemas.ts` | Zod バリデーションスキーマ |
| `src/auth.ts` | Auth.js 設定（GitHub OAuth）|
| `src/middleware.ts` | 認証ミドルウェア（`/admin/**`, `/api/upload` を保護）|
| `src/app/api/upload/route.ts` | 画像アップロード API（R2）|
| `src/app/api/images/[key]/route.ts` | 画像配信 API（R2）|
| `src/db/queries/select.ts` | DB 参照クエリ |
| `src/app/globals.css` | グローバルスタイル（CSS変数含む）|
| `wrangler.jsonc` | Cloudflare Workers 設定 |

## 認証

- GitHub OAuth で `higuchi-learn` アカウントのみ許可
- 未認証アクセスは `/login` にリダイレクト

## 主要な制約・注意点

- CSS import（`easymde/dist/easymde.min.css`）は `src/global.d.ts` で型宣言済み
- 画像アップロードのキーは `{timestamp}-{6文字ランダム}.{ext}` 形式（日本語ファイル名不可）
- バリデーションエラーはフィールド別にインライン表示（Zod + BlogEditor の `fieldErrors` state）
- エラーメッセージは `この要素は必須です。` / `文字数が超過しています。最大文字数は〇〇字です。` / `使用できない文字が含まれています。`
- slug は英数字・ハイフン・アンダースコアのみ許可（`/^[a-zA-Z0-9_-]+$/`）
- `Genre` 型は `'blogs' | 'products' | 'books'`（DB の enum と統一。`'blog'` ではない）
- ブログの URL は `/blogs/`、管理画面は `/admin/blogs/`
