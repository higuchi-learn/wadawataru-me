import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';

type Bindings = { R2: R2Bucket };

const { env } = await getCloudflareContext({ async: true });
const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

app.get('/images/:key', async (c) => {
  try {
    // URLパラメータから画像のキーを取得する
    const key = c.req.param('key');
    // R2から画像を取得する
    const image = await env.R2.get(key);
    // 画像が存在しない場合は404エラーを返す
    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }
    // 画像が存在する場合は、画像の内容とContent-Typeをレスポンスとして返す
    return c.body(image.body, 200, {
      'Content-Type': image.httpMetadata?.contentType ?? 'image/png',
    });
  } catch {
    return c.json({ error: 'Failed to fetch image' }, 500);
  }
});

export const GET = handle(app);
