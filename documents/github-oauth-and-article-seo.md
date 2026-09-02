# GitHub OAuthログイン修正と記事ページのSEO対応

- 対応日: 2026-09-02
- 関連コミット: `399f73f`, `1086a14`
- インシデント記録: `docs/incidents/2026-09-02-github-oauth-login-failure.md`

## 1. GitHub OAuthログイン失敗の修正

### 症状

本番でGitHubログインを試すと、GitHub側の認可は通るが `https://wadawataru.me/login?error=Configuration` に戻されログインできない。

### `iss` パラメータとは

OAuth 2.0には **RFC 9207 (OAuth 2.0 Authorization Server Issuer Identification)** という仕様がある。複数の認可サーバーを扱うクライアントが、悪意あるサーバーからの認可レスポンスを本物と誤認する「mix-upアタック」を防ぐためのもの。認可サーバーは自分のURL（issuer）をレスポンスに含め（`iss=https://github.com/login/oauth`）、クライアント側は「期待しているissuerからのレスポンスか」を検証する。

### 原因

next-auth（Auth.js v5 beta）は `iss` の検証ロジックを持っているが、GitHubプロバイダに `issuer` を明示していなかったため、比較対象がプレースホルダー（`https://authjs.dev`）のままになっていた。GitHubが最近 `iss` パラメータを送るようになったことでこの不一致が顕在化し、安全側に倒して認証を拒否（fail closed）するようになった。

**コードは変更していないのに、GitHub側の仕様変更でログインが壊れた**、という外部要因起因の障害だった。

### 修正

```ts
// src/auth.ts
providers: [GitHub({ issuer: 'https://github.com/login/oauth' })],
```

### 調査に使ったコマンド

```bash
npx wrangler secret list          # 本番シークレットの有無を確認（値は見れない）
npx wrangler tail --format pretty # 本番のリアルタイムログを見ながらログインを試す
```

`wrangler tail` で実際の例外（`CallbackRouteError` / `unexpected "iss" (issuer) response parameter value`）を確認できたことで原因を特定できた。`error=Configuration` のような抽象的なエラーページだけでは分からない。

### 教訓

- 外部プロバイダを使う認証は、コード変更が無くても相手側の仕様変更で突然壊れることがある
- 本番の実行時ログ（`wrangler tail`）を見るのが原因特定の一番の近道

---

## 2. 記事ページのSEO対応

### 課題

blogs/products/books の `[slug]` ページが、記事ごとの `<title>` / `<meta description>` を返しておらず、常に `layout.tsx` のサイト共通メタデータ（「わだわたるKIN TV」）が使われていた。検索結果やSNSシェア時に記事タイトルが出ない状態だった。また `sitemap.xml` も無かった。

### Next.js Metadata APIの仕組み

- **静的（`export const metadata`）**: ページ内容に関係なく固定値でよい場合。`layout.tsx` で使用。
- **動的（`generateMetadata` 関数）**: ページごとに中身が変わる場合。ページコンポーネントと同じ `params`（URLのslugなど）を受け取れる非同期関数で、DBから取得した値を返せる。

```ts
// src/lib/generatePostMetadata.ts
export async function generatePostMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostById(slug);
  if (!post) return {};
  return { title: post.title, description: post.description };
}
```

各 `[slug]/page.tsx` からこれを `generateMetadata` として re-export することで、3ジャンル分の重複コードを避けている。

### タイトルの階層合成（title template）

```ts
// src/app/layout.tsx
title: {
  default: 'わだわたるKIN TV',
  template: '%s | わだわたるKIN TV',
}
```

子ページが `title: '記事タイトル'` を返すと、Next.jsが自動でtemplateに当てはめ「記事タイトル | わだわたるKIN TV」になる。子ページが指定しなければ `default` が使われる。

### `React.cache()` によるDB問い合わせの重複排除

`generateMetadata` とページ本体（`PostDetailPage.tsx`）は別々の関数だが、どちらも同じ `slug` で `getPostById()` を呼ぶ。何もしないと1回のページ表示でDBクエリが2回走ってしまう。

```ts
// src/db/queries/select.ts
export const getPostById = cache(async (slug) => { ... });
```

`react` の `cache()` は「同じリクエストの中で、同じ引数で呼ばれたら結果を使い回す」というメモ化。リクエストが終われば破棄され、他のユーザー・他のリクエストとは共有されない。`fetch()` はNext.jsが自動でこれをやってくれるが、Drizzle経由のDBクエリのような任意の非同期関数は自分で `cache()` を掛ける必要がある。

### `sitemap.ts`

Next.js App Routerの特殊ファイル規約（`layout.tsx`, `page.tsx` などと同様）。`app/sitemap.ts` を置くだけで `/sitemap.xml` が自動配信される。

```ts
// src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPostsForSitemap();
  return [...staticRoutes, ...posts.map(post => ({
    url: `${BASE_URL}/${post.genre}/${post.slug}`,
    lastModified: post.updatedAt,
  }))];
}
```

クローラーは通常サイト内リンクを辿って新しいページを発見するが、サイトマップは「このURL一覧がある」と明示的に伝えることで発見・再クロールを速く安定させる。`lastModified` は更新頻度の判断材料になる。

### 今回やらなかったこと（次にやるなら）

- **OGP画像（`openGraph.images`）**: SNSシェア時にサムネイル画像をカード表示させたい場合に追加
- **`robots.ts`**: `/admin` 以下は認証必須で実害はないが、明示的にcrawl対象外にしたい場合に追加
