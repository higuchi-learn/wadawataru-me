import type { Metadata } from 'next';
import { getPostById } from '@/db/queries/select';

// blogs/products/books の各 [slug]/page.tsx から generateMetadata として re-export して使う
// 記事が見つからない場合は空を返す（ページ本体側の notFound() で 404 になる）
export async function generatePostMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostById(slug);
  if (!post) return {};

  // 手動サムネイルが設定されていればそれを、無ければタイトルから自動生成した画像をOGP画像として使う
  // /api/og は常に1200x630のPNGを返す（Card.tsx等でのサムネイル表示にも使うので aspect-video 相当）
  // 手動サムネイルは実際のサイズが分からないため width/height は付けない
  const ogImage = post.thumbnail
    ? { url: post.thumbnail }
    : { url: `/api/og?title=${encodeURIComponent(post.title)}`, width: 1200, height: 630 };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}
