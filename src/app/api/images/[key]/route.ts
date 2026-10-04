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
    // Cloudflare の拠点ごとのキャッシュ（Cache API）を先に見る
    // Cache-Control を付けるだけでは、Workers のレスポンスは拠点にキャッシュされない
    // （Workers のレスポンスは Cache API を明示的に使わない限りエッジキャッシュされない。/api/og と同じ理由）。
    // そのため、初めて見る人には毎回 Worker と R2 が動いていた。拠点に保存しておけば、
    // 同じ拠点からの2回目以降は R2 を読まずに返せる（Worker は動くが、R2 の読み取り回数と待ち時間が減る）
    // キーは中身が書き換わらない（{タイムスタンプ}-{ランダム}.{拡張子}）ので、期限まで保存し続けてよい
    const cache = (caches as unknown as { default: Cache }).default;
    const cacheKey = new Request(new URL(c.req.url).toString(), { method: 'GET' });
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    // c.req.param('key') でパスパラメータを取得する
    const key = c.req.param('key');

    // env.R2.get(key) で R2 バケットからオブジェクトを取得する
    // キーが存在しない場合は null が返る
    const image = await env.R2.get(key);

    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }

    // アップロード時に保存した contentType を返すことで、ブラウザが JPEG / PNG / WebP などを正しく解釈して表示できる
    // ただし image/ 以外の値（text/html など）や未設定の場合はそのまま返さず、application/octet-stream にする
    // octet-stream は「中身不明のバイナリ」という意味で、ブラウザはページとして描画せずダウンロード扱いにする
    // アップロード側の許可リストより緩く image/* 全体を通すのは、判定を厳しくする前に保存された
    // AVIF などの既存画像を表示できなくしないため（安全性は下の nosniff と CSP で担保する）
    const storedType = image.httpMetadata?.contentType;
    const contentType = storedType?.startsWith('image/') ? storedType : 'application/octet-stream';

    // image.body は ReadableStream なので c.body() でそのままストリームとして返せる
    const response = c.body(image.body, 200, {
      'Content-Type': contentType,
      // ブラウザは Content-Type と中身が食い違うと、中身から種類を推測（MIME スニッフィング）することがある
      // nosniff を付けると推測をやめ、宣言した Content-Type 通りにしか扱わなくなる
      'X-Content-Type-Options': 'nosniff',
      // SVG は XML なので <script> を含められ、URL を直接開くと wadawataru.me の権限でスクリプトが動いてしまう（XSS）
      // CSP（Content Security Policy）でこのレスポンスが読み込めるものを制限する
      //   default-src 'none' : スクリプト・外部リソースの読み込みをすべて禁止
      //   style-src 'unsafe-inline' : SVG 内の <style> による見た目の指定だけは許可
      //   sandbox : 別オリジン扱いの隔離環境で開く。スクリプト実行もフォーム送信もできない
      // <img src> で埋め込んだ場合はもともとスクリプトは動かないため、表示には影響しない
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      // キーは {タイムスタンプ}-{ランダム}.{拡張子} で、同じキーの中身が書き換わることはない
      // そのためブラウザ・Cloudflare のエッジに最長期間（1年）キャッシュさせてよい
      //   public    : ブラウザだけでなく CDN などの共有キャッシュにも保存を許可
      //   immutable : 期限内は再検証（サーバーへの問い合わせ）すら不要と伝える
      // これにより 2 回目以降の表示では Worker の起動も R2 の読み出しも発生しない
      'Cache-Control': 'public, max-age=31536000, immutable',
      // ETag は中身の識別子。キャッシュ期限が切れた後も、変化がなければ 304 で済ませる再検証に使われる
      ETag: image.httpEtag,
    });
    // 拠点のキャッシュへの保存は、レスポンスを返した後に行う（waitUntil）。保存を待たずに画像を返せる
    // 本文（ストリーム）は1回しか読めないので、clone() した方を保存に使う
    getCloudflareContext().ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch {
    return c.json({ error: 'Failed to fetch image' }, 500);
  }
});

export const GET = handle(app);
