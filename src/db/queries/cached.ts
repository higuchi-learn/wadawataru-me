import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import type { SelectPost, SelectTag, SelectHistoryEvent } from '../schema';
import { getPostsList, getPostsCount, getTagsForGenre, getHistoryEventsList, getHistoryEventById } from './select';

// 公開ページ用の「作り置き」つきの DB 参照
//
// 公開ページを開くたびに Neon に問い合わせると、閲覧数がそのまま Neon の起きている時間になり、
// 無料枠（月 100 CU 時間）を使い切るおそれがある。休止明けは起きるのを待つ分だけ表示も遅くなる。
// そこで、問い合わせの結果を unstable_cache で R2（OpenNext の incremental cache）に保存し、
// 2回目以降は Neon に行かずに保存した結果を返す。
//
// 保存した結果は、管理画面で保存・公開したときに Server Action から updateTag(CACHE_TAGS.xxx) で捨てる
// （src/lib/revalidatePublic.ts）。捨てたあとの最初のアクセスで、もう一度 Neon を読んで保存し直す。
//
// 管理画面は常に最新の内容が必要なので、ここではなく select.ts の関数を直接使う。
// 記事ページ（/{genre}/[slug]）は、DB の結果ではなくページごと作り置きしているので、ここは使わない。

// 作り置きを捨てるときの目印（タグ）。どの関数の結果を捨てるかをまとめて指定する
export const CACHE_TAGS = {
  // 記事一覧・件数・ジャンルのタグ一覧（記事・タグの保存で捨てる）
  posts: 'public-posts',
  // 年表の出来事（年表・ラベルの保存で捨てる）
  history: 'public-history',
} as const;

// 作り置きは JSON にして保存されるため、Date は文字列になって戻ってくる。
// 表示側（formatDate など）は Date を前提にしているので、Date に戻す
function toDate(value: Date | string): Date;
function toDate(value: Date | string | null): Date | null;
function toDate(value: Date | string | null): Date | null {
  return value === null ? null : new Date(value);
}

// unstable_cache の第2引数（keyParts）は、作り置きを区別する名前。引数の値は自動で名前に足される
// revalidate を指定しないので、時間では古くならず、updateTag で捨てるまで使い続ける
const cachedPostsList = unstable_cache(
  (genre: SelectPost['genre'], tagIds: SelectTag['id'][], page: number) =>
    getPostsList(genre, 'published', tagIds, page),
  ['public-posts-list'],
  { tags: [CACHE_TAGS.posts] },
);

// 公開中の記事一覧（1ページ分）
export async function getPublishedPostsList(genre: SelectPost['genre'], tagIds: SelectTag['id'][], page: number) {
  const posts = await cachedPostsList(genre, tagIds, page);
  return posts.map((post) => ({ ...post, publishedAt: toDate(post.publishedAt), updatedAt: toDate(post.updatedAt) }));
}

// 公開中の記事の件数（ページ送りの総ページ数に使う）
export const getPublishedPostsCount = unstable_cache(
  (genre: SelectPost['genre'], tagIds: SelectTag['id'][]) => getPostsCount(genre, 'published', tagIds),
  ['public-posts-count'],
  { tags: [CACHE_TAGS.posts] },
);

// ジャンルに登録されたタグ（検索バーの選択肢）。Date を含まないのでそのまま返す
export const getPublicTagsForGenre = unstable_cache(
  (genre: SelectPost['genre']) => getTagsForGenre(genre),
  ['public-tags-for-genre'],
  { tags: [CACHE_TAGS.posts] },
);

type HistoryEventRow = Awaited<ReturnType<typeof getHistoryEventsList>>[number];
const reviveHistoryEvent = (event: HistoryEventRow): HistoryEventRow => ({
  ...event,
  createdAt: toDate(event.createdAt),
  updatedAt: toDate(event.updatedAt),
});

const cachedHistoryEventsList = unstable_cache(() => getHistoryEventsList(), ['public-history-events'], {
  tags: [CACHE_TAGS.history],
});

// 年表の出来事（すべて）
export async function getPublicHistoryEvents() {
  return (await cachedHistoryEventsList()).map(reviveHistoryEvent);
}

const cachedHistoryEventById = unstable_cache(
  (id: SelectHistoryEvent['id']) => getHistoryEventById(id),
  ['public-history-event'],
  { tags: [CACHE_TAGS.history] },
);

// 年表の出来事（1件）。generateMetadata とページ本体の両方から呼ばれるため、cache() で
// 1リクエストにつき作り置きを読むのも1回にする
export const getPublicHistoryEvent = cache(async (id: SelectHistoryEvent['id']) => {
  const event = await cachedHistoryEventById(id);
  return event ? reviveHistoryEvent(event) : null;
});
