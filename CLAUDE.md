# Project: wadawataru-me

個人ポートフォリオ兼ブログサイト。

## Tech Stack

- **Framework**: Next.js 16.3 (App Router)
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
pnpm lint      # ESLint（src 配下。整形ルール Prettier も含む）
pnpm lint:fix  # 自動修正できる lint エラー・整形を直す
```

**`pnpm dev` は使わない。** 必ず `pnpm preview` を使うこと。

## 環境変数

- ローカル: `.dev.vars`（`.env.local` ではない）
- 本番: `wrangler secret put <KEY>`

## 主要ファイル

| ファイル | 役割 |
|---|---|
| `src/components/BlogEditor.tsx` | 記事作成・編集エディタ（メインコンポーネント）|
| `src/app/admin/actions.ts` | 記事の Server Actions（下書き保存・公開・アーカイブ）|
| `src/lib/schemas.ts` | Zod バリデーションスキーマ |
| `src/auth.ts` | Auth.js 設定（GitHub OAuth）|
| `src/middleware.ts` | 認証ミドルウェア（`/admin/**`, `/api/upload` を保護）。`/api/upload` はルート内でも `isAuthenticated()` で確認する（多層防御）|
| `src/app/api/upload/route.ts` | 画像アップロード API（R2）。形式は `src/lib/imageType.ts` でファイルの中身から判定 |
| `src/app/api/images/[key]/route.ts` | 画像配信 API（R2）。nosniff・CSP sandbox・1年キャッシュのヘッダーを付ける |
| `src/lib/imageType.ts` | マジックナンバーによる画像形式判定（PNG / JPEG / GIF / WebP / SVG の許可リスト）|
| `src/lib/uploadImage.ts` | クライアント側のアップロード関数と、EasyMDE への貼り付け・ドロップのアップロード処理。送信前に `convertToWebp` を通す |
| `src/lib/convertToWebp.ts` | アップロード前にブラウザで WebP（長い辺 1920px・比率維持・品質 0.85）へ変換する。SVG・GIF・WebP は変換しない |
| `scripts/migrate-github-images.mjs` | GitHub 上の画像を WebP にして R2 へ移すスクリプト（既定は下見のみ、`--apply` で実行。バックアップは `backups/`）|
| `src/app/api/og/route.tsx` | サムネイル未設定記事の OG 画像を自動生成（`next/og`）|
| `src/lib/generatePostMetadata.ts` | 記事ページの metadata（OGP）生成 |
| `src/app/admin/tag-actions.ts` | タグの Server Actions（作成・編集・削除・ジャンル追加/除外・並べ替え）|
| `src/components/TagManagementPage.tsx` | タグ管理画面（`/admin/tags`）。dnd-kit で並べ替え |
| `src/components/TagSelectOverlay.tsx` | 記事エディタ内のタグ選択・新規作成オーバーレイ |
| `src/app/admin/diary-actions.ts` | 日記の Server Action（保存）|
| `src/components/DiaryEditor.tsx` / `DiaryBook.tsx` | 日記の編集（`/admin/diary/[date]`）と本のような表示 |
| `src/db/queries/select.ts` | DB 参照クエリ |
| `src/app/globals.css` | グローバルスタイル（CSS変数含む）|
| `wrangler.jsonc` | Cloudflare Workers 設定 |
| `src/components/PostListPage.tsx` / `PostListSkeleton.tsx` | 公開側の一覧ページと、その読み込み中の骨組み（`(public)/{products,blogs,books}/(list)/loading.tsx` から使う）|
| `src/app/(public)/history/` | 年表（一覧・詳細ページ）。データは `history_events_table` |
| `src/components/HistoryEventEditor.tsx` | 年表の出来事の作成・編集エディタ（`/admin/history`）|
| `scripts/seed-history.mjs` | 年表の初期データ投入スクリプト（テーブルが空のときだけ投入）|
| `src/lib/history.ts` | 年表の時代・種類の定義と、期間（`end_date` / `ongoing`）をブランチ状の線に並べる `buildHistoryGraph` |

## 認証

- GitHub OAuth で `higuchi-learn` アカウントのみ許可
- 未認証アクセスは `/login` にリダイレクト

## 主要な制約・注意点

- CSS import（`easymde/dist/easymde.min.css`）は `src/global.d.ts` で型宣言済み
- 画像は外部（GitHub など）を参照せず、必ず管理画面から R2 にアップロードする（GitHub の添付画像は遅く、キャッシュも効かないため）
- 画像アップロードのキーは `{timestamp}-{6文字ランダム}.{ext}` 形式。拡張子と Content-Type はファイル名・申告値ではなく中身の判定結果から決める
- Client Component で async 関数をイベントに渡すときは `onClick={() => void handleX()}` とし、ハンドラー内は try/catch/finally で例外とローディング解除を処理する（Server Action を catch する場合は `unstable_rethrow` で redirect を投げ直す）
- スマホは画面幅 360px 以上を対応範囲とする（360px 以上でレイアウトが崩れないことを保証する。360px 未満は内容が読めて操作できれば十分とし、細かな見た目の崩れは許容する）
- 既存の見た目（記事カードなど）は、依頼された変更以外は変えない。不具合修正でデザイン変更が必要になったら先に確認する
- `<img>` を使ってよい（next/image は IMAGES バインディング経由で Cloudflare Images の変換料金が発生しうるため、意図的に `<img>` を使う方針。`@next/next/no-img-element` は無効化済み）
- バリデーションエラーはフィールド別にインライン表示（Zod + BlogEditor の `fieldErrors` state）
- エラーメッセージは `この要素は必須です。` / `文字数が超過しています。最大文字数は〇〇字です。` / `使用できない文字が含まれています。`
- slug は英数字・ハイフン・アンダースコアのみ許可（`/^[a-zA-Z0-9_-]+$/`）
- `Genre` 型は `'blogs' | 'products' | 'books'`（DB の enum と統一。`'blog'` ではない）
- ブログの URL は `/blogs/`、管理画面は `/admin/blogs/`
