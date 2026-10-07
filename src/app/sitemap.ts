import type { MetadataRoute } from 'next';
import { getPublishedPostsForSitemap, getHistoryEventsList } from '@/db/queries/select';
import { SITE_URL as BASE_URL } from '@/lib/siteMetadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, historyEvents] = await Promise.all([getPublishedPostsForSitemap(), getHistoryEventsList()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL },
    { url: `${BASE_URL}/blogs` },
    { url: `${BASE_URL}/products` },
    { url: `${BASE_URL}/books` },
    { url: `${BASE_URL}/career` },
    { url: `${BASE_URL}/history` },
    { url: `${BASE_URL}/awards` },
    { url: `${BASE_URL}/qualifications` },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/${post.genre}/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  // 年表の出来事は詳細本文があるものだけ個別ページを持つ
  // 記事にリンクしている出来事の個別ページは、その記事へ移動（307）するだけなので載せない
  // （移動するだけの URL をサイトマップに載せると、検索エンジンにとって無駄な URL になる。記事の URL は postRoutes に載っている）
  const historyRoutes: MetadataRoute.Sitemap = historyEvents
    .filter((event) => event.content.trim() !== '' && !event.productSlug)
    .map((event) => ({ url: `${BASE_URL}/history/${event.id}`, lastModified: event.updatedAt }));

  return [...staticRoutes, ...postRoutes, ...historyRoutes];
}
