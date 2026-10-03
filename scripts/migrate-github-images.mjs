// 記事・年表・タグで参照している GitHub 上の画像（user-attachments など）を、自前の R2 に移すスクリプト
//
// なぜ移すのか:
//   GitHub の画像 URL はアメリカの S3 へリダイレクトされ、署名付き URL が 5 分で切れるためブラウザにキャッシュされない
//   さらにスクリーンショットが無圧縮の PNG（最大 4.6MB）だったため、記事の画像 1 枚に 3〜19 秒かかっていた
//   （詳細: documents/2026-10-04-github-images-to-r2.md）
//
// やること:
//   1. posts_table（content / thumbnail）・history_events_table（content / thumbnail）・tags_table（image_url）から
//      GitHub の画像 URL を探す
//   2. 画像を取得し、管理画面のアップロードと同じ設定（長い辺 1920px・比率維持・品質 0.85）で WebP に変換する
//   3. --apply のときだけ: 元の行をバックアップ → R2 に置く → 本文などの URL を /api/images/{key} に置き換える
//      → scripts/data/product-articles.mjs の URL も置き換える（publish-product-articles.mjs の再実行で元に戻らないように）
//
// 実行:
//   node scripts/migrate-github-images.mjs          … 下見のみ（DB・R2・ファイルには一切書き込まない）
//   node scripts/migrate-github-images.mjs --apply  … 実際に移行する
// （.env.local の DATABASE_URL に接続する。R2 への書き込みは wrangler の認証情報を使う）
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
const APPLY = process.argv.includes('--apply');

// src/lib/convertToWebp.ts と同じ値にそろえる（管理画面から上げた画像と同じ品質・大きさになるように）
const MAX_IMAGE_DIMENSION = 1920;
const WEBP_QUALITY = 85; // sharp は 0〜100 で指定する（ブラウザの toBlob の 0.85 に相当）

const R2_BUCKET = 'wadawataru-me';
const DATA_FILE = 'scripts/data/product-articles.mjs';

// GitHub の画像 URL
//   github.com/user-attachments/assets/{uuid} : README や Issue に貼った画像（今の形式）
//   *.githubusercontent.com/...                : 古い形式の添付画像や raw ファイル
// Markdown の ![](...) や <img src="..."> の中に現れるので、URL として終わる文字（空白・括弧・引用符）の手前までを取る
const GITHUB_URL =
  /https:\/\/(?:github\.com\/user-attachments\/assets\/[0-9a-f-]+|[a-z0-9.-]*githubusercontent\.com\/[^\s)"'<>]+)/g;

// 対象のテーブルと列。id 以外の列は、どの記事のどこにあったかを人が確認するための情報
const TARGETS = [
  { table: 'posts_table', label: (r) => `${r.genre}/${r.slug}（${r.status}）`, columns: ['content', 'thumbnail'] },
  { table: 'history_events_table', label: (r) => `年表「${r.title}」`, columns: ['content', 'thumbnail'] },
  { table: 'tags_table', label: (r) => `タグ「${r.name}」`, columns: ['image_url'] },
];

async function fetchRows() {
  return {
    posts_table: await sql`select id, genre, slug, status, content, thumbnail from posts_table`,
    history_events_table: await sql`select id, title, content, thumbnail from history_events_table`,
    tags_table: await sql`select id, name, image_url from tags_table`,
  };
}

// 行の中から GitHub の URL を集める。同じ画像が複数の記事で使われていても 1 回だけ移すため、URL ごとにまとめる
function collectUsages(rowsByTable) {
  const usages = new Map(); // url → [{ table, id, column, label }]
  for (const { table, label, columns } of TARGETS) {
    for (const row of rowsByTable[table]) {
      for (const column of columns) {
        for (const url of row[column]?.match(GITHUB_URL) ?? []) {
          if (!usages.has(url)) usages.set(url, []);
          usages.get(url).push({ table, id: row.id, column, label: label(row) });
        }
      }
    }
  }
  return usages;
}

async function convert(url) {
  // GitHub は 302 で S3 の署名付き URL にリダイレクトする。fetch は既定でリダイレクトを追いかける
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const contentType = res.headers.get('content-type') ?? '';
  const original = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(original).metadata();
  // SVG・GIF はアップロード時と同じく変換しない（劣化する・アニメーションが止まるため）。今回の対象には無い想定
  if (meta.format === 'svg' || meta.format === 'gif') {
    return { skipped: `${meta.format} は変換しない`, contentType, original };
  }
  const webp = await sharp(original)
    // fit: 'inside' で縦横比を保ったまま長い辺を上限に収める。withoutEnlargement で小さい画像は拡大しない
    .resize({ width: MAX_IMAGE_DIMENSION, height: MAX_IMAGE_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  const out = await sharp(webp).metadata();
  return { contentType, original, meta, webp, out };
}

// /api/upload と同じ形式のキー（{ミリ秒タイムスタンプ}-{英数字6文字}.webp）
const newKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

const kb = (n) => `${Math.round(n / 1024).toLocaleString()}KB`;

async function main() {
  console.log(APPLY ? '=== 移行を実行します（--apply）===' : '=== 下見（書き込みは行いません）===');
  const rowsByTable = await fetchRows();
  const usages = collectUsages(rowsByTable);
  if (usages.size === 0) {
    console.log('GitHub の画像 URL は見つかりませんでした。');
    return;
  }

  const results = [];
  for (const [url, uses] of usages) {
    try {
      const r = await convert(url);
      results.push({ url, uses, ...r });
    } catch (e) {
      results.push({ url, uses, error: String(e) });
    }
  }

  // 下見の結果を表示する
  let before = 0;
  let after = 0;
  for (const r of results) {
    console.log(`\n${r.url}`);
    for (const u of r.uses) console.log(`  使用箇所: ${u.label} の ${u.column}`);
    if (r.error) console.log(`  !! 取得・変換に失敗: ${r.error}`);
    else if (r.skipped) console.log(`  -- ${r.skipped}（${r.contentType}, ${kb(r.original.length)}）`);
    else {
      console.log(
        `  ${r.meta.format} ${r.meta.width}x${r.meta.height} ${kb(r.original.length)}` +
          ` → webp ${r.out.width}x${r.out.height} ${kb(r.webp.length)}`,
      );
      before += r.original.length;
      after += r.webp.length;
    }
  }
  const targets = results.filter((r) => r.webp);
  console.log(`\n合計: 画像 ${results.length} 件（変換対象 ${targets.length} 件）, ${kb(before)} → ${kb(after)}`);

  if (!APPLY) {
    console.log('\n下見のみのため、DB・R2・ファイルには何も書き込んでいません。');
    return;
  }
  if (results.some((r) => r.error)) {
    console.log('\n取得・変換に失敗した画像があるため、移行を中止しました（何も書き込んでいません）。');
    process.exitCode = 1;
    return;
  }

  // 1. バックアップ: 書き換える行の、書き換え前の全列を保存する（問題があればこれで元に戻せる）
  const touched = new Set(targets.flatMap((r) => r.uses.map((u) => `${u.table}:${u.id}`)));
  const backup = {};
  for (const { table } of TARGETS) {
    backup[table] = rowsByTable[table].filter((row) => touched.has(`${table}:${row.id}`));
  }
  mkdirSync('backups', { recursive: true });
  const backupPath = `backups/github-images-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`\nバックアップ: ${backupPath}`);

  // 2. R2 に置く（wrangler の CLI を使う。--remote で本番のバケットに書き込む）
  const tmp = join(tmpdir(), `github-images-${process.pid}`);
  mkdirSync(tmp, { recursive: true });
  const replacements = new Map(); // 旧 URL → 新 URL
  try {
    for (const r of targets) {
      const key = newKey();
      const file = join(tmp, key);
      writeFileSync(file, r.webp);
      execFileSync(
        'pnpm',
        [
          'exec',
          'wrangler',
          'r2',
          'object',
          'put',
          `${R2_BUCKET}/${key}`,
          '--file',
          file,
          '--content-type',
          'image/webp',
          '--remote',
        ],
        { stdio: 'pipe' },
      );
      replacements.set(r.url, `/api/images/${key}`);
      console.log(`R2 に保存: ${key}（${kb(r.webp.length)}）`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  // 3. DB の URL を置き換える。updated_at は変えない（画像の置き場所を変えただけで、記事の内容は更新していないため）
  const replaceAll = (text) => {
    if (text == null) return text;
    let out = text;
    for (const [from, to] of replacements) out = out.split(from).join(to);
    return out;
  };
  const queries = [];
  for (const { table, columns } of TARGETS) {
    for (const row of backup[table]) {
      const next = Object.fromEntries(columns.map((c) => [c, replaceAll(row[c])]));
      if (table === 'posts_table') {
        queries.push(
          sql`update posts_table set content = ${next.content}, thumbnail = ${next.thumbnail} where id = ${row.id}`,
        );
      } else if (table === 'history_events_table') {
        queries.push(
          sql`update history_events_table set content = ${next.content}, thumbnail = ${next.thumbnail} where id = ${row.id}`,
        );
      } else {
        queries.push(sql`update tags_table set image_url = ${next.image_url} where id = ${row.id}`);
      }
    }
  }
  // transaction でまとめて実行し、途中で失敗したらどの行も書き換わらないようにする
  await sql.transaction(queries);
  console.log(`DB を更新: ${queries.length} 行`);

  // 4. 記事投入スクリプトの元データも置き換える（再実行したときに GitHub の URL に戻らないように）
  const data = readFileSync(DATA_FILE, 'utf8');
  const replaced = replaceAll(data);
  if (replaced !== data) {
    writeFileSync(DATA_FILE, replaced);
    console.log(`${DATA_FILE} の URL も置き換えました`);
  }

  console.log('\n対応表（旧 URL → 新 URL）:');
  for (const [from, to] of replacements) console.log(`  ${from}\n    → ${to}`);
}

await main();
