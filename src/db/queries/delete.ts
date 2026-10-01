import { db } from '../db';
import { and, eq } from 'drizzle-orm';
import {
  tagsTable,
  postTagsTable,
  genreTagOrdersTable,
  historyEventsTable,
  historyBadgesTable,
  SelectTag,
  SelectGenreTagOrder,
  SelectHistoryEvent,
  SelectHistoryBadge,
} from '../schema';

// タグを指定ジャンルからのみ除外する（タグ本体と他ジャンルへの紐付けは残す）
// 「制作物から TypeScript を消したいが読書記録には残したい」という操作に対応する
export async function removeTagFromGenre(id: SelectTag['id'], genre: SelectGenreTagOrder['genre']): Promise<void> {
  // WHERE に genre と tagId の両方を指定することで、
  // 「このジャンルとこのタグの組み合わせ」だけを削除する
  // genre だけを指定するとそのジャンルの全タグが消え、
  // tagId だけを指定すると全ジャンルから消えてしまうため両方必要
  await db
    .delete(genreTagOrdersTable)
    .where(and(eq(genreTagOrdersTable.tagId, id), eq(genreTagOrdersTable.genre, genre)));
}

export async function deleteTagById(id: SelectTag['id']) {
  // 削除する順序が重要：FK 参照元のテーブルを先に削除しなければならない
  //
  // テーブル間の依存関係:
  //   post_tags_table.tag_id → tags_table.id
  //   genre_tag_orders.tag_id → tags_table.id
  //
  // tags_table を先に消そうとすると FK 違反エラーになるため、
  // 参照している2つのテーブルを先にクリアしてから本体を削除する

  // ① この ID を持つタグが紐づいた記事の中間テーブルをすべて削除する
  await db.delete(postTagsTable).where(eq(postTagsTable.tagId, id));
  // ② 全ジャンルの並び順テーブルから削除する
  await db.delete(genreTagOrdersTable).where(eq(genreTagOrdersTable.tagId, id));
  // ③ タグ本体を削除する（①②が終わってから実行するため FK 違反は起きない）
  await db.delete(tagsTable).where(eq(tagsTable.id, id));
}

// 年表の出来事を削除する。他テーブルから参照されていないため、そのまま消せる
export async function deleteHistoryEventById(id: SelectHistoryEvent['id']): Promise<void> {
  await db.delete(historyEventsTable).where(eq(historyEventsTable.id, id));
}

// 年表のラベルを削除する
// 外部キーが onDelete: 'set null' なので、このラベルが付いていた出来事は DB 側で自動的に「ラベルなし」になる
export async function deleteHistoryBadgeById(id: SelectHistoryBadge['id']): Promise<void> {
  await db.delete(historyBadgesTable).where(eq(historyBadgesTable.id, id));
}
