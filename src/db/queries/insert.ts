import { db } from "../db";
import { InsertPost, InsertTag, InsertPostTag, postsTable, tagsTable, postTagsTable } from "../schema";

export async function createPost(data: InsertPost) {
  await db.insert(postsTable).values(data);
}

export async function createTag(data: InsertTag) {
  await db.insert(tagsTable).values(data);
}

export async function createPostTag(data: InsertPostTag) {
  await db.insert(postTagsTable).values(data);
}
