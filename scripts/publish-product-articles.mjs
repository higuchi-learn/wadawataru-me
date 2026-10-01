// 制作物の詳細を記事（posts_table の products）に一本化するスクリプト
// - 下書きだった制作物の記事の本文を、受賞歴・経歴・年表ページの情報で補強して公開する
// - まだ記事がなかった制作物（Wii リモコンの再現・高校の課題研究）の記事を仮の内容で作って公開する
// - 年表の制作物に関する出来事に product_slug を設定し、年表のカードから記事へリンクさせる
//
// 実行: pnpm exec drizzle-kit migrate（0009 で product_slug 列を追加）のあとに node scripts/publish-product-articles.mjs
// （.env.local の DATABASE_URL に接続する。何度実行しても同じ結果になる）
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { updatedContents, newArticles } from './data/product-articles.mjs';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// 年表の出来事の id → 制作物の記事の slug
// タイトルではなく id で指定するのは、管理画面でタイトルを直しても対応がずれないようにするため
const HISTORY_PRODUCT_SLUGS = {
  '417a2b2a-a854-4661-8979-fa269d28b9ab': 'nfc-entry-system', // 課題研究で入退室管理システムを開発
  '2f1b19ed-7916-4006-aeca-e4b2da5a290e': 'syspay', // 工科展 優秀賞「SysPay」
  '7409471a-1508-4933-99af-5bbdea4267d9': 'lovely-stick', // 技育CAMP ハッカソン vol.19 優秀賞
  '3dbb0608-6240-4724-8fa3-44df3454a07c': 'lovely-stick', // 技育博 2024 株式会社ゆめみ 企業賞
  '92f37e55-9439-4b00-8bbe-1863390ad856': 'bingo2', // SysHack STECH 協賛賞「Bingo!2」
  'de324d11-e3af-4c7e-923c-38a74f82283a': 'wii-remote', // Wii リモコンの再現に挑戦
  'd26aaae1-8140-4d50-9e9e-7baf5fda714e': 'chicken-shooting', // 物体検出ゲーム「ChickenShooting」に挑戦
  '388f644f-f930-4ce4-a932-dbd7bda968d8': 'gesture-audio', // 技育CAMP ハッカソン 最優秀賞「Gesture Audio」
  '83b407e2-2042-4f78-a766-a0386aa48b7d': 'entry-system', // 工科展 2025 に入退室管理システムを出展
  '57829d6b-50b2-4b87-be1d-d12b31515e5d': '23bit-adder', // 23ビット加算器表示器を制作
  'b3e1c95b-3c1e-48cc-860b-0999974d9720': 'wadawataru-me', // ポートフォリオサイト「わだわたる」制作開始
  'e76a46fb-5969-4abf-a982-8f7eb082b762': 'micro-spot', // ミニスポット共有サービス「micro-spot」を開発
  '3882fb1c-8a4a-4bf3-8fbc-e6b9c8d2bd9f': 'chicken-shooting', // 東京ゲームショウに「ChickenShooting」を出展
};

const now = new Date();
const queries = [];

// 既存の記事: 本文を差し替えて公開する。
// published_at は、すでに公開日がある記事ではそのまま残す（coalesce は最初の null でない値を返す）
for (const [slug, content] of Object.entries(updatedContents)) {
  queries.push(sql`
    update posts_table
    set content = ${content},
        status = 'published',
        published_at = coalesce(published_at, ${now}),
        updated_at = ${now}
    where slug = ${slug} and genre = 'products'
  `);
}

// 新規の記事: slug は UNIQUE なので、同じ slug の記事がすでにあれば何もしない（2回目以降の実行で重複させない）
for (const article of newArticles) {
  queries.push(sql`
    insert into posts_table
      (genre, slug, title, description, content, thumbnail, status, created_at, published_at, updated_at)
    values
      ('products', ${article.slug}, ${article.title}, ${article.description}, ${article.content}, null,
       'published', ${now}, ${now}, ${now})
    on conflict (slug) do nothing
  `);
}

for (const [id, slug] of Object.entries(HISTORY_PRODUCT_SLUGS)) {
  queries.push(sql`
    update history_events_table
    set product_slug = ${slug},
        updated_at = ${now}
    where id = ${id}
  `);
}

// transaction でまとめて実行し、途中で失敗したらすべて取り消す（記事だけ公開されて年表がつながらない、などを防ぐ）
await sql.transaction(queries);

const rows = await sql`
  select slug, title, status from posts_table where genre = 'products' order by created_at
`;
console.table(rows);
