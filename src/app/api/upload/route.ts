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
  // 拡張子のみ保持し、UUIDでユニークなキーを生成する（日本語等の非ASCII文字を避ける）
  const ext = file.name.split('.').pop() ?? 'bin';
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // R2にファイルをアップロードする
  await env.R2.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  const url = `/api/images/${key}`;

  return c.json({ url }, 201);
});

export const POST = handle(app);
