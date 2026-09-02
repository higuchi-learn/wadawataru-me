# SlackでOGP画像が表示されない問題の調査・修正

- 対応日: 2026-09-02
- 関連コミット: `c4190b5`
- 前提となる機能: `documents/auto-thumbnail-generation.md`（`/api/og` によるサムネイル自動生成）

## 何が問題だったか

`https://wadawataru.me/blogs/portfolio` をSlackのチャットに貼ったところ、タイトル・説明文は表示されたが**OGP画像（サムネイル）だけが表示されなかった**。YouTubeのリンクでは同じSlack上で問題なくサムネイルが表示されており、Slack側の一般的な設定不備ではなく、このサイト固有の問題だと判断した。

## 何が原因だったか

`https://wadawataru.me/blogs/portfolio` の `og:image` は `/api/og?title=...`（タイトルからサムネイルを自動生成するルート）を指しており、記事自体にサムネイルが未設定な場合の想定通りの動作だった。問題はこの画像生成ルートの実装に2つあった。

### 原因1: `Cache-Control` ヘッダーだけではCloudflareのCDNキャッシュに乗らない

`/api/og` のレスポンスには `Cache-Control: public, max-age=31536000, immutable` を付けていたが、これは静的アセット（`_next/static/*` など）やCloudflare Pagesの場合に効くもので、**Cloudflare Workersが動的に生成したレスポンスはヘッダーを付けるだけではエッジキャッシュされない**。キャッシュに乗せるには `caches.default`（Cache API）を明示的に呼ぶ必要がある。

この結果、`/api/og` は**同じタイトルへのリクエストでも毎回**、日本語フォント（Noto Sans JP）をGoogle Fontsから取得し直し、画像をゼロから描画していた。本番環境で実測すると **1リクエストあたり0.9〜1.9秒** かかっていた。

### 原因2: `og:image:width` / `og:image:height` が未指定だった

Next.jsの `openGraph.images` に画像のURLを文字列だけで渡していたため、`<meta property="og:image:width">` / `<meta property="og:image:height">` が出力されていなかった。Slackのアンファール（リンクプレビュー）はこの寸法情報が無いと画像のプレビューに失敗することがある既知の癖がある。

上記2つが重なり、Slackが画像の取得・プレビュー生成に失敗した（もしくはSlack側のタイムアウトに引っかかった）と考えられる。

## どう対処したか

[src/app/api/og/route.tsx](../src/app/api/og/route.tsx)

- **Cache API（`caches.default`）を明示的に使用**: リクエストの先頭で `cache.match()` を呼び、ヒットすればそのまま返す。ミスした場合のみ画像を生成し、`ctx.waitUntil(cache.put(...))` でレスポンスを返しつつバックグラウンドでキャッシュに保存する（保存完了を待つとレスポンスが遅くなるため `waitUntil` でノンブロッキングにしている）
- Cloudflareの生成型（`cloudflare-env.d.ts`）が持つ `CacheStorage.default` が、Next.jsの `lib: dom` の型と衝突して型エラーになったため、`(caches as unknown as { default: Cache }).default` で型アサーションして回避

[src/lib/generatePostMetadata.ts](../src/lib/generatePostMetadata.ts)

- 自動生成画像（`/api/og`）を使う場合のみ `width: 1200, height: 630` を明示（常に固定サイズのPNGを返すため）。手動アップロードのサムネイルは実際のサイズが分からないため寸法は付けない

## どう改善したか（実測）

`pnpm preview`（ローカルのCloudflare Workers実行環境）での計測:

| | 修正前 | 修正後 |
|---|---|---|
| 1回目（キャッシュミス） | 1.56秒 | 1.56秒（変化なし。初回は生成が必要なため） |
| 2回目以降（同じtitle） | 変化なし（毎回1秒前後） | **8〜16ミリ秒** |

本番（`wadawataru.me`）での計測:

- キャッシュヒット時: 最速 **128ms**
- キャッシュミス時: 修正前と同程度（0.6〜1.7秒）— Cloudflareのキャッシュはアクセスしてきたエッジ拠点ごとに個別に温まる仕組みのため、拠点が変わると再度ミスすることがある

`og:image:width` / `og:image:height` も本番で出力されていることを確認した。

## 現状

- コード修正・デプロイ完了（`c4190b5`）
- `pnpm preview` とデプロイ後の本番環境の両方で、キャッシュヒット時に大幅な高速化を実測で確認済み
- **未確認**: Slack上で実際にOGP画像が表示されるようになったかどうか。Slackはリンクごとにプレビュー結果を一定期間キャッシュするため、修正前に一度失敗したURLはしばらく画像なしのプレビューのままになっている可能性がある。再度リンクを貼って確認するか、時間を置く／URLにダミーのクエリパラメータを付けて再テストする必要がある
