import { db } from '../db';
import { postsTable, tagsTable, postTagsTable, SelectPost, SelectTag } from '../schema';
import { and, eq, inArray, sql, desc } from 'drizzle-orm';

export async function updateTagNameById(id: SelectTag["id"], newName: SelectTag["name"]) {
  await db.update(tagsTable)
    .set({ name: newName })
    .where(eq(tagsTable.id, id));
}

export async function updateTagsSortOrder(tagIds: SelectTag["id"][]) {
  await db.transaction(async (tx) => {
  for (let i = 0; i < tagIds.length; i++) {
    await tx.update(tagsTable)
      .set({ sortOrder: i })
      .where(eq(tagsTable.id, tagIds[i]));
  }
});
}

export async function updatePostPublishedAtById(id: SelectPost["id"]) {
  await db.update(postsTable)
    .set({ publishedAt: new Date() })
    .where(eq(postsTable.id, id));
}

export async function updatePostById(
  id: SelectPost["id"],
  newTitle: SelectPost["title"],
  newDescription: SelectPost["description"],
  newThumbnail: SelectPost["thumbnail"],
  newGenre: SelectPost["genre"],
  newStatus: SelectPost["status"],
) {
  await db.update(postsTable)
    .set({
      title: newTitle,
      description: newDescription,
      thumbnail: newThumbnail,
      genre: newGenre,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(postsTable.id, id));
}
