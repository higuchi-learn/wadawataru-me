import { db } from '../db';
import { eq } from 'drizzle-orm';
import { InsertPost, postsTable, tagsTable, genreTagOrdersTable, InsertGenreTagOrder } from '../schema';

export async function createPost(data: InsertPost): Promise<string> {
  // returningで挿入したレコードのidを取得する
  const result = await db.insert(postsTable).values(data).returning({ id: postsTable.id });
  // post_tags_tableにタグの情報を挿入するために、記事のidが必要なため, idを返す必要がある
  return result[0].id;
}

export async function createTag(data: { name: string; imageUrl?: string | null }): Promise<string> {
  // .returning() で INSERT したレコードの id を取得する（タグ追加直後に ID が必要なため）
  const result = await db.insert(tagsTable).values(data).returning({ id: tagsTable.id });
  return result[0].id;
}

// タグ名で既存タグを検索する。存在しない場合は null を返す
// タグ追加時に「同名タグがすでに存在するか」を確認するために使う
// 存在すれば新規作成せずそのタグを再利用することで、同名タグの重複を防ぐ
export async function findTagByName(name: string): Promise<{ id: string; imageUrl: string | null } | null> {
  const result = await db
    .select({ id: tagsTable.id, imageUrl: tagsTable.imageUrl })
    .from(tagsTable)
    .where(eq(tagsTable.name, name));
  // .select() は常に配列を返すため、先頭要素が存在すれば返し、0件なら null を返す
  return result[0] ?? null;
}

// タグをジャンルに紐づける（genre_tag_orders にレコードを1行追加する）
// タグ本体の作成とは独立しているため、既存タグを別ジャンルに追加する際にも使える
// (genre, tag_id) が複合 PRIMARY KEY なので同じ組み合わせを INSERT しようとすると
// DB レベルで一意制約エラーが発生する → 呼び出し元でエラーを catch して重複を検知できる
export async function addTagToGenre(tagId: string, genre: InsertGenreTagOrder['genre'], sortOrder: number): Promise<void> {
  await db.insert(genreTagOrdersTable).values({ tagId, genre, sortOrder });
}
