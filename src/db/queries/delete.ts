import { db } from '../db';
import { eq } from 'drizzle-orm';
import { tagsTable, postTagsTable, SelectTag } from '../schema';

export async function deleteTagById(id: SelectTag["id"]) {
  // どちらかが失敗した場合にロールバックされるようにするため, トランザクションにする
  await db.transaction(async (tx) => {
  await tx.delete(postTagsTable)
    .where(eq(postTagsTable.tagId, id));

  await tx.delete(tagsTable)
    .where(eq(tagsTable.id, id));
});
}
