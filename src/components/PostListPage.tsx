import { Suspense } from 'react';
import Link from 'next/link';
import { SearchBar, SelectPageBar, CardList } from '@/components';
import { GENRE_INFO, GENRE_LABEL_EN } from '@/components/GenreAbout';
import { PageHero } from '@/components/PageSection';
import type { Genre } from '@/components';
import type { CardData } from '@/components';
import { getPostsList, getPostsCount, getTagsForGenre, PAGE_SIZE } from '@/db/queries/select';
import { formatDate } from '@/lib/formatDate';

type Props = {
  genre: Genre;
  searchParams: { page?: string; tags?: string };
};

export default async function PostListPage({ genre, searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page ?? '1'));
  const tagNames = searchParams.tags?.split(',').filter(Boolean) ?? [];

  const allTags = await getTagsForGenre(genre);
  const tagIds = allTags.filter((t) => tagNames.includes(t.name)).map((t) => t.id);

  // 記事一覧と総件数を並列取得する
  const [posts, totalCount] = await Promise.all([
    // 公開側は常に 'published' 固定（下書き・アーカイブは表示しない）
    getPostsList(genre, 'published', tagIds, page),
    getPostsCount(genre, 'published', tagIds),
  ]);

  // Math.ceil で端数を切り上げ（21件・20件/ページなら2ページ必要）
  // Math.max(1, ...) で0件でも最低1ページになるようにする
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const cards: CardData[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    description: post.description,
    tags: post.tags,
    publishedAt: formatDate(post.publishedAt),
    updatedAt: formatDate(post.updatedAt),
    thumbnailUrl: post.thumbnail ?? undefined,
    href: `/${genre}/${post.slug}`,
  }));

  return (
    <>
      <PageHero en={GENRE_LABEL_EN[genre]} ja={GENRE_INFO[genre].title} lead={GENRE_INFO[genre].description} />
      {/* タグが 1 つもないジャンル（記事にタグを付けていない）では、検索バーを出しても選べるものがなく、
          押すと空の選択画面が開くだけになるので、バーごと出さない */}
      {allTags.length > 0 && (
        <div className="flex flex-col items-center pt-8 pb-2 px-4 w-full shrink-0">
          <Suspense>
            {/* getTagsList が返す全カラムをそのまま渡す（id・name・imageUrl・sortOrder） */}
            {/* max-w-full: 幅 365px 固定のままだと、365px より狭い画面（320px・360px の端末）で画面からはみ出し、
              横スクロールが出てしまう。親の幅（画面幅 - 左右の余白 16px ずつ）までは縮むようにする */}
            <SearchBar availableTags={allTags} className="w-[365px] max-w-full" />
          </Suspense>
        </div>
      )}
      <main className="flex-1 flex flex-col items-center gap-2.5 pb-16">
        {cards.length === 0 ? (
          // 記事が 0 件のとき。何も出さないと一覧の場所が真っ白になり、壊れているのか該当がないのか区別できない
          // タグで絞り込んだ結果が 0 件のときは、絞り込みを解除するボタンも出して、すぐ元に戻れるようにする
          <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
            <p className="text-sm text-[var(--lighttext)]">
              {tagIds.length > 0 ? '選択したタグに一致する記事はありません。' : 'まだ記事がありません。'}
            </p>
            {tagIds.length > 0 && (
              <Link
                href={`/${genre}`}
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
