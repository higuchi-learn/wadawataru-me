import { Suspense } from 'react';
import { GENRE_INFO, GENRE_LABEL_EN } from '@/components/GenreAbout';
import { PageHero } from '@/components/PageSection';
import { PublicPostListFromUrl, PublicPostListView } from '@/components/PublicPostList';
import type { Genre } from '@/components';
import type { CardData } from '@/components';
// 公開ページなので、DB の結果を作り置きする版を使う（管理画面の一覧は select.ts を直接使う）
import { getAllPublishedPosts, getPublicTagsForGenre } from '@/db/queries/cached';
import { formatDate } from '@/lib/formatDate';

// 公開ページの記事一覧（/blogs・/products・/books）
//
// URL の検索パラメータ（?tags= ?page=）を読まないので、ページごと作り置き（R2）にできる。
// そのジャンルの公開中の記事をすべて渡し、絞り込みとページ送りはブラウザ側（PublicPostList）で行う。
// 作り置きなのでリンク先の先読みが効き、記事ページなどから一覧へ戻るときもすぐ表示される
// 管理画面で記事やタグを保存すると、作り置きを捨てて作り直す（src/lib/revalidatePublic.ts）
export default async function PostListPage({ genre }: { genre: Genre }) {
  const [allTags, posts] = await Promise.all([getPublicTagsForGenre(genre), getAllPublishedPosts(genre)]);

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
      {/* URL を読む部品（PublicPostListFromUrl）はブラウザでだけ描画される。
          サーバー側では fallback の「絞り込みなし・1ページ目」が HTML になるので、検索エンジンや
          JavaScript が動く前の表示でも記事が並ぶ。URL に絞り込みがあれば、ブラウザで描画したときに切り替わる */}
      <Suspense fallback={<PublicPostListView cards={cards} allTags={allTags} query="" />}>
        <PublicPostListFromUrl cards={cards} allTags={allTags} />
      </Suspense>
    </>
  );
}
