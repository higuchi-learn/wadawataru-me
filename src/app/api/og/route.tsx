import { ImageResponse } from 'next/og';

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

const SITE_NAME = 'わだわたるKIN TV';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // title は posts_table.title の DB 制約（最大27字）に合わせて念のため切り詰める
  const title = (searchParams.get('title') ?? SITE_NAME).slice(0, 27);

  const fontData = await loadNotoSansJP(title + SITE_NAME);

  return new ImageResponse(
    (
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
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Noto Sans JP', data: fontData, weight: 700 }],
      headers: {
        // タイトル文字列だけで内容が決まる決定的な画像なので、CDNに長期キャッシュさせて
        // 同じタイトルへの再アクセスではWorkerを再実行しない（毎回生成のデメリットを軽減する）
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  );
}
