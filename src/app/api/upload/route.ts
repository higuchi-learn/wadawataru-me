import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { detectImageType } from '@/lib/imageType';

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
  const file = body.file;

  // ファイルが存在しない場合はエラーを返す
  // parseBody() の値はファイルなら File、テキスト項目なら string になるため、instanceof で File であることを確かめる
  // （as File で型だけ合わせると、文字列が送られたときに file.size などが undefined のまま素通りしてしまう）
  if (!(file instanceof File)) {
    return c.json({ error: 'file is required' }, 400);
  }

  // ファイルサイズを 5MB に制限する
  // 中身を読み込む前に確認することで、巨大なファイルを arrayBuffer() でメモリに展開する無駄を避ける
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return c.json({ error: 'file size must be 5MB or less' }, 400);
  }

  // file.type（Content-Type）や file.name（拡張子）は、送信側が自由に書き換えられる「自己申告」にすぎない
  // 例えば curl で HTML ファイルを type=image/png と名乗らせて送ることもできるため、検証には使えない
  // そこでファイルの中身（先頭のマジックナンバー）を読んで、本当に許可した画像形式かをサーバー側で判定する
  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectImageType(bytes);
  if (!detected) {
    return c.json({ error: 'only png, jpeg, gif, webp, svg images are allowed' }, 400);
  }

  // 拡張子は判定結果から付ける（ファイル名の拡張子は使わない）。日本語等の非ASCII文字も避けられる
  // Date.now() でミリ秒タイムスタンプ、Math.random().toString(36) で英数字ランダム文字列を生成する
  // .slice(2, 8) で先頭の '0.' を除いた6文字を取り出す
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${detected.ext}`;

  // httpMetadata.contentType も判定結果の MIME を保存する。画像配信 API はこの値を Content-Type として返すため、
  // 申告値を保存してしまうと、偽装された text/html などがそのまま配信される恐れがある
  await env.R2.put(key, bytes, {
    httpMetadata: { contentType: detected.mime },
  });

  // /api/images/[key] は R2 から取得して返す別の Route Handler（画像配信 API）
  const url = `/api/images/${key}`;

  return c.json({ url }, 201);
});

// handle(app) は Hono アプリを Next.js Route Handler の形式（{ POST, GET, ... }）に変換する
// これにより Next.js は通常の Route Handler として扱える
export const POST = handle(app);
