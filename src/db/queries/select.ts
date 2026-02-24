import { db } from "../db";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { postsTable, tagsTable, postTagsTable,  SelectPost, SelectTag } from "../schema";

export async function getTagsList() {
  return await db
    .select({
      id: tagsTable.id,
      name: tagsTable.name,
    })
    .from(tagsTable)
    .orderBy(asc(tagsTable.sortOrder));
}

export async function getPostsList(
  selectedGenre: SelectPost["genre"],
  selectedStatus: SelectPost["status"],
  selectedTagIds: SelectTag["id"][],
) {
  // タグ検索を行っていない場合は, シンプルなクエリで記事を取得
  if (selectedTagIds.length === 0) {
  return await db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      description: postsTable.description,
      thumbnail: postsTable.thumbnail,
      publishedAt: postsTable.publishedAt,
      updatedAt: postsTable.updatedAt,
      // タグを配列として取得するためのSQLクエリ
      // タグがない場合は空の配列を返すようにする
      tags: sql<string[]>`
        coalesce(array_agg(distinct ${tagsTable.name})
        filter (where ${tagsTable.name} is not null), '{}')
      `,
    })
    .from(postsTable)
    // タグを持たない記事はpost_tags_tableにレコードがないため, 内部結合で結合してしまうとタグを持たない記事が検索結果から漏れてしまう. そのため, タグ検索を行う場合も, タグを持たない記事も検索結果に含めるために, 左外部結合で結合する.
    .leftJoin(
      postTagsTable,
      eq(postsTable.id, postTagsTable.postId)
    )
    .leftJoin(
      tagsTable,
      eq(postTagsTable.tagId, tagsTable.id)
    )
    .where(
      and(
        eq(postsTable.genre, selectedGenre),
        eq(postsTable.status, selectedStatus),
      )
    )
    // タグの数だけ, 同じ記事が複数行返ってくるため, タグ以外のカラムはグループ化して1行にまとめる
    .groupBy(
      postsTable.id,
      postsTable.title,
      postsTable.description,
      postsTable.thumbnail,
      postsTable.publishedAt,
      postsTable.updatedAt
    )
    // 新しい順で並び替える
    .orderBy(desc(postsTable.publishedAt));
}
  return await db
  .select({
    id: postsTable.id,
    title: postsTable.title,
    description: postsTable.description,
    thumbnail: postsTable.thumbnail,
    publishedAt: postsTable.publishedAt,
    updatedAt: postsTable.updatedAt,
    tags: sql<string[]>`array_agg(distinct ${tagsTable.name})`,
  })
  .from(postsTable)
  // タグ検索を行う場合, そもそもタグを持たない記事は必要ない
  // posts_table.id = post_tags_table.post_id で結合
  .innerJoin(
    postTagsTable,
    eq(postsTable.id, postTagsTable.postId)
  )
  // tags_table.id = post_tags_table.tag_id で結合
  .innerJoin(
    tagsTable,
    eq(postTagsTable.tagId, tagsTable.id)
  )
  .where(
    and(
      eq(postsTable.genre, selectedGenre),
      eq(postsTable.status, selectedStatus),
      inArray(postTagsTable.tagId, selectedTagIds),
    )
  )
  .groupBy(
    postsTable.id,
    postsTable.title,
    postsTable.description,
    postsTable.thumbnail,
    postsTable.publishedAt,
    postsTable.updatedAt
  )
  // 検索で選択されたタグの数==記事の持つタグの数で絞る.
  .having(
    sql`count(distinct ${postTagsTable.tagId}) = ${selectedTagIds.length}`
  )
  .orderBy(desc(postsTable.publishedAt));
}
