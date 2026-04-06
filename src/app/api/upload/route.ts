import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';

type Bindings = { R2: R2Bucket };

// Cloudflare Workers の env（R2 などのバインディング）は通常リクエストの中でしか取得できない
// getCloudflareContext はそれをリクエストの外（ファイルの先頭）でも取得できるようにしてくれる関数
// { async: true } はトップレベル await（関数の外で await を使うこと）を許可するオプション
// これがないと「ここは async 関数の外なので await できない」というエラーになる
const { env } = await getCloudflareContext({ async: true });

// Hono は軽量な Web フレームワーク。Next.js の Route Handler として使うことで
// ルーティングやリクエストパース処理を Hono に任せることができる
// basePath('/api') を指定すると、この後 app.post('/upload', ...) と書いたとき
// 実際のURLは /api/upload になる（/api が先頭に自動で付く）
const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

app.post('/upload', async (c) => {
  // parseBody() は multipart/form-data や application/x-www-form-urlencoded を
  // 自動で解析してくれる。フロント側の FormData.append('file', ...) に対応している
  const body = await c.req.parseBody();
  const file = body.file as File;

  // ファイルが存在しない場合はエラーを返す
  if (!file) {
    return c.json({ error: 'file is required' }, 400);
  }

  // 拡張子のみ保持し、UUIDでユニークなキーを生成する（日本語等の非ASCII文字を避ける）
  // Date.now() でミリ秒タイムスタンプ、Math.random().toString(36) で英数字ランダム文字列を生成する
  // .slice(2, 8) で先頭の '0.' を除いた6文字を取り出す
  const ext = file.name.split('.').pop() ?? 'bin';
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // file.arrayBuffer() でファイルをバイナリデータ（ArrayBuffer）として読み込んでから R2 に渡す
  // httpMetadata.contentType を指定しておくと、画像取得 API がそのまま Content-Type を返せる
  await env.R2.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  // /api/images/[key] は R2 から取得して返す別の Route Handler（画像配信 API）
  const url = `/api/images/${key}`;

  return c.json({ url }, 201);
});

// handle(app) は Hono アプリを Next.js Route Handler の形式（{ POST, GET, ... }）に変換する
// これにより Next.js は通常の Route Handler として扱える
export const POST = handle(app);
