import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';

type Bindings = { R2: R2Bucket };

const { env } = await getCloudflareContext({ async: true });
const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

// /api/images/:key の :key は動的パラメータ
// Next.js のファイルシステムルーティングで [key] というフォルダ名がそのまま対応している
app.get('/images/:key', async (c) => {
  try {
    // c.req.param('key') でパスパラメータを取得する
    const key = c.req.param('key');

    // env.R2.get(key) で R2 バケットからオブジェクトを取得する
    // キーが存在しない場合は null が返る
    const image = await env.R2.get(key);

    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }

    // image.body は ReadableStream なので c.body() でそのままストリームとして返せる
    // アップロード時に保存した contentType をそのまま返すことで
    // ブラウザが JPEG / PNG / WebP などを正しく解釈して表示できる
    return c.body(image.body, 200, {
      'Content-Type': image.httpMetadata?.contentType ?? 'image/png',
    });
  } catch {
    return c.json({ error: 'Failed to fetch image' }, 500);
  }
});

export const GET = handle(app);
