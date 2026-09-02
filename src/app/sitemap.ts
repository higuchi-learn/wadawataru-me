import type { MetadataRoute } from 'next';
import { getPublishedPostsForSitemap } from '@/db/queries/select';

const BASE_URL = 'https://wadawataru.me';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPostsForSitemap();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL },
    { url: `${BASE_URL}/blogs` },
    { url: `${BASE_URL}/products` },
    { url: `${BASE_URL}/books` },
    { url: `${BASE_URL}/career` },
    { url: `${BASE_URL}/awards` },
    { url: `${BASE_URL}/qualifications` },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/${post.genre}/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [...staticRoutes, ...postRoutes];
}
