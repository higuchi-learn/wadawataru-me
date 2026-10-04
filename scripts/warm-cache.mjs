// デプロイ直後に公開ページを順に開いて、作り置き（R2）を先に作っておくスクリプト
//
// OpenNext はビルドごとに別の場所へ作り置きを保存するので、デプロイすると作り置きはすべて空になる。
// そのままだと、デプロイ直後は各ページの最初のアクセスが遅く（ページの組み立て＋Neon の読み込み）、
// たまたま開いた訪問者を待たせてしまう。ここで先に1回ずつ開いておけば、訪問者は作り置きを受け取れる。
// R2 はどの拠点の Worker からも読めるので、どこから開いても全拠点の訪問者に効く。
//
// 実行: node scripts/warm-cache.mjs [サイトの URL]（省略時は https://wadawataru.me）
// `pnpm run deploy` の最後に自動で実行される
//
// 自動生成のサムネイル（/api/og）と画像（/api/images）は、Cloudflare の拠点ごとのキャッシュなので温めない
// （ここで開いても、このスクリプトを動かした拠点にしか保存されない）

const BASE_URL = (process.argv[2] ?? 'https://wadawataru.me').replace(/\/$/, '');
// 同時に開くページの数。多すぎると Worker と Neon に一度に負荷がかかるので控えめにする
const CONCURRENCY = 4;

// サイトマップに載っていない、DB を読む公開ページ（一覧・年表）
const EXTRA_PATHS = ['/blogs', '/products', '/books', '/history', '/history?order=newest'];

async function fetchStatus(url) {
  const startedAt = Date.now();
  // ステータスが 5xx のとき（デプロイ直後で一時的に失敗した場合など）は1回だけやり直す
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      // 本文を最後まで読む。途中で読むのをやめると、作り置きの保存まで進まないことがある
      await res.arrayBuffer();
      if (res.status < 500 || attempt === 2) return { status: res.status, ms: Date.now() - startedAt };
    } catch (e) {
      if (attempt === 2) return { status: `error: ${e.message}`, ms: Date.now() - startedAt };
    }
  }
}

async function main() {
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!sitemapRes.ok) throw new Error(`サイトマップを取得できませんでした（${sitemapRes.status}）`);
  const sitemap = await sitemapRes.text();
  // サイトマップの URL は本番のドメインで書かれているので、パスだけ取り出して BASE_URL に付け直す
  const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const paths = [...new Set([...sitemapPaths, ...EXTRA_PATHS])];

  console.log(`${paths.length} ページを温めます（${BASE_URL}）`);
  const failures = [];
  let next = 0;
  async function worker() {
    while (next < paths.length) {
      const path = paths[next++];
      const { status, ms } = await fetchStatus(`${BASE_URL}${path}`);
      console.log(`  ${String(status).padEnd(4)} ${String(ms).padStart(5)}ms  ${path}`);
      // 200 以外（リダイレクトの 3xx を除く）は失敗として最後にまとめて表示する
      if (typeof status !== 'number' || status >= 400) failures.push(`${status} ${path}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  if (failures.length > 0) {
    console.log(`\n失敗したページ（${failures.length} 件）:`);
    failures.forEach((f) => console.log(`  ${f}`));
    // デプロイ自体は終わっているので、失敗があっても終了コードは 0 のままにする（デプロイ失敗と区別するため）
  } else {
    console.log('\nすべてのページを温めました');
  }
}

main().catch((e) => {
  // サイトマップが取れないなど、温め自体ができなかった場合も、デプロイは終わっているので 0 で終える
  console.error(`作り置きの温めをスキップしました: ${e.message}`);
});
