// 年表（history_events_table）の既存の出来事に、Wantedly に書いてある期間（終了日・継続中）を設定するスクリプト
// 0008_history_periods のマイグレーションを適用したあとに一度だけ実行する
//
// 実行: node scripts/set-history-periods.mjs
// （.env.local の DATABASE_URL に接続する。タイトルで出来事を探し、まだ期間が設定されていないものだけ更新する）
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

// endDate: null かつ ongoing: true は「現在も続いている」
// dateLabel を指定したものは、期間の終わりを線で表すようになるので表示用の日付から終わりを外す
const periods = [
  { title: '生徒会役員に就任', endDate: '2023-09-30', ongoing: false },
  { title: 'セブン‐イレブンでアルバイト開始', endDate: '2024-03-31', ongoing: false },
  { title: '全国高校総合文化祭 生徒実行委員に', endDate: '2023-09-30', ongoing: false },
  { title: 'エクステンションセンター 地域連携スタッフ', endDate: null, ongoing: true },
  { title: '複数企業のインターンに参加', endDate: '2026-09-30', ongoing: false, dateLabel: '2026年4月' },
  { title: 'コムスクエア インターン', endDate: null, ongoing: true },
];

const sql = neon(process.env.DATABASE_URL);

for (const p of periods) {
  const rows = await sql`
    update history_events_table
    set end_date = ${p.endDate},
        ongoing = ${p.ongoing},
        date_label = coalesce(${p.dateLabel ?? null}, date_label),
        updated_at = now()
    where title = ${p.title} and end_date is null and ongoing = false
    returning id
  `;
  console.log(`${rows.length > 0 ? '更新しました' : '対象なし（見つからないか設定済み）'}: ${p.title}`);
}
