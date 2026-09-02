import type { Metadata } from 'next';
import { getPostById } from '@/db/queries/select';

// blogs/products/books の各 [slug]/page.tsx から generateMetadata として re-export して使う
// 記事が見つからない場合は空を返す（ページ本体側の notFound() で 404 になる）
export async function generatePostMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostById(slug);
  if (!post) return {};

  // 手動サムネイルが設定されていなければ、タイトルから自動生成した画像をOGP画像として使う
  const ogImageUrl = post.thumbnail ?? `/api/og?title=${encodeURIComponent(post.title)}`;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [ogImageUrl],
    },
  };
}
