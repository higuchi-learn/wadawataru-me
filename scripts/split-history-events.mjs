// 年表（history_events_table）で1件にまとまっていた出来事を分け、期間の線が出るようにするスクリプト
// - 「ピアサポーター / Matsuriba で LT 登壇」→ ピアサポーター（期間あり）と MatsuribaTech での LT 登壇の2件に分ける
// - 「愛知工業大学 電子情報工学専攻 入学」の概要からサークルの記述を外し、システム工学研究会への入部（継続中）を別の出来事にする
// - 「28Tech で LT 登壇・シス研で Web 勉強会を主催」（2025年6月 – 7月）→ 6月の 28Tech での LT 登壇と、7月の勉強会の2件に分ける
// - 「通信・電気系の国家資格を次々取得」（2023年8月 – 12月）→ 資格ごとに取得月の4件に分ける
// - 「複数企業のインターンに参加」→ Wantedly の職歴と同じく、企業ごとの出来事に分ける
//
// 実行: node scripts/set-history-periods.mjs のあとに node scripts/split-history-events.mjs
// （.env.local の DATABASE_URL に接続する。分割前のタイトルの出来事があるときだけ実行し、2回目以降は何もしない）
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

const PEER_SUPPORT_OLD_TITLE = 'ピアサポーター / Matsuriba で LT 登壇';
const ENTRANCE_TITLE = '愛知工業大学 電子情報工学専攻 入学';
const CLUB_TITLE = 'システム工学研究会に入部';
const TECH28_OLD_TITLE = '28Tech で LT 登壇・シス研で Web 勉強会を主催';
const LICENSES_OLD_TITLE = '通信・電気系の国家資格を次々取得';
const INTERNS_OLD_TITLE = '複数企業のインターンに参加';

const [peer] = await sql`select id from history_events_table where title = ${PEER_SUPPORT_OLD_TITLE}`;
const [club] = await sql`select id from history_events_table where title = ${CLUB_TITLE}`;
const [tech28] = await sql`select id from history_events_table where title = ${TECH28_OLD_TITLE}`;
const [licenses] = await sql`select id, badge_id from history_events_table where title = ${LICENSES_OLD_TITLE}`;
const [interns] = await sql`select id from history_events_table where title = ${INTERNS_OLD_TITLE}`;

// 同じ並び順の基準日の出来事は created_at 順に並ぶため、新しく入れる出来事は元の出来事のすぐ後ろに来る
const now = new Date();
const queries = [];

if (peer) {
  queries.push(sql`
    update history_events_table
    set title = 'ピアサポーターとして学習支援',
        summary = '専門科目で困っている学生が、先輩に気軽に質問できる学習支援を担当。',
        end_date = '2026-02-28',
        ongoing = false,
        updated_at = ${now}
    where id = ${peer.id}
  `);
  queries.push(sql`
    insert into history_events_table
      (era, sort_date, date_label, kind, badge_id, title, summary, content, thumbnail, created_at, updated_at)
    values
      ('university', '2025-05-01', '2025年5月', 'life', null, 'MatsuribaTech で LT 登壇',
       '東海の学生エンジニアコミュニティ MatsuribaTech で初めて LT に登壇。', '', null, ${now}, ${now})
  `);
}

if (!club) {
  queries.push(sql`
    update history_events_table
    set summary = 'HTML・CSS で初めての Web ページを制作。',
        updated_at = ${now}
    where title = ${ENTRANCE_TITLE} and summary like 'システム工学研究会に所属。%'
  `);
  queries.push(sql`
    insert into history_events_table
      (era, sort_date, date_label, kind, badge_id, title, summary, content, thumbnail, ongoing, created_at, updated_at)
    values
      ('university', '2024-04-01', '2024年4月', 'life', null, ${CLUB_TITLE},
       '情報系・技術系サークル（部員270名）。チーム開発やハッカソンに参加し、勉強会も主催。', '', null, true,
       ${new Date(now.getTime() + 1)}, ${new Date(now.getTime() + 1)})
  `);
}

if (tech28) {
  queries.push(sql`
    update history_events_table
    set title = '28Tech で LT 登壇',
        date_label = '2025年6月',
        summary = '28Tech vol.2（名駅 JR ゲートタワー）で自己紹介 LT に登壇。',
        updated_at = ${now}
    where id = ${tech28.id}
  `);
  queries.push(sql`
    insert into history_events_table
      (era, sort_date, date_label, kind, badge_id, title, summary, content, thumbnail, created_at, updated_at)
    values
      ('university', '2025-07-01', '2025年7月', 'life', null, 'シス研で HTML・CSS 勉強会を主催',
       'サークルで HTML・CSS の勉強会を開き、資料を Web ページとして公開。', '', null, ${now}, ${now})
  `);
}

if (licenses) {
  // 1件目は元の出来事を書き換え、残りは同じ「資格」ラベルで追加する。ほかの資格の出来事と同じく概要は付けない
  queries.push(sql`
    update history_events_table
    set title = '電気通信主任技術者（伝送交換） 合格',
        date_label = '2023年8月',
        summary = null,
        updated_at = ${now}
    where id = ${licenses.id}
  `);
  const rest = [
    { sortDate: '2023-10-01', dateLabel: '2023年10月', title: '第一級陸上無線技術士 合格' },
    { sortDate: '2023-11-01', dateLabel: '2023年11月', title: '消防設備士 甲種4類 合格' },
    { sortDate: '2023-12-01', dateLabel: '2023年12月', title: '工事担任者 総合通信 合格' },
  ];
  for (const e of rest) {
    queries.push(sql`
      insert into history_events_table
        (era, sort_date, date_label, kind, badge_id, title, summary, content, thumbnail, created_at, updated_at)
      values
        ('high_school', ${e.sortDate}, ${e.dateLabel}, 'tech', ${licenses.badge_id}, ${e.title}, null, '', null, ${now}, ${now})
    `);
  }
}

if (interns) {
  // Wantedly は新しい順に並んでいるので、古い順に並ぶ年表ではその逆順にする
  // 同じ月の出来事は created_at 順に並ぶため、配列の順に 1ms ずつずらして登録する
  const companies = [
    { sortDate: '2026-04-01', dateLabel: '2026年4月', title: 'ジーニー インターン', summary: '2日間の春インターンに参加。' },
    { sortDate: '2026-06-01', dateLabel: '2026年6月', title: 'GA technologies インターン', summary: null },
    { sortDate: '2026-06-01', dateLabel: '2026年6月', title: 'オープンハウスグループ インターン', summary: null },
    { sortDate: '2026-08-01', dateLabel: '2026年8月', title: 'クイック インターン', summary: '3日間のサマーインターンに参加。' },
    { sortDate: '2026-08-01', dateLabel: '2026年8月', title: 'SmartHR インターン', summary: '5日間のサマーインターンに参加。' },
    { sortDate: '2026-08-01', dateLabel: '2026年8月', title: 'レバレジーズ インターン', summary: '3日間のサマーインターンに参加。' },
    { sortDate: '2026-08-01', dateLabel: '2026年8月', title: 'PLAY インターン', summary: '3日間のサマーインターンに参加。' },
    { sortDate: '2026-09-01', dateLabel: '2026年9月', title: 'kubell インターン', summary: '10日間のサマーインターンに参加。' },
    { sortDate: '2026-09-01', dateLabel: '2026年9月', title: 'ディップ インターン', summary: '5日間の就業型サマーインターンに参加。' },
  ];
  queries.push(sql`delete from history_events_table where id = ${interns.id}`);
  companies.forEach((e, i) => {
    const createdAt = new Date(now.getTime() + 10 + i);
    queries.push(sql`
      insert into history_events_table
        (era, sort_date, date_label, kind, badge_id, title, summary, content, thumbnail, created_at, updated_at)
      values
        ('university', ${e.sortDate}, ${e.dateLabel}, 'life', null, ${e.title}, ${e.summary}, '', null, ${createdAt}, ${createdAt})
    `);
  });
}

if (queries.length === 0) {
  console.log('分割済みのため、何もしませんでした。');
  process.exit(0);
}

// 途中で失敗したときに片方だけ反映されないよう、まとめて transaction で実行する
await sql.transaction(queries);
if (peer) console.log('ピアサポーターと LT 登壇を分けました。');
if (!club) console.log('システム工学研究会への入部を追加しました。');
if (tech28) console.log('28Tech での LT 登壇と勉強会を分けました。');
if (licenses) console.log('通信・電気系の国家資格を資格ごとに分けました。');
if (interns) console.log('インターンを企業ごとに分けました。');
