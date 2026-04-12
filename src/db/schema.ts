// src/db/schema.ts
import { pgTable, uuid, varchar, text, timestamp, pgEnum, primaryKey, integer } from 'drizzle-orm/pg-core';

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
    tagId: uuid('tag_id').notNull().references(() => tagsTable.id),
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

// $inferInsert / $inferSelect でテーブル定義から TypeScript の型を自動生成する
// カラムを追加・変更したときに型も自動で追従するため、手書きの型定義が不要になる
export type InsertPost = typeof postsTable.$inferInsert;
export type InsertTag = typeof tagsTable.$inferInsert;
export type InsertPostTag = typeof postTagsTable.$inferInsert;
export type InsertGenreTagOrder = typeof genreTagOrdersTable.$inferInsert;
export type SelectPost = typeof postsTable.$inferSelect;
export type SelectTag = typeof tagsTable.$inferSelect;
export type SelectPostTag = typeof postTagsTable.$inferSelect;
export type SelectGenreTagOrder = typeof genreTagOrdersTable.$inferSelect;
