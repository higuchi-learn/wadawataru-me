# サムネイル未設定記事のOG画像自動生成

- 対応日: 2026-09-02
- 関連コミット: `c9d7d07`

## 課題

blogs/products/books の記事は `thumbnail` カラムが任意（手動アップロード）のため、未設定の記事は以下の状態だった。

- 記事一覧カード（[Card.tsx](../src/components/Card.tsx)）: グレーの空箱が表示される
- SNSシェア時のカード画像（OGP `og:image`）: 何も設定されていない

Zenn/Qiita/dev.toのような技術記事共有サイトのように、タイトルから自動でサムネイル画像を生成したい。

## 方式の検討: A（リクエスト時に毎回生成） vs B（公開時に1回生成してR2に保存）

| | 方式A: リクエスト時に生成 | 方式B: 公開時に生成してR2保存 |
|---|---|---|
| 実装コスト | 小さい（画像生成ルートを1つ追加するだけ） | 大きい（Server Action側の変更・R2アップロード処理が必要） |
| タイトル編集への追従 | 自動（毎回最新のタイトルで生成される） | 別途「再生成」の仕組みが必要（放置すると画像とタイトルがズレる） |
| 表示速度 | キャッシュ次第（無対策だと生成のたびに遅い） | 速い（静的ファイル配信と同じ） |
| ストレージ消費 | なし | あり（記事削除時のクリーンアップも必要） |
| 向いているケース | アクセス数がそこまで多くない個人サイト | 高トラフィックで生成コストを無視できない場合 |

### Aを選んだ理由

このサイトは個人ポートフォリオで大量アクセスを捌く前提ではなく、方式Aの弱点（生成コスト・レイテンシ）はキャッシュを効かせれば実質問題にならない。一方で方式Bは「タイトルを書き直すたびに画像が古いまま残る」という運用上の罠があり、個人サイトの更新頻度・運用体制的にA（常にタイトルと同期する方）のメリットが上回ると判断した。実装コストが小さく、DBスキーマやServer Actionに手を入れずに済む点も採用の決め手。

## 実装

### `/api/og` — 画像生成ルート

```ts
// src/app/api/og/route.tsx
export async function GET(request: Request) {
  const title = new URL(request.url).searchParams.get('title')?.slice(0, 27) ?? SITE_NAME;
  const fontData = await loadNotoSansJP(title + SITE_NAME);

  return new ImageResponse(
    (/* タイトル + サイト名を並べたJSXレイアウト */),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Noto Sans JP', data: fontData, weight: 700 }],
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
  );
}
```

`next/og` の `ImageResponse` はSatoriというレンダラーでJSX+CSSからPNG画像を生成するAPI。Satoriはシステムフォントを持たないため、日本語を描画するには自前でフォントデータ（TTF/OTF）を渡す必要がある。

**フォントの取得方法**: Google FontsのCSS API（`fonts.googleapis.com/css2`）に `text` パラメータ（実際に使う文字だけ）付きでリクエストすると、レスポンスに含まれるフォントURLが得られる。ブラウザではない `fetch` からのリクエストはwoff2非対応とみなされ、Google側がTTF形式のURLを返してくれるため、そのURLから直接フォントデータを取得できる（Satoriはwoff2を扱えないため、この挙動を利用している）。

**キャッシュ**: 生成される画像はタイトル文字列だけで内容が決まる決定的なものなので、`Cache-Control: public, max-age=31536000, immutable` を付けている。同じタイトルへの再アクセスはCloudflareのエッジキャッシュが返すため、Workerの再実行（＝画像の再生成）が起きない。これが方式Aの「毎回生成のコスト」を実質無くしている部分。

### フォールバックとして使う2箇所

1. **[Card.tsx](../src/components/Card.tsx)** の `Thumbnail` — `thumbnailUrl` が無ければ `/api/og?title=...` を `<img src>` に使う。記事一覧・管理画面一覧の両方で共通して効く。
2. **[generatePostMetadata.ts](../src/lib/generatePostMetadata.ts)** の `openGraph.images` — `post.thumbnail` が無ければ同じく `/api/og?title=...` を使う。OGP画像は絶対URLである必要があるため、[layout.tsx](../src/app/layout.tsx) に `metadataBase: new URL('https://wadawataru.me')` を追加し、相対パスを自動で絶対URLに変換できるようにした。

### 動作確認

`pnpm preview`（Cloudflare Workers実行環境）でルートに直接アクセスし、日本語タイトルが崩れずに描画されること・DB制約の最大文字数（27字）でも2行に自然に折り返されレイアウトが崩れないことを確認した。
