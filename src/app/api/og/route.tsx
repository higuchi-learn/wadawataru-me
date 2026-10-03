import { ImageResponse } from 'next/og';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Satori（ImageResponse の内部で使われているレンダラー）はシステムフォントを持たないため、
// 日本語を描画するには自前でフォントデータ（TTF/OTF）を渡す必要がある。
// Google Fonts の CSS API に text パラメータ（使う文字だけ）付きでリクエストすると、
// ブラウザではない fetch からのリクエストは woff2 非対応とみなされ TTF 形式で返ってくるため、
// それを取得して ImageResponse の fonts オプションに渡す。
async function loadNotoSansJP(text: string): Promise<ArrayBuffer> {
  const params = new URLSearchParams({ family: 'Noto Sans JP:wght@700', text });
  const cssRes = await fetch(`https://fonts.googleapis.com/css2?${params}`);
  const css = await cssRes.text();
  const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!match) throw new Error('Noto Sans JP のフォントデータ取得に失敗しました');

  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

const SITE_NAME = 'わだわたる';

// キャッシュは1年間保持される（immutable）ため、レイアウトやブランド表記など
// 画像の見た目を変えるコード変更をしたら、このバージョンも上げること。
// 上げないと、既にキャッシュ済みの拠点では古い見た目の画像がしばらく返り続けてしまう。
const OG_IMAGE_VERSION = 2;

export async function GET(request: Request) {
  // Cache-Control ヘッダーだけでは Cloudflare の CDN キャッシュには乗らない
  // （Workers のレスポンスは Cache API を明示的に使わない限りエッジキャッシュされない）ため、
  // caches.default に自前でヒット確認・保存を行う。同じ title への2回目以降のリクエストは
  // Google Fontsへの問い合わせ・画像レンダリングを行わずキャッシュから即座に返せる。
  // lib.dom.d.ts の CacheStorage 型には default が無く、Cloudflareの生成型と競合してしまうため
  // ここだけ型アサーションで回避する（実行時は Workers ランタイムの caches.default が使われる）
  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKeyUrl = new URL(request.url);
  cacheKeyUrl.searchParams.set('v', String(OG_IMAGE_VERSION));
  const cacheKey = new Request(cacheKeyUrl, request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const { searchParams } = new URL(request.url);
  // title は posts_table.title の DB 制約（最大27字）に合わせて念のため切り詰める
  const title = (searchParams.get('title') ?? SITE_NAME).slice(0, 27);

  const fontData = await loadNotoSansJP(title + SITE_NAME);

  const response = new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px',
        backgroundColor: '#ffffff',
        fontFamily: 'Noto Sans JP',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          fontSize: 54,
          fontWeight: 700,
          color: '#171717',
          lineHeight: 1.4,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: '#ff6900' }}>{SITE_NAME}</div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Noto Sans JP', data: fontData, weight: 700 }],
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  );

  const { ctx } = getCloudflareContext();
  // レスポンスをそのまま返しつつ、複製した方をバックグラウンドでキャッシュに保存する
  // （キャッシュ保存の完了を待ってからレスポンスを返すとその分遅くなってしまうため）
  ctx.waitUntil(cache.put(cacheKey, response.clone()));

  return response;
}
