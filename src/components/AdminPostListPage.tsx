import { Suspense } from 'react';
import Link from 'next/link';
import { GenreAbout, SelectPageBar, CardList } from '@/components';
import AdminSelectBar from '@/components/AdminSelectBar';
import type { Genre } from '@/components';
import type { CardData } from '@/components';
import { getPostsList, getPostsCount, getTagsForGenre, PAGE_SIZE } from '@/db/queries/select';
import { formatDate } from '@/lib/formatDate';
import type { SelectPost } from '@/db/schema';

// as const を付けることで配列の要素がリテラル型として扱われる（string[] ではなく readonly ['draft', ...]）
// これにより VALID_STATUSES[number] で 'draft' | 'published' | 'archived' という Union 型が得られる
const VALID_STATUSES = ['draft', 'published', 'archived'] as const;
type Status = (typeof VALID_STATUSES)[number];
// 0 件のときの案内に使う、状態の表示名（StatusBar のボタンと同じ呼び方）
const STATUS_LABEL: Record<Status, string> = { draft: '未公開', published: '公開中', archived: 'アーカイブ済' };

// URL の ?status= パラメータは文字列なので、想定外の値が来ても安全にデフォルト値に落とす
function toStatus(value: string | undefined): SelectPost['status'] {
  return VALID_STATUSES.includes(value as Status) ? (value as Status) : 'draft';
}

type Props = {
  genre: Genre;
  searchParams: { page?: string; tags?: string; status?: string };
};

export default async function AdminPostListPage({ genre, searchParams }: Props) {
  // URL の ?page= は文字列なので Number() で数値に変換し、1 未満にならないよう Math.max で保護する
  const page = Math.max(1, Number(searchParams.page ?? '1'));
  // ?tags=React,TypeScript のようにカンマ区切りで複数タグを受け取る
  // filter(Boolean) で空文字を除去する（?tags= のように値が空の場合の対策）
  const tagNames = searchParams.tags?.split(',').filter(Boolean) ?? [];
  const status = toStatus(searchParams.status);

  const allTags = await getTagsForGenre(genre);
  // タグ名からタグ ID に変換する（DB クエリは ID ベースで絞り込む）
  const tagIds = allTags.filter((t) => tagNames.includes(t.name)).map((t) => t.id);

  // 記事一覧と総件数を並列取得する
  // Promise.all で2つのクエリを同時に発行することで、直列で待つよりも速くなる
  const [posts, totalCount] = await Promise.all([
    getPostsList(genre, status, tagIds, page),
    getPostsCount(genre, status, tagIds),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const cards: CardData[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    description: post.description,
    tags: post.tags,
    publishedAt: formatDate(post.publishedAt),
    updatedAt: formatDate(post.updatedAt),
    thumbnailUrl: post.thumbnail ?? undefined,
    href: `/admin/${genre}/${post.id}`,
  }));

  return (
    <>
      <div className="flex flex-col items-center py-1 w-full shrink-0">
        <GenreAbout genre={genre} className="w-full" />
        {/* getTagsList が返す全カラムをそのまま渡す（id・name・imageUrl・sortOrder） */}
        <AdminSelectBar genre={genre} availableTags={allTags} className="w-full" />
      </div>
      <main className="flex-1 flex flex-col items-center gap-2.5">
        {cards.length === 0 ? (
          // 0 件のとき、何も出さないと一覧の場所が真っ白になり、壊れているのか該当がないのか区別できない
          // タグで絞り込んでいるときは、状態（status）だけを残して絞り込みを解除するリンクも出す
          <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
            <p className="text-sm text-[var(--lighttext)]">
              {tagIds.length > 0
                ? '選択したタグに一致する記事はありません。'
                : `${STATUS_LABEL[status]}の記事はありません。`}
            </p>
            {tagIds.length > 0 && (
              <Link
                href={`/admin/${genre}?status=${status}`}
                className="text-sm font-bold text-[var(--ogangetext)] bg-[var(--enableorange)] rounded-full px-5 py-2 hover:bg-[var(--onmouseorange)] transition-colors"
              >
                絞り込みを解除
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 items-center py-1 w-full">
            <Suspense>
              <SelectPageBar totalPages={totalPages} />
            </Suspense>
            <CardList cards={cards} />
            <Suspense>
              <SelectPageBar totalPages={totalPages} />
            </Suspense>
          </div>
        )}
      </main>
    </>
  );
}
