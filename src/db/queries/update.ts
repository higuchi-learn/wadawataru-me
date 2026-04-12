import { db } from '../db';
import { postsTable, tagsTable, postTagsTable, genreTagOrdersTable, SelectPost, SelectTag, SelectGenreTagOrder } from '../schema';
import { and, eq } from 'drizzle-orm';


export async function updateTagById(id: SelectTag['id'], name: SelectTag['name'], imageUrl: SelectTag['imageUrl']) {
  // タグ名と画像URLをまとめて更新する（編集モーダルからの保存で使う）
  await db.update(tagsTable).set({ name, imageUrl }).where(eq(tagsTable.id, id));
}

export async function updateGenreTagsSortOrder(genre: SelectGenreTagOrder['genre'], tagIds: SelectTag['id'][]) {
  // 配列のインデックス（0始まり）をそのまま sortOrder として保存する
  // ドラッグ後の新しい並び順が tagIds に入ってくるので、その順番をDBに書き込む
  //
  // WHERE に genre と tagId の両方を指定する理由：
  //   genre だけを指定すると他のジャンルの sortOrder まで変わってしまう
  //   tagId だけを指定すると他のジャンルの同タグの sortOrder まで変わってしまう
  //   両方を AND で指定することで「このジャンルのこのタグ」だけを更新できる
  //
  // neon-http は HTTP バッチ経由のため db.transaction() を使わず順次 UPDATE する
  // （transaction() はTCP接続が必要な操作で、HTTP ドライバでは動作しない）
  for (let i = 0; i < tagIds.length; i++) {
    await db
      .update(genreTagOrdersTable)
      .set({ sortOrder: i })
      .where(and(eq(genreTagOrdersTable.genre, genre), eq(genreTagOrdersTable.tagId, tagIds[i])));
  }
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
  // neon-http は HTTP バッチ経由のため transaction() は使わず順次実行する
  await db.delete(postTagsTable).where(eq(postTagsTable.postId, postId));

  for (const name of tagNames) {
    // タグ名で既存タグを検索する（タグは記事をまたいで共有される）
    const existing = await db.select({ id: tagsTable.id }).from(tagsTable).where(eq(tagsTable.name, name));

    let tagId: string;
    if (existing.length > 0) {
      // すでに存在するタグはそのIDを使い回す（重複作成しない）
      tagId = existing[0].id;
    } else {
      // 新しいタグ名なら tags_table に追加する
      const created = await db.insert(tagsTable).values({ name }).returning({ id: tagsTable.id });
      tagId = created[0].id;
    }

    // 記事とタグを紐づける中間テーブルにレコードを追加する
    await db.insert(postTagsTable).values({ postId, tagId });
  }
}
