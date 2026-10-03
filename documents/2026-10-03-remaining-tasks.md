# 2026-10-03 残作業の対応（compatibility_date・eslint-config-next 16・proxy.ts）

- 対応日: 2026-10-03
- 前段の作業: [セキュリティ・コード品質の一括修正](./2026-10-03-maintenance.md) → [依存パッケージの更新と、アップロード API の認証チェック](./2026-10-03-dependency-upgrade-and-upload-auth.md)

前段の作業で「残っていること」に挙げた項目のうち、デプロイ後の確認以外を進めた。

| # | 項目 | 結果 |
|---|---|---|
| 1 | `wrangler.jsonc` の `compatibility_date` が古かった | 対応済み |
| 2 | `eslint-config-next` が 15 のままで、`next` 16 と版がずれていた | 対応済み |
| 3 | `middleware.ts` が非推奨になっていた（`proxy.ts` への名前変更）| **保留**（理由は下記）|
| 4 | `<img>` を使う理由の説明が誤っていた | 訂正済み |

---

## 1. `wrangler.jsonc` の `compatibility_date` が古かった

### 概要と原因

[`wrangler.jsonc`](../wrangler.jsonc) の `compatibility_date` が `2025-09-27` のままだった。プロジェクトを作ったときの日付から更新していなかった。

Cloudflare Workers は、ランタイムの挙動を変えるときに後方互換性を壊さないよう、変更ごとに「compatibility flag」を用意し、**指定した日付より後に追加された変更は有効にしない**仕組みになっている。日付が古いほど、その後の修正や新機能（Node.js 互換 API の追加など）が使えない。ビルド時にも次の警告が出ていた。

```
WARN workerd compatibility_date: 2025-09-27, consider updating your wrangler config to a more recent date
```

### 放置するとどうなるか

- その後に入ったランタイムの不具合修正（ストリームの仕様準拠の修正など）が、このサイトでは有効にならない。
- 依存パッケージ（Next.js・OpenNext）は新しいランタイムを前提に開発・テストされるので、ずれが大きくなるほど、相性問題が起きたときの原因の切り分けが難しくなる。
- いつか上げるときに、1年分以上の変更をまとめて確かめなければならなくなる。

### どう対処したか

**事前の影響確認**: [Cloudflare の compatibility flags 一覧](https://developers.cloudflare.com/workers/configuration/compatibility-flags/)から、2025-09-28〜2026-10-01 に既定で有効になる変更を洗い出し、このサイトに関係するものを確かめた。

| 変更 | 内容 | このサイトへの影響 |
|---|---|---|
| `websocket_standard_binary_type`（2026-03-17）| WebSocket のバイナリが Blob で届くようになる | **なし**。DB は `drizzle-orm/neon-http`（HTTP の fetch）で接続していて、WebSocket は使っていない |
| `writable_stream_spec_compliant_writer` / `encoder_stream_spec_compliant_backpressure`（2026-03-24）| ストリームの仕様準拠の修正 | ページ描画のストリーム処理に関わりうるので、プレビューで確認した（下記）|
| `enable_nodejs_*_module`（2026-03-17）| `node:perf_hooks`・`node:v8` などのモジュール（一部はスタブ）を使えるようにする | 追加のみで、既存の動きは変わらない |
| `enhanced_error_serialization`（2026-04-21）など | エラーのシリアライズの改善など | 使っていない機能 |
| Python Workers・Durable Objects・Queues・Containers・Workflows 関係 | 各機能の挙動変更 | 使っていない機能 |

**変更**: `compatibility_date` を `2026-10-01` にした。今の wrangler に入っているローカル実行環境（workerd 1.20261001）が対応している最新の日付で、ローカルのプレビューと本番で同じ挙動を確かめられる。設定ファイルには、日付の意味と更新日をコメントで残した。

**確認したこと**（`pnpm preview`）:

- ビルド時の `compatibility_date` の警告が消えた。
- トップ・`/blogs`・記事詳細・`/products`・`/books`・`/history`・`/career`・`/qualifications`・`/awards`・`/login`・`/sitemap.xml`・`/api/og`・`/api/images/*` が、更新前と**同じステータス・同じバイト数**で返った（描画結果が変わっていない）。
- 未ログインで `/admin`・`/api/upload` にアクセスすると、`/login` へ 307 リダイレクトされる。
- 実行中のエラーログは出ていない。

> **注意**: 本番の挙動が変わるのはデプロイ後。デプロイ後の確認（管理画面での保存・アップロード）で、あわせて確かめる。

---

## 2. `eslint-config-next` が 15 のままで、`next` 16 と版がずれていた

### 概要と原因

`next` は 16 系なのに、Next.js 用の ESLint 設定 `eslint-config-next` は 15.4.6 のままだった。Next.js 16 に上げたときに、一緒に上げ忘れていた。

15 系の `eslint-config-next` は ESLint の旧形式の設定（`.eslintrc`）で提供されていたため、[`eslint.config.mjs`](../eslint.config.mjs) では `@eslint/eslintrc` の `FlatCompat` という変換レイヤーを通して読み込んでいた。

### 放置するとどうなるか

- Next.js 16 で追加・変更されたルール（React 19 向けの Hooks ルールなど）がチェックされない。
- `next` と lint ルールの前提がずれ、新しい書き方を誤って警告したり、逆に問題を見逃したりする。
- `FlatCompat` という余分な層を通し続けることになり、設定が読みにくい。

### どう対処したか

**更新**: `eslint-config-next` を 16.3.8（`next` と同じ版）に上げた。16 系は ESLint 9 の新しい設定形式（flat config）の配列をそのまま export しているので、`FlatCompat` をやめて直接 import する形にした。

```js
// 変更前
const compat = new FlatCompat({ baseDirectory: __dirname });
...compat.extends('next/core-web-vitals'),

// 変更後
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
...nextCoreWebVitals,
```

不要になった `@eslint/eslintrc` は依存から外した。

**新しいルールで見つかった問題**: 16 系に含まれる `eslint-plugin-react-hooks` 7 の `react-hooks/refs` ルールで、1件エラーになった。

```tsx
// src/components/DiaryBook.tsx（変更前）
const [pageIndex, setPageIndex] = useState(0);
const pageIndexRef = useRef(pageIndex);
pageIndexRef.current = pageIndex;   // ← 描画の最中に ref を書き換えている
...
const goTo = async (targetIndex: number) => {
  const fromIndex = pageIndexRef.current;
```

- **なぜ問題か**: React は描画を途中で中断したり、やり直したりすることがある（Concurrent Rendering）。描画中に ref を書き換えると、画面に出なかった描画の値が ref に残り、実際の表示と ref がずれる恐れがある。
- **直し方**: `goTo` はボタンの `onClick` からしか呼ばれず、描画のたびに作り直される。そのため、関数の中から見える `pageIndex` は常に最新の値になる。ref は不要だったので、`pageIndex` をそのまま使うようにして ref を消した。アニメーション中の連打は、別の `isAnimatingRef`（イベントハンドラーの中でだけ書き換えている）で防いでいるので、動きは変わらない。

**確認したこと**: `tsc`・`pnpm lint`（エラー 0）・`next build` が通った。

**開発用依存に残る脆弱性について（前段のドキュメントの訂正）**: 前段の作業では「`eslint-config-next` を 16 に上げれば `braces` の脆弱性は解消する見込み」と書いたが、**誤りだった**。`braces` のこの脆弱性には修正版がまだ出ておらず（`pnpm audit` の修正済みバージョンが「なし」）、16 に上げても残る。残っている2件は次のとおりで、どちらも手元で lint やマイグレーションを実行するときにしか使われず、本番の Worker には入らない。

| パッケージ | 経路 | 深刻度 | 状態 |
|---|---|---|---|
| `braces` | `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` | high | 修正版がない。上流の更新待ち |
| `esbuild` | `drizzle-kit` → `@esbuild-kit/esm-loader` | moderate | `drizzle-kit` の古い依存。esbuild の開発サーバー機能に関する脆弱性で、drizzle-kit はその機能を使わない |

---

## 3. `middleware.ts` が非推奨になっていた（`proxy.ts` への名前変更）— 保留

### 概要と原因

Next.js 16 で、ミドルウェアのファイル名が `middleware.ts` から `proxy.ts` に変わった。ビルド時に次の警告が出る。

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

### 放置するとどうなるか

- 今は警告が出るだけで、動作は変わらない（16.3.8 は `middleware` と `proxy` の両方のファイル名を認識する）。
- 将来のメジャー版で `middleware.ts` が使えなくなる可能性がある。

### 対応しなかった理由

調べたところ、**名前を変えるだけでは済まない**ことが分かった。

- Next.js の公式ドキュメント（[proxy.js](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)）によると、**Proxy は Node.js ランタイム専用**で、`runtime` の指定はエラーになる。今の `middleware.ts` は Edge ランタイムで動いている。つまり名前を変えると、実行環境そのものが変わる。
- OpenNext（Cloudflare）での Node.js ランタイムのミドルウェア対応は、1.20.3 で入ったばかりの**実験的な機能**（変更履歴に「experimental Node.js middleware (proxy.ts) support」とある）。[OpenNext の公式ドキュメント](https://opennext.js.org/cloudflare)には、まだ「Node Middleware ... are not yet supported」と書かれている。
- このファイルは**管理画面とアップロード API を守るログインの関門**。実験的な仕組みに移して、ルートの認証が正しくかからない不具合が起きれば、被害が大きい。

警告が出るだけで実害はない今の段階で、安定した仕組みから実験的な仕組みに移す理由はないと判断した。

### 今後の対応

次のどちらかになったら移行する。

- OpenNext の公式ドキュメントで、Node.js ミドルウェア（`proxy.ts`）の対応が安定版になったとき
- Next.js が `middleware.ts` の削除を予告したとき

移行するときは `npx @next/codemod@canary middleware-to-proxy .` でファイル名と関数名を変える。そのうえで、未ログインで `/admin`・`/api/upload` にアクセスしたときのリダイレクトと、ログイン後の管理画面の動作を、`pnpm preview` と本番の両方で確かめる。なお、Server Action と `/api/upload` はミドルウェアとは別に処理の中でも認証を確かめているので、移行中にミドルウェアが効かなくなっても、データの書き換えとアップロードは防げる。

---

## 4. `<img>` を使う理由の説明が誤っていた

### 概要と原因

[一括修正の項目6](./2026-10-03-maintenance.md#6-img-警告の扱いが決まっていなかった)で、`@next/next/no-img-element` を無効にする理由を「Cloudflare Workers では Next.js の画像最適化が使えない」と書いていた。しかし `wrangler.jsonc` を読み直したところ、Cloudflare Images の `IMAGES` バインディングがすでに設定されていた。[OpenNext の公式ドキュメント](https://opennext.js.org/cloudflare/howtos/image)によると、このバインディングがあれば next/image の最適化はそのまま動く。つまり、説明が誤っていた。確認しないまま書いたのが原因。

### 放置するとどうなるか

- 誤った理由が設定ファイル・`CLAUDE.md`・ドキュメントに残り、将来「next/image は使えない」と思い込んだまま判断を誤る。

### どう対処したか

`<img>` を使う判断そのものは変えていない（next/image にすると変換回数に応じて Cloudflare Images の料金が発生しうる。一方で、このサイトの画像はアップロード済みの PNG やロゴの SVG が中心で、変換の効果は小さい）。理由の説明だけを、この内容に直した。

- [`eslint.config.mjs`](../eslint.config.mjs) のコメント
- [`CLAUDE.md`](../CLAUDE.md) の注意点
- [一括修正のドキュメント](./2026-10-03-maintenance.md)の項目6（訂正の注記を追加）
