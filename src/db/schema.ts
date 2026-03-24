// src/db/schema.ts
import { pgTable, uuid, varchar, text, timestamp, pgEnum, primaryKey, integer, index } from 'drizzle-orm/pg-core';

export const articlesGenreEnum = pgEnum('articles_genre_enum', ['blogs', 'products', 'books']);

export const articlesStatusEnum = pgEnum('articles_status_enum', ['draft', 'published', 'archived']);

export const postsTable = pgTable('posts_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  genre: articlesGenreEnum('genre').notNull(),
  slug: varchar('slug', { length: 20 }).notNull().unique(),
  title: varchar('title', { length: 27 }).notNull(),
  description: varchar('description', { length: 62 }).notNull(),
  content: text('content').notNull(),
  thumbnail: text('thumbnail'),
  status: articlesStatusEnum('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const tagsTable = pgTable(
  'tags_table',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 20 }).notNull().unique(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  // インデックスをソート順に並べ直す
  (table) => [index('tags_sort_order_idx').on(table.sortOrder)],
);

export const postTagsTable = pgTable(
  'post_tags_table',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => postsTable.id),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsTable.id),
  },
  // 複合主キーの定義
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })],
);

export type InsertPost = typeof postsTable.$inferInsert;
export type InsertTag = typeof tagsTable.$inferInsert;
export type InsertPostTag = typeof postTagsTable.$inferInsert;
export type SelectPost = typeof postsTable.$inferSelect;
export type SelectTag = typeof tagsTable.$inferSelect;
export type SelectPostTag = typeof postTagsTable.$inferSelect;
