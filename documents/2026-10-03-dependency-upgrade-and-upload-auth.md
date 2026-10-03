# 2026-10-03 依存パッケージの更新と、アップロード API の認証チェック

- 対応日: 2026-10-03
- 前段の作業: [2026-10-03 セキュリティ・コード品質の一括修正](./2026-10-03-maintenance.md)

`pnpm audit` で見つかった依存パッケージの脆弱性を解消し、その中の1件（ミドルウェアのすり抜け）を受けて、`/api/upload` の中でも認証を確かめるようにした。

| # | 問題 | 種類 |
|---|---|---|
| 1 | 依存パッケージに既知の脆弱性が多数あった（本番依存で critical 2・high 48 を含む 137件） | セキュリティ |
| 2 | `/api/upload` の保護がミドルウェアだけだった | セキュリティ |

---

## 1. 依存パッケージに既知の脆弱性が多数あった

### 概要と原因

`pnpm audit --prod` の結果、本番で使う依存パッケージ（とその依存）に 137件の既知の脆弱性があった（critical 2・high 48・moderate 74・low 13）。依存パッケージを長いあいだ更新していなかったため。

このサイトに直接関係する主なもの:

| パッケージ | 脆弱性 | このサイトへの影響 |
|---|---|---|
| `next` 16.1.5 | Middleware / Proxy の認証チェックをすり抜けられる（16.2.6 で修正）| **大きい**。管理画面と `/api/upload` の保護はミドルウェアに頼っていた |
| `next` 16.1.5 | Server Components への DoS（16.2.3・16.2.5 で修正）| 細工したリクエストで Worker を重くされうる |
| `@opennextjs/cloudflare` 1.17.0 | `/cdn-cgi/` パスの正規化を使った SSRF（1.17.1 で修正）| 本番の Worker そのものが対象 |
| `drizzle-orm` 0.45.1 | SQL 識別子（テーブル名・列名）のエスケープ漏れ（0.45.2 で修正）| 識別子をユーザー入力から作っていないので実害は小さい |
| `hono` 4.12.2 | `serveStatic` での任意ファイル読み出し、CORS ミドルウェアの不備 | どちらの機能も使っていないので実害は小さい |

### 放置するとどうなるか

- 脆弱性は公開されているので、攻撃方法も知られている。特に Next.js のミドルウェアすり抜けは、**ログインしていなくても `/admin` や `/api/upload` に届く**可能性がある（Server Action は `isAuthenticated()` で守られているが、アップロード API は守られていなかった。→ 2）。
- 長く放置するほど、上げる版の差が大きくなる。変更点の確認と動作確認の手間が増えて、さらに上げにくくなる。

### どう対処したか

**事前の影響確認**（作業前に行い、問題がないことを確かめてから着手した）

1. `pnpm outdated` で更新できるバージョンを洗い出し、**メジャー版の更新は対象外**にした（eslint 10・TypeScript 7・`@types/node` 26・dotenv 18・`eslint-config-next` 16。いずれも本番には入らない開発用か、スクリプト用）。
2. 各パッケージの peerDependencies（「このライブラリと組み合わせて使えるバージョン」の指定）を確認した。
   - `@opennextjs/cloudflare@1.20.8` は **`next >= 16.3.8` と `wrangler ^4.125` が必須**。この3つは一緒に上げる必要がある。
   - `next-auth@5.0.0-beta.32`（beta の最新）は `next ^16`、`react ^19` に対応している。
   - dnd-kit・react-markdown・react-simplemde-editor も React 19.3 で使える。
3. 公式の情報で、変更点の中に影響するものがないかを確認した。
   - Next.js 16.2・16.3 のリリースノートに、既存アプリ向けの破壊的変更はない。新機能はどれも設定で有効にしたときだけ動く。
   - 16.2 で `ImageResponse` の標準フォントが Noto Sans から Geist に変わった。`/api/og` は Noto Sans JP を明示して渡しているので影響はない。
   - 16.3 で描画処理のストリームが Web 標準のものから Node.js のものに変わった。Workers では `nodejs_compat` が必要だが、`wrangler.jsonc` ですでに有効。
   - OpenNext 1.17 → 1.20.8 の変更履歴に、設定ファイルの書き換えが必要な変更はない。
4. パッケージの中身を見て、このサイトで使っている API が残っていることを確認した。
   - `unstable_rethrow`（`next/navigation`）、`hono/vercel`、`middleware.ts` というファイル名の認識（16.3.8 は `middleware` と `proxy` の両方を探す）。
5. 作業用の一時ディレクトリで `package.json` を書き換え、`pnpm audit --prod` を流して**更新後に脆弱性が 0 件になることを先に確かめた**。

**更新したバージョン**

| パッケージ | 更新前 | 更新後 |
|---|---|---|
| `next` | 16.1.5 | 16.3.8 |
| `@opennextjs/cloudflare` | 1.17.0 | 1.20.8 |
| `wrangler` | 4.68.0 | 4.147.0 |
| `react` / `react-dom` | 19.1.5 | 19.3.0 |
| `hono` | 4.12.2 | 4.13.12 |
| `drizzle-orm` / `drizzle-kit` | 0.45.1 / 0.31.9 | 0.45.3 / 0.31.11 |
| `zod` | 4.3.6 | 4.6.5 |
| `@neondatabase/serverless` | 1.0.2 | 1.2.0 |
| `easymde` | 2.20.0 | 2.21.0 |
| `tailwindcss` / `@tailwindcss/postcss` | 4.2.1 | 4.3.3 |
| `typescript-eslint` | 8.57.2 | 8.71.0 |
| `prettier` | 3.8.1 | 3.9.9 |

上記のあとに `pnpm update` を実行し、その他のパッケージと間接依存も、`package.json` の範囲内（メジャー版は変えない）で最新にした。

**更新後の確認**

| 確認 | 結果 |
|---|---|
| `pnpm audit --prod` | **0件**（更新前 137件）|
| `pnpm exec tsc --noEmit` / `pnpm lint` | エラーなし |
| `pnpm preview`（OpenNext でビルドし、ローカルの Workers で起動）| ビルド成功・起動成功 |
| トップ・`/blogs`・`/products`・`/books`・`/history`・`/career`・`/qualifications`・`/awards`・`/login`・`/sitemap.xml`・記事詳細（`/blogs/portfolio`・`/products/bingo2`）| すべて 200 |
| `/api/og?title=テスト` | 200（PNG 画像）|
| `/api/images/*`（ローカル R2 にテスト画像を置いて確認）| 200。nosniff・CSP・キャッシュのヘッダーも前回の修正どおり |
| 未ログインで `/admin` と `/api/upload` にアクセス | `/login` へ 307 リダイレクト |
| プレビュー実行中のエラーログ | なし |

**残っていること**

- `pnpm audit`（開発用を含む）に 2件残る。`eslint-config-next` 15 の中の `braces`（high）と、`drizzle-kit` の中の `esbuild`（moderate）。どちらも手元で使う道具の中だけで、本番の Worker には入らない。~~`eslint-config-next` は 16 に上げれば解消する見込み~~ → **訂正**: `braces` には修正版がまだなく、16 に上げても残る（[残作業のドキュメント](./2026-10-03-remaining-tasks.md#2-eslint-config-next-が-15-のままでnext-16-と版がずれていた)を参照）。
- ビルド時に次の2つの警告が出る（どちらも今回の更新で新しく出たものではなく、動作には影響しない）。
  - `The "middleware" file convention is deprecated. Please use "proxy" instead.`（Next.js 16 での名前変更）
  - `compatibility_date: 2025-09-27, consider updating`（`wrangler.jsonc` の互換性日付が古い）
- `pnpm install` で esbuild・workerd のインストール後スクリプトが「Ignored build scripts」としてスキップされる。pnpm 10 の標準の動き（許可していないパッケージのスクリプトは実行しない）で、ビルドとプレビューは問題なく動いた。

---

## 2. `/api/upload` の保護がミドルウェアだけだった

### 概要と原因

[`src/middleware.ts`](../src/middleware.ts) は `/admin/:path*` と `/api/upload` に対して、未ログインなら `/login` にリダイレクトしている。しかし [`/api/upload`](../src/app/api/upload/route.ts) の中では認証を確かめていなかった。

一方、Server Action は [`src/lib/authGuard.ts`](../src/lib/authGuard.ts) の `isAuthenticated()` で、処理の入口でもセッションを確かめている。アップロード API だけがこの二重の守りから漏れていた。

### 放置するとどうなるか

ミドルウェアは、次のような理由で素通りされることがある。

- **Next.js 自体の脆弱性**: 実際に 16.2.6 未満には、ミドルウェアをすり抜けられる不具合があった（1 で解消済み）。過去にも同じ種類の脆弱性（CVE-2025-29927）が出ている。
- **設定の書き間違い**: `matcher` のパスを変えたときに `/api/upload` が漏れる、など。

そうなると、**誰でも R2 に画像をアップロードできる**。

- R2 の容量と書き込み回数を勝手に消費される（課金につながる）。
- `wadawataru.me` のドメインで任意の画像（や、判定をすり抜けた SVG）を配信される。

### どう対処したか

アップロード処理の最初に、Server Action と同じ `isAuthenticated()` を置いた。

```ts
app.post('/upload', async (c) => {
  if (!(await isAuthenticated())) {
    return c.json({ error: 'unauthorized' }, 401);
  }
  ...
```

- **ファイルを読み込む前**に確かめるので、未ログインのリクエストには何の処理もさせない。
- API なので、ページのようなリダイレクトではなく **401（認証が必要）** を返す。
- `isAuthenticated()` はセッションの有無ではなく `session.user` の有無で判定する。`AUTH_SECRET` が未設定のような設定エラーのとき、`auth()` が `{ message: ... }` を返しても「ログイン済み」と誤判定しない（既存の実装をそのまま使った）。
- ミドルウェアの設定はそのまま残した。ミドルウェアとルート内のどちらか一方が破られても、もう一方で止まる（多層防御）。

**確認したこと・できなかったこと**

| 確認 | 結果 |
|---|---|
| `tsc` / `lint` | エラーなし |
| 未ログインで `/api/upload` に POST する | ミドルウェアにより `/login` へ 307（従来どおり）|
| **ミドルウェアをすり抜けた場合に、ルートが 401 を返すか** | **未確認**。確かめるにはミドルウェアの対象から `/api/upload` を一時的に外す必要があり、ローカルであっても保護を弱める操作になるため行っていない |
| ログインした状態で実際にアップロードできるか | **未確認**（GitHub OAuth が必要）|

デプロイ後に、管理画面でサムネイル・本文・タグ画像を貼り付けて、アップロードが成功することを確かめる必要がある。`isAuthenticated()` は Server Action（記事の保存など）と同じ関数なので、ログインして記事を保存できていれば、アップロードでも同じように認証が通るはず。
