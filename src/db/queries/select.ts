import { db } from '../db';
import { and, asc, desc, eq, inArray, max, ne, sql } from 'drizzle-orm';
import { postsTable, tagsTable, postTagsTable, genreTagOrdersTable, SelectPost, SelectTag } from '../schema';

export const PAGE_SIZE = 20;

export async function getPostById(slug: SelectPost['slug']) {
  // .select({ ... }) で取得したいカラムだけを指定する（不要なカラムを取得しない）
  // select() を引数なしで呼ぶと全カラムが返ってくるが、必要なものだけに絞ることで
  // ネットワーク転送量とレスポンスオブジェクトのサイズを小さくできる
  const rows = await db
    .select({
      id: postsTable.id,
      title: postsTable.title,
      description: postsTable.description,
      content: postsTable.content,
      publishedAt: postsTable.publishedAt,
      updatedAt: postsTable.updatedAt,
    })
    .from(postsTable)
    // and() で複数の WHERE 条件を AND 結合する
    // slug が一致 かつ status が published の記事だけを取得する
    // 未公開・アーカイブ済みの記事は公開 URL からアクセスできないようにする
    .where(and(eq(postsTable.slug, slug), eq(postsTable.status, 'published')));
  // .select() は常に配列を返す（0件の場合は空配列）
  // rows[0] ?? null で「見つかった最初の1件」か「null」を返す
  return rows[0] ?? null;
}

export async function getPostByIdForAdmin(id: SelectPost['id']) {
  // 管理画面用は status に関係なく取得する（下書き・アーカイブも編集できる必要があるため）
  // また slug / thumbnail / status など編集フォームに必要なカラムも含める
  const rows = await db
    .select({
      id: postsTable.id,
      slug: postsTable.slug,
      title: postsTable.title,
      description: postsTable.description,
      content: postsTable.content,
      thumbnail: postsTable.thumbnail,
      status: postsTable.status,
      publishedAt: postsTable.publishedAt,
      updatedAt: postsTable.updatedAt,
    })
    .from(postsTable)
    .where(eq(postsTable.id, id));
  return rows[0] ?? null;
}

export async function getTagsByPostId(postId: SelectPost['id']) {
  // post_tags_table（中間テーブル）を起点に tags_table を JOIN して
  // postId に紐づくタグ名を取得する
  return await db
    .select({ name: tagsTable.name })
    .from(postTagsTable)
    .innerJoin(tagsTable, eq(postTagsTable.tagId, tagsTable.id))
    .where(eq(postTagsTable.postId, postId));
}

// 指定ジャンルに登録されたタグを sortOrder 昇順で取得する
// FROM を genreTagOrdersTable にして tags_table を JOIN する理由：
//   並び順と所属は genre_tag_orders が持っているので、そこを起点にすることで
//   「このジャンルに登録されているタグだけ」を自動的に絞り込める
//   FROM tags_table にすると全タグが対象になり、WHERE で絞る必要が生じる
// innerJoin を使う理由：
//   genre_tag_orders に存在しないタグ（どのジャンルにも属していない）は
//   結果に含める必要がないため INNER JOIN で OK
export async function getTagsForGenre(genre: SelectPost['genre']) {
  return await db
    .select({
      id: tagsTable.id,
      name: tagsTable.name,
      imageUrl: tagsTable.imageUrl,
    })
    .from(genreTagOrdersTable)
    .innerJoin(tagsTable, eq(genreTagOrdersTable.tagId, tagsTable.id))
    .where(eq(genreTagOrdersTable.genre, genre))
    .orderBy(asc(genreTagOrdersTable.sortOrder));
}

// 指定ジャンルの sortOrder 最大値を取得する
// 新しいタグを追加するとき、既存タグの末尾に挿入するために maxOrder + 1 を sortOrder として使う
// タグが1件もない場合 MAX() は NULL を返すため ?? -1 で保護している
// （-1 + 1 = 0 になり、最初のタグが sortOrder = 0 で追加される）
export async function getMaxGenreTagSortOrder(genre: SelectPost['genre']): Promise<number> {
  const result = await db
    .select({ maxOrder: max(genreTagOrdersTable.sortOrder) })
    .from(genreTagOrdersTable)
    .where(eq(genreTagOrdersTable.genre, genre));
  return result[0].maxOrder ?? -1;
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  // slug の重複チェック。編集時は自分自身の ID を除外する必要がある
  // excludeId がある場合は「同じ slug を持つ、自分以外のレコード」を探す
  // excludeId がない場合（新規作成時）は同じ slug を持つレコードが1件でもあれば重複とみなす
  const rows = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(excludeId ? and(eq(postsTable.slug, slug), ne(postsTable.id, excludeId)) : eq(postsTable.slug, slug));
  return rows.length > 0;
}

export async function getPostsList(
  selectedGenre: SelectPost['genre'],
  selectedStatus: SelectPost['status'],
  selectedTagIds: SelectTag['id'][],
  page: number = 1,
  pageSize: number = PAGE_SIZE,
) {
  const offset = (page - 1) * pageSize;

  // タグ検索を行っていない場合は, シンプルなクエリで記事を取得
  if (selectedTagIds.length === 0) {
    return await db
      .select({
        id: postsTable.id,
        slug: postsTable.slug,
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
      .leftJoin(postTagsTable, eq(postsTable.id, postTagsTable.postId))
      .leftJoin(tagsTable, eq(postTagsTable.tagId, tagsTable.id))
      .where(and(eq(postsTable.genre, selectedGenre), eq(postsTable.status, selectedStatus)))
      // タグの数だけ, 同じ記事が複数行返ってくるため, タグ以外のカラムはグループ化して1行にまとめる
      .groupBy(
        postsTable.id,
        postsTable.slug,
        postsTable.title,
        postsTable.description,
        postsTable.thumbnail,
        postsTable.publishedAt,
        postsTable.updatedAt,
      )
      // 新しい順で並び替える
      .orderBy(desc(postsTable.publishedAt))
      .limit(pageSize)
      .offset(offset);
  }

  return await db
    .select({
      id: postsTable.id,
      slug: postsTable.slug,
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
    .innerJoin(postTagsTable, eq(postsTable.id, postTagsTable.postId))
    // tags_table.id = post_tags_table.tag_id で結合
    .innerJoin(tagsTable, eq(postTagsTable.tagId, tagsTable.id))
    .where(
      and(
        eq(postsTable.genre, selectedGenre),
        eq(postsTable.status, selectedStatus),
        inArray(postTagsTable.tagId, selectedTagIds),
      ),
    )
    .groupBy(
      postsTable.id,
      postsTable.slug,
      postsTable.title,
      postsTable.description,
      postsTable.thumbnail,
      postsTable.publishedAt,
      postsTable.updatedAt,
    )
    // 検索で選択されたタグの数==記事の持つタグの数で絞る.
    .having(sql`count(distinct ${postTagsTable.tagId}) = ${selectedTagIds.length}`)
    .orderBy(desc(postsTable.publishedAt))
    .limit(pageSize)
    .offset(offset);
}

export async function getPostsCount(
  selectedGenre: SelectPost['genre'],
  selectedStatus: SelectPost['status'],
  selectedTagIds: SelectTag['id'][],
): Promise<number> {
  if (selectedTagIds.length === 0) {
    // count(*) は PostgreSQL の集計関数。マッチした全行数を返す
    // PostgreSQL の count は bigint で返ってくるため、cast で int に変換する
    // sql<number>`...` の型引数は TypeScript 上の型ヒントで、実際のキャストは SQL 側が行う
    const result = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(postsTable)
      .where(and(eq(postsTable.genre, selectedGenre), eq(postsTable.status, selectedStatus)));
    return result[0].count;
  }

  // タグフィルタあり: getPostsList と同じ条件で絞った結果の件数を取得する
  // サブクエリ（.as('sub')）を使うことで「条件に一致する記事の ID 一覧」を先に作り
  // その件数を count する二段構えのクエリになっている
  // これにより getPostsList と件数が一致することを保証できる
  const sub = db
    .select({ id: postsTable.id })
    .from(postsTable)
    .innerJoin(postTagsTable, eq(postsTable.id, postTagsTable.postId))
    .innerJoin(tagsTable, eq(postTagsTable.tagId, tagsTable.id))
    .where(
      and(
        eq(postsTable.genre, selectedGenre),
        eq(postsTable.status, selectedStatus),
        inArray(postTagsTable.tagId, selectedTagIds),
      ),
    )
    .groupBy(postsTable.id)
    .having(sql`count(distinct ${postTagsTable.tagId}) = ${selectedTagIds.length}`)
    // .as('sub') でサブクエリに名前を付ける（FROM 句で参照するために必要）
    .as('sub');

  const result = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(sub);
  return result[0].count;
}
