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

  return {
    title: post.title,
    description: post.description,
  };
}
