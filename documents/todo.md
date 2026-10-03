# TODO リスト

最終更新: 2026-10-03

## 未対応

- **デプロイ後の動作確認（ログインが必要）**: 管理画面で、サムネイル・本文・タグ画像（PNG と SVG）の貼り付けアップロードと、記事・年表・日記の保存ができること
- **【保留】`middleware.ts` を `proxy.ts` に名前変更する**: Next.js 16 で非推奨。ただし Proxy は Node.js ランタイム専用で、OpenNext（Cloudflare）での対応はまだ実験的なため、安定版になるか Next.js が削除を予告するまで待つ（[理由](./2026-10-03-remaining-tasks.md#3-middlewarets-が非推奨になっていたproxyts-への名前変更-保留)）
- **開発用依存に残る脆弱性 2件を上流の更新後に解消する**: `braces`（`eslint-config-next` 経由。修正版なし）と `esbuild`（`drizzle-kit` 経由）。どちらも本番には入らない
- **残りのメジャー版の更新を検討する**: eslint 10・TypeScript 7・`@types/node`・dotenv 18（どれも開発用かスクリプト用）

## 完了済み

2026-04 時点で TODO に載っていた項目は、すべて対応済み。

| 項目 | 対応内容 |
|---|---|
| 説明欄（textarea）で半角文字が折り返されない | `InputField` の textarea に `break-all` を追加 |
| `/api/upload` にファイルサイズ上限がない | 5MB を超えたら 400 を返す |
| `/api/upload` でサーバー側の画像形式検証がない | 2026-10-03 にファイル先頭のマジックナンバーで判定する方式に変更（[詳細](./2026-10-03-maintenance.md#1-アップロードの画像判定が自己申告のままだった)）|
| 保存・公開・アーカイブ後に `isLoading` が戻らない | 成功時にもリセット。2026-10-03 に例外発生時も `finally` で戻すよう修正（[詳細](./2026-10-03-maintenance.md#4-async-関数をイベントハンドラーにそのまま渡していた)）|
| 許可していないアカウントでログインしたときのエラー表示 | `pages.error: '/login'` を設定し、`?error=AccessDenied` のときにメッセージを表示 |
| 保存前のバリデーション（必須・文字数・slug 重複） | Zod スキーマによるフィールド別のインライン表示。slug が重複したら「このURLパスはすでに使われています」と表示 |
| 画像アップロード（R2 連携） | `/api/upload`・`/api/images/[key]` を実装。サムネイル欄と本文エディタで貼り付け・ドロップに対応 |
| タグ管理 | `/admin/tags`（`TagManagementPage`）で作成・編集・削除・ドラッグ＆ドロップの並べ替え。記事エディタからは `TagSelectOverlay` で作成・選択 |
| 未着手だったページ（ホーム・キャリア・資格・受賞歴） | すべて実装済み |
| 依存パッケージの脆弱性（本番依存 137件） | 2026-10-03 に Next.js 16.3.8・OpenNext 1.20.8 などへ更新して 0件に（[詳細](./2026-10-03-dependency-upgrade-and-upload-auth.md)）|
| `/api/upload` の保護がミドルウェアだけ | 2026-10-03 にルート内でも `isAuthenticated()` で確認するよう修正 |
| `compatibility_date` が古い（2025-09-27） | 2026-10-03 に 2026-10-01 へ更新（[詳細](./2026-10-03-remaining-tasks.md)）|
| `eslint-config-next` が 15 のまま | 2026-10-03 に 16.3.8 へ更新し、`FlatCompat` をやめて直接 import する形に変更 |
