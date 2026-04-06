import { db } from '../db';
import { postsTable, tagsTable, postTagsTable, SelectPost, SelectTag } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateTagNameById(id: SelectTag['id'], newName: SelectTag['name']) {
  await db.update(tagsTable).set({ name: newName }).where(eq(tagsTable.id, id));
}

export async function updateTagsSortOrder(tagIds: SelectTag['id'][]) {
  // transaction() で複数の UPDATE をまとめて実行する
  // 途中でエラーが発生すると自動的にロールバックされるため、
  // 一部だけ更新されて並び順が壊れる状態を防げる
  await db.transaction(async (tx) => {
    for (let i = 0; i < tagIds.length; i++) {
      // 配列のインデックスをそのまま sortOrder として使う（0始まり）
      await tx.update(tagsTable).set({ sortOrder: i }).where(eq(tagsTable.id, tagIds[i]));
    }
  });
}

export async function updatePostPublishedAtById(id: SelectPost['id']) {
  await db.update(postsTable).set({ publishedAt: new Date() }).where(eq(postsTable.id, id));
}

export async function updatePostById(
  id: SelectPost['id'],
  newTitle: SelectPost['title'],
  newDescription: SelectPost['description'],
  newThumbnail: SelectPost['thumbnail'],
  newGenre: SelectPost['genre'],
  newStatus: SelectPost['status'],
  newContent: SelectPost['content'],
  newPublishedAt?: SelectPost['publishedAt'],
) {
  await db
    .update(postsTable)
    .set({
      title: newTitle,
      description: newDescription,
      thumbnail: newThumbnail,
      genre: newGenre,
      status: newStatus,
      content: newContent,
      updatedAt: new Date(),
      // newPublishedAt が渡されたときだけ publishedAt を上書きする
      // undefined のときはスプレッドで何も追加されないため、DB の値がそのまま保たれる
      ...(newPublishedAt !== undefined ? { publishedAt: newPublishedAt } : {}),
    })
    .where(eq(postsTable.id, id));
}

export async function syncPostTags(postId: SelectPost['id'], tagNames: string[]) {
  // 差分更新（追加・削除の特定）は複雑になるため、一度全削除してから再挿入する方式をとる
  // トランザクションで囲むことで削除後の再挿入が失敗した場合もロールバックされる
  await db.transaction(async (tx) => {
    // この記事に紐づくタグ中間テーブルのレコードをすべて削除する
    await tx.delete(postTagsTable).where(eq(postTagsTable.postId, postId));

    for (const name of tagNames) {
      // タグ名で既存タグを検索する（タグは記事をまたいで共有される）
      const existing = await tx.select({ id: tagsTable.id }).from(tagsTable).where(eq(tagsTable.name, name));

      let tagId: string;
      if (existing.length > 0) {
        // すでに存在するタグはそのIDを使い回す（重複作成しない）
        tagId = existing[0].id;
      } else {
        // 新しいタグ名なら tags_table に追加する
        // .returning() で INSERT したレコードの id を取得できる（PostgreSQL のみ対応）
        const created = await tx.insert(tagsTable).values({ name, sortOrder: 0 }).returning({ id: tagsTable.id });
        tagId = created[0].id;
      }

      // 記事とタグを紐づける中間テーブルにレコードを追加する
      await tx.insert(postTagsTable).values({ postId, tagId });
    }
  });
}
