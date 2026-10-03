// src/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  primaryKey,
  integer,
  date,
  boolean,
} from 'drizzle-orm/pg-core';

// pgEnum で PostgreSQL の ENUM 型を定義する
// DB レベルで値を制限できるため、想定外の文字列が入るのを防げる
// Drizzle 側でも型として扱えるため TypeScript の補完も効く
export const articlesGenreEnum = pgEnum('articles_genre_enum', ['blogs', 'products', 'books']);

export const articlesStatusEnum = pgEnum('articles_status_enum', ['draft', 'published', 'archived']);

// pgTable でテーブル定義をする
// 第1引数が DB 上の実際のテーブル名、第2引数がカラム定義オブジェクト
export const postsTable = pgTable('posts_table', {
  // uuid().defaultRandom() で INSERT 時に PostgreSQL が自動で UUID を生成する
  id: uuid('id').defaultRandom().primaryKey(),
  genre: articlesGenreEnum('genre').notNull(),
  // varchar は最大文字数を DB レベルで制限する。Zod のバリデーションと合わせて二重で守る
  slug: varchar('slug', { length: 20 }).notNull().unique(),
  title: varchar('title', { length: 27 }).notNull(),
  description: varchar('description', { length: 62 }).notNull(),
  // text は文字数制限なし。本文のように長い文字列に使う
  content: text('content').notNull(),
  // thumbnail は任意（null 許容）なので .notNull() を付けない
  thumbnail: text('thumbnail'),
  status: articlesStatusEnum('status').notNull(),
  // { withTimezone: true } でタイムゾーン付きタイムスタンプ（timestamptz）になる
  // タイムゾーンなしだと UTC で保存されるが、取り出し時に意図しないズレが起きる可能性がある
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  // publishedAt は未公開の記事では null になるため null 許容
  publishedAt: timestamp('published_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

// タグの実体（名前・画像）を管理するテーブル
// 「TypeScript というタグが存在する」という事実だけをここに持つ
// どのジャンルに属するか・何番目に表示するかは genre_tag_orders テーブルが担当する
export const tagsTable = pgTable('tags_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 20 }).notNull().unique(),
  // タグに紐づく画像の R2 URL。未設定の場合は null
  imageUrl: text('image_url'),
});

// ジャンルごとのタグ所属と表示順を管理するテーブル
//
// 設計のポイント：タグの「実体」と「ジャンルでの位置」を分離している
//   tags_table: TypeScript というタグが "存在する"
//   genre_tag_orders: TypeScript を products の 3番目、books の 5番目に置く
//
// PRIMARY KEY を (genre, tag_id) の複合キーにすることで
// 同じタグを同じジャンルに2重登録できないようにDB レベルで保証する
// （例: products + TypeScript の組み合わせは1行しか持てない）
//
// tag_id は tags_table.id への外部キーなので、タグを削除する前に
// このテーブルの関連行を先に削除しないと外部キー違反になる
export const genreTagOrdersTable = pgTable(
  'genre_tag_orders',
  {
    genre: articlesGenreEnum('genre').notNull(),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsTable.id),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.genre, table.tagId] })],
);

export const postTagsTable = pgTable(
  'post_tags_table',
  {
    // references() で外部キー制約を定義する（参照先テーブルのカラムを指定）
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsTable.id),
  },
  // 複合主キー: postId + tagId の組み合わせをユニークにする
  // 同じ記事に同じタグを2回付けられないようにする
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })],
);

// 完全非公開の日記テーブル（公開用ルートは一切用意せず /admin 配下でのみ参照・更新する）
// date を主キーにすることで「1日1件」を DB レベルで保証する
// （同じ日付で2回 INSERT しようとすると一意制約違反になるため、upsert で同じ日付なら上書きする運用にする）
export const diaryEntriesTable = pgTable('diary_entries_table', {
  // mode: 'string' にすることで JS の Date に変換されず 'yyyy-mm-dd' 文字列のまま扱える
  // タイムゾーン変換によるズレを避けたいため（この日付は表示用の暦日であり、時刻情報を持たない）
  date: date('date', { mode: 'string' }).primaryKey(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

// 年表（/history）の時代区分。年表上ではこの単位で見出しを挟んでグループ化する
export const historyEraEnum = pgEnum('history_era_enum', [
  'elementary',
  'junior_high',
  'high_school',
  'university',
  'career',
]);

// 年表の出来事の分類。年表上のドット・日付の色分けに使う（life = 学校・活動・仕事、tech = 技術・開発・資格）
export const historyKindEnum = pgEnum('history_kind_enum', ['life', 'tech']);

// 年表の出来事に付けるラベル（「受賞」「資格」など）のマスタ
// PostgreSQL の ENUM 型だと値を増やすたびにマイグレーションが必要になるため、
// 管理画面から自由に追加・名前変更・削除できるようテーブルで持つ
export const historyBadgesTable = pgTable('history_badges_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 10 }).notNull().unique(),
});

// 年表（/history）の出来事テーブル
// 表示用の日付（dateLabel）と並び順用の日付（sortDate）を分けているのは、
// 「中学時代」「2025年夏」のように暦日で表せない時期も、任意の位置に並べられるようにするため
export const historyEventsTable = pgTable('history_events_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  era: historyEraEnum('era').notNull(),
  // mode: 'string' で 'yyyy-mm-dd' 文字列のまま扱う（日記と同じくタイムゾーン変換によるズレを避けるため）
  sortDate: date('sort_date', { mode: 'string' }).notNull(),
  dateLabel: varchar('date_label', { length: 20 }).notNull(),
  // 期間のある出来事（在籍・アルバイトなど）の終了日。年表ではブランチのように本線から分かれた線で期間を表す
  // 期間のない出来事と、現在も続いている出来事（ongoing = true）は null
  endDate: date('end_date', { mode: 'string' }),
  // 現在も続いている出来事なら true。年表では線が終端まで伸び続ける
  ongoing: boolean('ongoing').notNull().default(false),
  kind: historyKindEnum('kind').notNull(),
  // ラベル（history_badges_table）への参照。付けない出来事は null
  // onDelete: 'set null' により、ラベルを削除するとそのラベルが付いていた出来事は「ラベルなし」になる
  badgeId: uuid('badge_id').references(() => historyBadgesTable.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 40 }).notNull(),
  // 年表上に表示する短い説明。null 許容
  summary: varchar('summary', { length: 120 }),
  // 詳細ページ（/history/[id]）に表示する Markdown 本文。空文字なら詳細ページへのリンクを出さない
  content: text('content').notNull().default(''),
  // 年表上に表示する画像の R2 URL。未設定の場合は null
  thumbnail: text('thumbnail'),
  // 制作物に関する出来事なら、その制作物の記事（posts_table.slug）。年表のカードから記事へリンクする
  // 制作物の詳細は記事に一本化し、年表・受賞歴・トップページのどこから押しても同じ記事に行くようにするため
  // 外部キーにしないのは、記事の slug を変えたり記事を消したりしても年表の出来事は残せるようにするため（リンク切れは 404 になるだけ）
  // 長さは posts_table.slug と揃えている
  productSlug: varchar('product_slug', { length: 20 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

// $inferInsert / $inferSelect でテーブル定義から TypeScript の型を自動生成する
// カラムを追加・変更したときに型も自動で追従するため、手書きの型定義が不要になる
export type InsertPost = typeof postsTable.$inferInsert;
export type InsertTag = typeof tagsTable.$inferInsert;
export type InsertPostTag = typeof postTagsTable.$inferInsert;
export type InsertGenreTagOrder = typeof genreTagOrdersTable.$inferInsert;
export type InsertDiaryEntry = typeof diaryEntriesTable.$inferInsert;
export type InsertHistoryEvent = typeof historyEventsTable.$inferInsert;
export type InsertHistoryBadge = typeof historyBadgesTable.$inferInsert;
export type SelectPost = typeof postsTable.$inferSelect;
export type SelectTag = typeof tagsTable.$inferSelect;
export type SelectPostTag = typeof postTagsTable.$inferSelect;
export type SelectGenreTagOrder = typeof genreTagOrdersTable.$inferSelect;
export type SelectDiaryEntry = typeof diaryEntriesTable.$inferSelect;
export type SelectHistoryEvent = typeof historyEventsTable.$inferSelect;
export type SelectHistoryBadge = typeof historyBadgesTable.$inferSelect;
