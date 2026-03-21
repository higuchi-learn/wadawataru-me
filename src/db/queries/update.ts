import { db } from '../db';
import { postsTable, tagsTable, postTagsTable, SelectPost, SelectTag } from '../schema';
import { eq } from 'drizzle-orm';

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
  newContent: SelectPost["content"],
  newPublishedAt?: SelectPost["publishedAt"],
) {
  await db.update(postsTable)
    .set({
      title: newTitle,
      description: newDescription,
      thumbnail: newThumbnail,
      genre: newGenre,
      status: newStatus,
      content: newContent,
      updatedAt: new Date(),
      ...(newPublishedAt !== undefined ? { publishedAt: newPublishedAt } : {}),
    })
    .where(eq(postsTable.id, id));
}

export async function syncPostTags(postId: SelectPost["id"], tagNames: string[]) {
  await db.transaction(async (tx) => {
    await tx.delete(postTagsTable).where(eq(postTagsTable.postId, postId));

    for (const name of tagNames) {
      const existing = await tx
        .select({ id: tagsTable.id })
        .from(tagsTable)
        .where(eq(tagsTable.name, name));

      let tagId: string;
      if (existing.length > 0) {
        tagId = existing[0].id;
      } else {
        const created = await tx
          .insert(tagsTable)
          .values({ name, sortOrder: 0 })
          .returning({ id: tagsTable.id });
        tagId = created[0].id;
      }

      await tx.insert(postTagsTable).values({ postId, tagId });
    }
  });
}
