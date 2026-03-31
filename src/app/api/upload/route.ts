import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';

type Bindings = { R2: R2Bucket };

const { env } = await getCloudflareContext({ async: true });
const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

app.post('/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body.file as File;

  // ファイルが存在しない場合はエラーを返す
  if (!file) {
    return c.json({ error: 'file is required' }, 400);
  }
  // ファイル名をユニークにするために、現在のタイムスタンプとファイル名を組み合わせる
  const key = `${Date.now()}-${file.name}`;

  // R2にファイルをアップロードする
  await env.R2.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  // アップロードしたファイルのURLを生成する
  const imagePath = `/api/images/${key}`;
  // ベースURL+画像パスを組み合わせて画像取得用URLを生成する
  const url = `${c.req.url.split('/api')[0]}${imagePath}`;

  return c.json({ url }, 201);
});

export const POST = handle(app);
