import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// neon() は Neon の HTTP ドライバを初期化する
// Cloudflare Workers は TCP 接続を使えないため、通常の pg ドライバではなく
// HTTP 経由でクエリを送れる @neondatabase/serverless を使う
const sql = neon(process.env.DATABASE_URL!);

// drizzle() に Neon クライアントを渡すことで、Drizzle ORM の型安全なクエリビルダーが使えるようになる
// ここで生成した db をクエリファイルから import して使う
export const db = drizzle({ client: sql });
