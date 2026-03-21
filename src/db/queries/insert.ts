import { db } from "../db";
import { InsertPost, InsertTag, InsertPostTag, postsTable, tagsTable, postTagsTable } from "../schema";

export async function createPost(data: InsertPost): Promise<string> {
  // returningで挿入したレコードのidを取得する
  const result = await db.insert(postsTable).values(data).returning({ id: postsTable.id });
  // post_tags_tableにタグの情報を挿入するために、記事のidが必要なため, idを返す必要がある
  return result[0].id;
}

export async function createTag(data: InsertTag) {
  await db.insert(tagsTable).values(data);
}

export async function createPostTag(data: InsertPostTag) {
  await db.insert(postTagsTable).values(data);
}
